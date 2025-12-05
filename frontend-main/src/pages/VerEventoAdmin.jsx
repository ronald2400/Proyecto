import "../styles/Administrador.css";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Gato from "../assets/Gato.png";
import eventoDefaultImg from "../assets/evento.png"; 

function VerEventoAdmin() {
  const { id } = useParams();
  const [evento, setEvento] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {

    const token = localStorage.getItem("token");
    const rol = localStorage.getItem("user_rol");

    if (!token || rol !== 'admin') {
        navigate("/login");
        return;
    }

   
    fetch(`http://127.0.0.1:8000/api/eventos/${id}/`, {
        headers: { "Authorization": `Token ${token}` }
    })
      .then((res) => {
        if (!res.ok) throw new Error("Evento no encontrado");
        return res.json();
      })
      .then((data) => setEvento(data))
      .catch((err) => {
        console.error(err);
        alert("No se pudo cargar el evento.");
        navigate("/admin/eventos");
      });
  }, [id, navigate]);

  const handleLogout = () => {
      localStorage.clear();
      navigate("/login");
  };

  if (!evento) {
    return (
      <>
        <Header />
        <div className="admin-content" style={{textAlign: "center", marginTop: "50px"}}>
          <p>Cargando evento...</p>
        </div>
        <Footer />
      </>
    );
  }

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
            <Link to="/admin/eventos" className="active">📅 Gestión de eventos</Link>
            <Link to="/admin/reservas">📋 Gestión de reservas</Link>
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

          <h1>Detalle del evento</h1>

          <div className="ver-evento-card">

            <div className="ver-evento-imagen">
              <img
                src={eventoDefaultImg}
                alt={evento.nombre}
                className="imagen-evento-detalle"
              />
            </div>

            <div className="ver-evento-info">
              <p><strong>Nombre:</strong> {evento.nombre}</p>
              
              <p><strong>Fecha Inicio:</strong> {new Date(evento.fecha_inicio).toLocaleDateString()} {new Date(evento.fecha_inicio).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
              <p><strong>Fecha Fin:</strong> {new Date(evento.fecha_fin).toLocaleDateString()} {new Date(evento.fecha_fin).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
              
              <p><strong>Ubicación:</strong> {evento.ubicacion}</p>
              <p><strong>Capacidad:</strong> {evento.capacidad} personas</p>
              <p><strong>Estado:</strong> {evento.estado}</p>

              <p><strong>Descripción:</strong></p>
              <p>{evento.descripcion}</p>

              <div className="ver-evento-botones">
                <Link to={`/admin/eventos/editar/${evento.id}`}>
                  <button className="admin-btn">✏️ Editar</button>
                </Link>

                <Link to="/admin/eventos">
                  <button className="admin-btn outline">⬅ Volver</button>
                </Link>
              </div>
            </div>

          </div>

        </main>
      </div>

      <Footer />
    </>
  );
}

export default VerEventoAdmin;