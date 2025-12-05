
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

  useEffect(() => {
    const token = localStorage.getItem("token");
    const rol = localStorage.getItem("user_rol");

    if (!token || rol !== 'admin') {
        navigate("/login");
        return;
    }


    fetch(`http://127.0.0.1:8000/api/reservas/${id}/`, {
        headers: { "Authorization": `Token ${token}` }
    })
      .then(res => {
          if (!res.ok) throw new Error("Reserva no encontrada");
          return res.json();
      })
      .then(data => {
          setReserva(data);
    
          return fetch(`http://127.0.0.1:8000/api/eventos/${data.evento}/`, {
              headers: { "Authorization": `Token ${token}` }
          });
      })
      .then(res => res.json())
      .then(dataEvento => setEventoInfo(dataEvento))
      .catch(err => {
          console.error(err);
          alert("Error al cargar detalles.");
          navigate("/admin/reservas");
      });
  }, [id, navigate]);

  const handleLogout = () => {
      localStorage.clear();
      navigate("/login");
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

  const nombreMostrar = reserva.nombre_contacto || reserva.usuario_nombre || "Usuario Registrado";
  const emailMostrar = reserva.email_contacto || reserva.usuario;

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
              <p><strong>Teléfono:</strong> {reserva.telefono_contacto || "No registrado"}</p>
              
              <hr style={{margin: "15px 0", border: "0", borderTop: "1px solid #eee"}}/>

              <p><strong>Código:</strong> {reserva.codigo_reserva}</p>
              <p><strong>Evento:</strong> {eventoInfo.nombre}</p>
              <p><strong>Fecha Evento:</strong> {new Date(eventoInfo.fecha_inicio).toLocaleDateString()} {new Date(eventoInfo.fecha_inicio).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
              <p><strong>Fecha Reserva:</strong> {new Date(reserva.fecha_reserva).toLocaleDateString()}</p>
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