import "../styles/Usuario.css";
import GatoImg from "../assets/Gato.png";
import eventoDefaultImg from "../assets/evento.png";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

function UserEventCard({ evento }) {
  return (
    <div className="user-event-card">
      <img
        src={eventoDefaultImg}
        alt={evento.nombre}
        className="user-event-img"
      />
      <h3>{evento.nombre}</h3>
      <Link to={`/usuario/evento/${evento.id}`}>
        <button className="admin-btn">Ver detalles</button>
      </Link>
    </div>
  );
}
 
function Usuario() {
  const [usuario, setUsuario] = useState({
      nombre: "Cargando...",
      email: ""
  });
  const [eventosActivos, setEventosActivos] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("user_id");

    if (!token) {
        alert("Debes iniciar sesión para ver esta página.");
        navigate("/login");
        return;
    }


    if (userId) {
        fetch(`http://127.0.0.1:8000/api/usuarios/${userId}/`, {
            headers: { "Authorization": `Token ${token}` }
        })
        .then(res => res.json())
        .then(data => {
            const nombreMostrar = data.nombre ? `${data.nombre} ${data.apellido || ''}` : data.email;
            setUsuario({
                nombre: nombreMostrar,
                email: data.email
            });
        })
        .catch(err => {
            console.error("Error cargando usuario:", err);
            setUsuario({
                nombre: localStorage.getItem("user_email") || "Usuario",
                email: localStorage.getItem("user_email")
            });
        });
    }

    fetch("http://127.0.0.1:8000/api/eventos/")
      .then((response) => response.json())
      .then((data) => {
        setEventosActivos(data);
      })
      .catch((error) => console.error("Error eventos:", error));

  }, [navigate]);

  const handleLogout = () => {
      localStorage.clear();
      navigate("/login");
  };

  return (
    <>
      <Header />

      <div className="user-layout">
        <aside className="user-sidebar">
          <div className="user-profile">
            <img src={GatoImg} alt="usuario" className="user-avatar" />
            <h3>{usuario.email}</h3>
          </div>

          <nav className="user-menu">
            <Link to="/usuario" className="active">🏠 Inicio</Link>
            <Link to="/usuario/buscar-evento">🔍 Buscar evento</Link>
            <Link to="/usuario/mis-reservas">📅 Mis reservas</Link>
            <Link to="/usuario/historial">📜 Historial</Link>
          </nav>

          <div className="user-logout">
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

        <main className="user-content">
       
          <h1>Hola, {usuario.nombre}!</h1>
          <h2>Eventos activos</h2>

          <section className="user-events-container">
            {eventosActivos.length > 0 ? (
                eventosActivos.map(evento => (
                  <UserEventCard key={evento.id} evento={evento} />
                ))
            ) : (
                <p>Cargando eventos...</p>
            )}
          </section>
        </main>
      </div>

      <Footer />
    </>
  );
}

export default Usuario;