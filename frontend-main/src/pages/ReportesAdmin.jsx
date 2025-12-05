import "../styles/Administrador.css";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useEffect, useState } from "react";
import Gato from "../assets/Gato.png";

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

  
  const descargarCSV = () => {
      const token = localStorage.getItem("token");
      
      let url = `http://127.0.0.1:8000/api/reservas/reporte/?`;
      if (busqueda) url += `search=${busqueda}&`;
      if (desde) url += `fecha_inicio=${desde}&`; 
      if (hasta) url += `fecha_fin=${hasta}&`;     

      fetch(url, {
          headers: { "Authorization": `Token ${token}` }
      })
      .then(response => response.blob())
      .then(blob => {
          const url = window.URL.createObjectURL(new Blob([blob]));
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', 'reporte_reservas.csv');
          document.body.appendChild(link);
          link.click();
          link.parentNode.removeChild(link);
      })
      .catch(err => alert("Error al descargar el reporte"));
  };


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
     
            <button 
                onClick={descargarCSV}
                className="admin-btn"
                style={{backgroundColor: "#2563eb", color: "white", padding: "10px 20px", border: "none", borderRadius: "5px", cursor: "pointer"}}
            >
                📥 Descargar Excel (CSV)
            </button>
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