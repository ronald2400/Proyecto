import { useParams, useNavigate, Link } from "react-router-dom"; 
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useEffect, useState } from "react";
import Gato from "../assets/Gato.png";

function VerReservaAdmin() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [reserva, setReserva] = useState(null);
  const [eventoInfo, setEventoInfo] = useState(null);
  const [usuarioInfo, setUsuarioInfo] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const rol = localStorage.getItem("user_rol");

    if (!token || rol !== 'admin') {
        navigate("/login");
        return;
    }

    const fetchAll = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:8000/api/reservas/${id}/`, {
          headers: { "Authorization": `Token ${token}` }
        });
        if (!res.ok) throw new Error("Reserva no encontrada");
        const data = await res.json();

        // Log para inspección rápida en DevTools (por favor copia/pega este objeto si sigue sin salir el nombre)
        console.log("Reserva raw:", data);

        setReserva(data);

        // Intentar obtener info del usuario de varias maneras
        const usuarioRef = data.usuario;

        const tryFetchUserByUrl = async (url) => {
          try {
            const fullUrl = url.startsWith("http") ? url : `http://127.0.0.1:8000${url}`;
            const r = await fetch(fullUrl, { headers: { "Authorization": `Token ${token}` }});
            if (r.ok) return await r.json();
          } catch (e) {
            // ignore
          }
          return null;
        };

        const tryFetchUserByIdCandidates = async (uid) => {
          const endpoints = [
            `http://127.0.0.1:8000/api/usuarios/${uid}/`,
            `http://127.0.0.1:8000/api/users/${uid}/`,
            `http://127.0.0.1:8000/api/auth/users/${uid}/`
          ];
          for (const ep of endpoints) {
            try {
              const r = await fetch(ep, { headers: { "Authorization": `Token ${token}` }});
              if (r.ok) return await r.json();
            } catch (e) {
              // continuar con siguiente
            }
          }
          return null;
        };

        if (usuarioRef && typeof usuarioRef === "object") {
          setUsuarioInfo(usuarioRef);
        } else if (usuarioRef && typeof usuarioRef === "string") {
          if (usuarioRef.includes("/api/") || usuarioRef.startsWith("/")) {
            const u = await tryFetchUserByUrl(usuarioRef);
            if (u) setUsuarioInfo(u);
          } else if (/^\d+$/.test(usuarioRef)) {
            const u = await tryFetchUserByIdCandidates(usuarioRef);
            if (u) setUsuarioInfo(u);
          } else {
            // username or email (no fetch)
            console.log("usuarioRef (string) no es id ni url:", usuarioRef);
          }
        } else if (usuarioRef && typeof usuarioRef === "number") {
          const u = await tryFetchUserByIdCandidates(usuarioRef);
          if (u) setUsuarioInfo(u);
        }

        // Conseguir evento (como antes)
        const eventoId = typeof data.evento === "object" ? data.evento.id : data.evento;
        const rEv = await fetch(`http://127.0.0.1:8000/api/eventos/${eventoId}/`, {
          headers: { "Authorization": `Token ${token}` }
        });
        if (!rEv.ok) throw new Error("Evento no encontrado");
        const evData = await rEv.json();
        setEventoInfo(evData);

      } catch (err) {
        console.error(err);
        alert("Error al cargar detalles.");
        navigate("/admin/reservas");
      }
    };

    fetchAll();
  }, [id, navigate]);

  const handleLogout = () => {
      localStorage.clear();
      navigate("/login");
  };

  function parseToDate(value) {
    if (!value) return null;
    if (value instanceof Date) return value;

    if (typeof value === "object" && value !== null && value.hasOwnProperty('fecha_inicio')) {
      value = value.fecha_inicio;
    }

    let d = new Date(value);
    if (!isNaN(d)) return d;

    const s1 = String(value).replace(" ", "T");
    d = new Date(s1);
    if (!isNaN(d)) return d;

    const s2 = s1 + "Z";
    d = new Date(s2);
    if (!isNaN(d)) return d;

    return null;
  }

  function formatDateTime(value) {
    const d = parseToDate(value);
    if (!d) return "N/A";
    return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }

  // Búsqueda recursiva de campos de nombre en un objeto usuario
  const findNameInObject = (obj, depth = 0) => {
    if (!obj || depth > 4) return null;
    if (typeof obj === "string") {
      // si es cadena y no es email, puede ser un nombre o username
      if (!obj.includes("@") && obj.trim().length > 0) return obj.trim();
      return null;
    }
    if (typeof obj !== "object") return null;

    // keys que típicamente contienen nombre
    const nameKeys = [
      "nombre", "name", "full_name", "fullName", "first_name", "firstName",
      "last_name", "lastName", "display_name", "username", "nombre_completo",
      "nombreCompleto", "nombreUsuario", "nombreApellido"
    ];

    for (const k of nameKeys) {
      if (k in obj && typeof obj[k] === "string" && obj[k].trim().length > 0) {
        return obj[k].trim();
      }
    }

    // Combine first + last if ambos existen
    const fn = obj.first_name || obj.firstName || obj.nombre;
    const ln = obj.last_name || obj.lastName;
    if ((fn || ln) && (typeof fn === "string" || typeof ln === "string")) {
      const parts = [fn || "", ln || ""].map(p => (p || "").trim()).filter(Boolean);
      if (parts.length) return parts.join(" ");
    }

    // Buscar recursivamente en valores del objeto
    for (const val of Object.values(obj)) {
      const found = findNameInObject(val, depth + 1);
      if (found) return found;
    }
    return null;
  };

  const extractNameFromUserObj = (u) => {
    return findNameInObject(u);
  };

  const extractEmailFromUserObj = (u) => {
    if (!u) return null;
    if (typeof u === "string") return u.includes("@") ? u : null;
    if (typeof u === "object") {
      // keys comunes de email
      const emailKeys = ["email", "correo", "mail", "user_email"];
      for (const k of emailKeys) {
        if (k in u && typeof u[k] === "string" && u[k].includes("@")) return u[k];
      }
      // buscar recursivamente si es necesario
      for (const val of Object.values(u)) {
        if (typeof val === "string" && val.includes("@")) return val;
        if (typeof val === "object") {
          const nested = extractEmailFromUserObj(val);
          if (nested) return nested;
        }
      }
    }
    return null;
  };

  if (!reserva || !eventoInfo) {
    return (
        <>
            <Header />
            <div className="admin-content" style={{textAlign: "center", marginTop: "50px"}}>
                <p>Cargando reserva...</p>
            </div>
            <Footer />
        </>
    );
  }

  // Determinar nombre a mostrar con prioridad:
  // 1) nombre_contacto explícito
  // 2) usuarioInfo traído desde API (si existe)
  // 3) usuario embebido en la reserva (si existe)
  // 4) username no-email
  // 5) parte local del email
  const nombreDesdeUsuarioInfo = extractNameFromUserObj(usuarioInfo);
  const nombreDesdeUsuarioEmbebido = extractNameFromUserObj(reserva.usuario && typeof reserva.usuario === "object" ? reserva.usuario : null);

  let nombreMostrar = reserva.nombre_contacto || nombreDesdeUsuarioInfo || nombreDesdeUsuarioEmbebido || null;

  if (!nombreMostrar) {
    if (typeof reserva.usuario === "string" && !reserva.usuario.includes("@")) {
      nombreMostrar = reserva.usuario;
    } else if (reserva.email_contacto) {
      nombreMostrar = reserva.email_contacto.split("@")[0];
    } else if (typeof reserva.usuario === "string" && reserva.usuario.includes("@")) {
      nombreMostrar = reserva.usuario.split("@")[0];
    }
  }

  if (!nombreMostrar) nombreMostrar = "Usuario Registrado";

  // Email a mostrar
  const emailDesdeUsuarioInfo = extractEmailFromUserObj(usuarioInfo);
  const emailMostrar = reserva.email_contacto || emailDesdeUsuarioInfo || (typeof reserva.usuario === "string" && reserva.usuario.includes("@") ? reserva.usuario : "No registrado");

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
            <Link to="/admin/reservas" className="active">📋 Gestión de reservas</Link>
            <Link to="/admin/reportes">📊 Reportes</Link>
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
          <h1>Detalle de la Reserva</h1>

          <div className="ver-evento-card">

            <div className="ver-evento-info">
              <p><strong>Nombre:</strong> {nombreMostrar}</p>
              <p><strong>Email:</strong> {emailMostrar}</p>
              
              <hr style={{margin: "15px 0", border: "0", borderTop: "1px solid #eee"}}/>

              <p><strong>Código:</strong> {reserva.codigo_reserva}</p>
              <p><strong>Evento:</strong> {eventoInfo.nombre}</p>
              <p><strong>Fecha Evento:</strong> {formatDateTime(eventoInfo.fecha_inicio)}</p>
              <p><strong>Fecha Reserva:</strong> {formatDateTime(reserva.fecha_reserva)}</p>
              <p><strong>N° Personas:</strong> {reserva.cantidad_plazas}</p>
              
              <p>
                <strong>Estado:</strong>{" "}
                <span className={`estado-reserva`} style={{
                    color: reserva.estado_reserva === 'cancelada' ? 'red' : 'green',
                    fontWeight: 'bold',
                    textTransform: 'uppercase'
                }}>
                  {reserva.estado_reserva}
                </span>
              </p>

              <div className="ver-evento-botones">
                <button
                  className="admin-btn outline"
                  onClick={() => navigate("/admin/reservas")}
                >
                  Volver
                </button>
              </div>
            </div>

          </div>
        </main>
      </div>

      <Footer />
    </>
  );
}

export default VerReservaAdmin;