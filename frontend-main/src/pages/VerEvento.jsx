import "../styles/Usuario.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import GatoImg from "../assets/Gato.png";
import eventoDefaultImg from "../assets/evento.png"; 
import { Link, useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
);

const LocationIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M21 10c0 6-9 12-9 12S3 16 3 10a9 9 0 1 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
);

export default function VerEvento() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [evento, setEvento] = useState(null);
  const [usuarioNombre, setUsuarioNombre] = useState("Usuario");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
        navigate("/login");
        return;
    }
    setUsuarioNombre(localStorage.getItem("user_email") || "Usuario");

    fetch(`http://127.0.0.1:8000/api/eventos/${id}/`)
      .then((res) => {
        if (!res.ok) throw new Error("Evento no encontrado");
        return res.json();
      })
      .then((data) => setEvento(data))
      .catch((err) => {
        console.error(err);
        alert("No se pudo cargar el evento.");
        navigate("/usuario");
      });
  }, [id, navigate]);

  const handleLogout = () => {
      localStorage.clear();
      navigate("/login");
  };

  if (!evento) return <div style={{textAlign: 'center', marginTop: '50px'}}>Cargando detalles del evento...</div>;

  const fechaFormateada = new Date(evento.fecha_inicio).toLocaleDateString();
  const horaFormateada = new Date(evento.fecha_inicio).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

  return (
    <>
      <Header />

      <div className="user-layout">
        <aside className="user-sidebar">
          <div className="user-profile">
            <img src={GatoImg} alt="usuario" className="user-avatar" />
            <h3>{usuarioNombre}</h3>
          </div>

          <nav className="user-menu">
            <Link to="/usuario">🏠 Inicio</Link>
            <Link to="/usuario/buscar-evento">🔍 Buscar evento</Link>
            <Link to="/usuario/mis-reservas">📅 Mis reservas</Link>
            <Link to="/usuario/historial">📜 Historial</Link>
          </nav>

          <div className="user-logout">
            <span onClick={handleLogout} style={{cursor: "pointer", color: "inherit"}}>
                Cerrar sesión
            </span>
          </div>
        </aside>

        <main className="user-content">
          <div className="event-detail-card">
            <img 
                src={eventoDefaultImg} 
                alt={evento.nombre} 
                className="event-detail-img" 
            />

            <div className="event-detail-info">
              <h1 className="event-title">{evento.nombre}</h1>
              <p className="event-description">{evento.descripcion}</p>

              <div className="event-meta">
                <div className="event-meta-item">
                  <CalendarIcon />
                  <span>{fechaFormateada} - {horaFormateada}</span>
                </div>
                
                <div className="event-meta-item">
                  <LocationIcon />
                  <span>{evento.ubicacion}</span>
                </div>

                <div className="event-meta-item">
                    <span style={{fontWeight: 'bold', color: evento.cupos_disponibles > 0 ? 'green' : 'red'}}>
                        Cupos: {evento.cupos_disponibles}
                    </span>
                </div>
              </div>

              <div className="event-buttons">
                
                
                {evento.cupos_disponibles > 0 ? (
                    <Link to={`/usuario/evento/${evento.id}/reservar`} className="btn btn-reserve">
                    Reservar
                    </Link>
                ) : (
                    <button className="btn btn-reserve" disabled style={{backgroundColor: 'gray', cursor: 'not-allowed'}}>
                        Agotado
                    </button>
                )}
                <button className="btn btn-back" onClick={() => navigate(-1)}>
                  ← Volver
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