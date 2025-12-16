import "../styles/Administrador.css";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useEffect, useState } from "react";
import Gato from "../assets/Gato.png";
// Si quieres usar la opción XLSX, instala: npm install xlsx
import * as XLSX from "xlsx";

function ReportesAdmin() {
  const [reportes, setReportes] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [tipoReporte, setTipoReporte] = useState("ocupacion");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const rol = localStorage.getItem("user_rol");

    if (!token || rol !== 'admin') {
        navigate("/login");
        return;
    }

    fetch("http://127.0.0.1:8000/api/eventos/", {
        headers: { "Authorization": `Token ${token}` }
    })
      .then(res => res.json())
      .then(data => {
          const datosFormateados = data.map(evento => ({
              id: evento.id,
              evento: evento.nombre,
              fecha: evento.fecha_inicio,
              plazas: evento.capacidad - evento.cupos_disponibles,
              capacidad: evento.capacidad,
              asistieron: evento.capacidad - evento.cupos_disponibles
          }));
          setReportes(datosFormateados);
      })
      .catch(err => console.error("Error cargando reportes:", err));
  }, [navigate]);

  const reportesFiltrados = reportes.filter((r) => {
    const coincideTexto = r.evento.toLowerCase().includes(busqueda.toLowerCase());
    const fechaEvento = new Date(r.fecha);
    const desdeObj = desde ? new Date(desde) : null;
    const hastaObj = hasta ? new Date(hasta) : null;

    if (desdeObj) desdeObj.setHours(0,0,0,0);
    if (hastaObj) hastaObj.setHours(23,59,59,999);

    const coincideDesde = desdeObj ? fechaEvento >= desdeObj : true;
    const coincideHasta = hastaObj ? fechaEvento <= hastaObj : true;

    return coincideTexto && coincideDesde && coincideHasta;
  });

  // ---------- Helper para CSV ----------
  const escapeCSV = (value) => {
    if (value == null) return '';
    const s = String(value);
    // dobles comillas escapadas como ""
    return `"${s.replace(/"/g, '""')}"`;
  };

  const formatDate = (isoDate) => {
    if (!isoDate) return "";
    const d = new Date(isoDate);
    // formato dd/mm/yyyy (cambiar si prefieres otro)
    return d.toLocaleDateString("es-ES");
  };

  // Opción 1: generar CSV en cliente (control total sobre columnas y formato)
  const descargarCSV = () => {
    if (reportesFiltrados.length === 0) {
      alert("No hay datos para descargar");
      return;
    }

    // Cambia a ',' si prefieres coma como separador
    const separator = ";";

    const headers = tipoReporte === "ocupacion"
      ? ["Nombre del evento", "Fecha", "Plazas Ocupadas", "Capacidad Total"]
      : ["Nombre del evento", "Fecha", "Asistieron", "% Ocupación"];

    const filas = reportesFiltrados.map(r => {
      const fechaStr = formatDate(r.fecha);
      if (tipoReporte === "ocupacion") {
        return [
          escapeCSV(r.evento),
          escapeCSV(fechaStr),
          escapeCSV(r.plazas),
          escapeCSV(r.capacidad)
        ].join(separator);
      } else {
        const porcentaje = r.capacidad > 0 ? ((r.asistieron / r.capacidad) * 100).toFixed(1) + "%" : "0%";
        return [
          escapeCSV(r.evento),
          escapeCSV(fechaStr),
          escapeCSV(r.asistieron),
          escapeCSV(porcentaje)
        ].join(separator);
      }
    });

    // Unir encabezado + filas
    const contenido = [
      headers.map(h => escapeCSV(h)).join(separator),
      ...filas
    ].join("\n");

    // BOM para Excel + UTF-8 para que muestre acentos
    const blob = new Blob(["\uFEFF" + contenido], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "reporte_reservas.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  // Opción 2: generar .xlsx con SheetJS (mejor si quieres abrir en Excel con más fidelidad)
  const descargarXLSX = () => {
    if (reportesFiltrados.length === 0) {
      alert("No hay datos para descargar");
      return;
    }

    // Construimos una matriz con objetos (o arrays)
    const data = reportesFiltrados.map(r => {
      const fechaStr = formatDate(r.fecha);
      if (tipoReporte === "ocupacion") {
        return {
          "Nombre del evento": r.evento,
          "Fecha": fechaStr,
          "Plazas Ocupadas": r.plazas,
          "Capacidad Total": r.capacidad
        };
      } else {
        const porcentaje = r.capacidad > 0 ? ((r.asistieron / r.capacidad) * 100).toFixed(1) : 0;
        return {
          "Nombre del evento": r.evento,
          "Fecha": fechaStr,
          "Asistieron": r.asistieron,
          "% Ocupación": porcentaje
        };
      }
    });

    // Crear workbook y worksheet
    const ws = XLSX.utils.json_to_sheet(data, { origin: "A1" });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Reporte");

    // Si quieres forzar tipos numéricos para columnas (ej: % como número), puedes postprocesar celdas
    // Ejemplo: convertir columna "% Ocupación" a número real si existe
    if (tipoReporte === "asistencia") {
      const range = XLSX.utils.decode_range(ws['!ref']);
      for (let R = range.s.r + 1; R <= range.e.r; ++R) {
        // Suponiendo que "% Ocupación" está en la 4ta columna (D) — si cambias columnas, ajusta
        const cellAddress = { c: 3, r: R }; // c=3 => D
        const cellRef = XLSX.utils.encode_cell(cellAddress);
        const cell = ws[cellRef];
        if (cell) {
          // convertir "12.3" string a número
          const n = parseFloat(cell.v);
          if (!isNaN(n)) {
            cell.v = n;
            cell.t = "n";
            // Nota: estilos no garantizados con community SheetJS
          }
        }
      }
    }

    // Descargar archivo
    XLSX.writeFile(wb, "reporte_reservas.xlsx");
  };

  const renderTabla = () => {
    if (reportesFiltrados.length === 0) {
      return (
        <tr>
          <td colSpan="4" style={{textAlign: "center"}}>No hay resultados</td>
        </tr>
      );
    }

    if (tipoReporte === "ocupacion") {
      return reportesFiltrados.map((r) => (
        <tr key={r.id}>
          <td>{r.evento}</td>
          <td>{new Date(r.fecha).toLocaleDateString()}</td>
          <td>{r.plazas}</td>
          <td>{r.capacidad}</td>
        </tr>
      ));
    }

    if (tipoReporte === "asistencia") {
      return reportesFiltrados.map((r) => (
        <tr key={r.id}>
          <td>{r.evento}</td>
          <td>{new Date(r.fecha).toLocaleDateString()}</td>
          <td>{r.asistieron}</td>
          <td>{r.capacidad > 0 ? ((r.asistieron / r.capacidad) * 100).toFixed(1) : 0}%</td>
        </tr>
      ));
    }
    return null;
  };

  const renderHeader = () => {
    if (tipoReporte === "ocupacion") {
      return (
        <tr>
          <th>Nombre del evento</th>
          <th>Fecha</th>
          <th>Plazas Ocupadas</th>
          <th>Capacidad Total</th>
        </tr>
      );
    }
    if (tipoReporte === "asistencia") {
      return (
        <tr>
          <th>Nombre del evento</th>
          <th>Fecha</th>
          <th>Asistieron</th>
          <th>% Ocupación</th>
        </tr>
      );
    }
    return null;
  };

  const handleLogout = () => {
      localStorage.clear();
      navigate("/login");
  };

  return (
    <>
      <Header />

      <div className="admin-layout">

        <aside className="admin-sidebar">
          <div className="admin-profile">
            <img src={Gato} alt="admin" className="admin-avatar" />
            <h3>Administrador</h3>
          </div>

          <nav className="admin-menu">
            <Link to="/admin">🏠 Inicio</Link>
            <Link to="/admin/usuarios">👥 Gestión de usuarios</Link>
            <Link to="/admin/eventos">📅 Gestión de eventos</Link>
            <Link to="/admin/reservas">📋 Gestión de reservas</Link>
            <Link to="/admin/reportes" className="active">📊 Reportes</Link>
          </nav>

          <div className="admin-logout">
            <span
                onClick={handleLogout}
                style={{
                    cursor: "pointer",
                    color: "inherit",
                    display: "block",
                    width: "100%",
                }}
            >
                Cerrar sesión
            </span>
          </div>
        </aside>

        <main className="admin-content">
          <div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
            <h1>Reportes</h1>

            <div style={{display: "flex", gap: "8px"}}>
              <button
                  onClick={descargarCSV}
                  className="admin-btn"
                  style={{backgroundColor: "#2563eb", color: "white", padding: "10px 20px", border: "none", borderRadius: "5px", cursor: "pointer"}}
              >
                  📥 Descargar CSV
              </button>
              <button
                  onClick={descargarXLSX}
                  className="admin-btn"
                  style={{backgroundColor: "#059669", color: "white", padding: "10px 20px", border: "none", borderRadius: "5px", cursor: "pointer"}}
              >
                  📥 Descargar XLSX
              </button>
            </div>
          </div>

          <div className="reportes-toolbar">
            <input
              type="text"
              placeholder="Buscar evento..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />

            <div className="fecha-filtros">
              <label>Desde</label>
              <input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} />
              <label>Hasta</label>
              <input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} />
            </div>

            <select value={tipoReporte} onChange={(e) => setTipoReporte(e.target.value)}>
              <option value="ocupacion">Reporte de ocupación</option>
              <option value="asistencia">Reporte de asistencia</option>
            </select>
          </div>

          <div className="tabla-container">
            <table className="tabla-eventos">
              <thead>{renderHeader()}</thead>
              <tbody>{renderTabla()}</tbody>
            </table>
          </div>
        </main>
      </div>

      <Footer />
    </>
  );
}

export default ReportesAdmin;