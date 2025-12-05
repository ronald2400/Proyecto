import "../styles/Usuario.css";
import GatoImg from "../assets/Gato.png";
import eventoDefaultImg from "../assets/evento.png";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

function MisReservas() {
  const [reservas, setReservas] = useState([]);
  const [usuarioNombre, setUsuarioNombre] = useState("Usuario");
  const navigate = useNavigate();
 
  useEffect(() => {

    const token = localStorage.getItem("token");
    if (!token) {
        alert("Debes iniciar sesión.");
        navigate("/login");
        return;
    }

  
    const emailStored = localStorage.getItem("user_email") || "Usuario";
    setUsuarioNombre(emailStored);

  
    fetch("http://127.0.0.1:8000/api/reservas/", {
        headers: {
            "Authorization": `Token ${token}`
        }
    })
      .then((response) => {
          if (response.status === 401) {
              localStorage.clear();
              navigate("/login");
              return [];
          }
          return response.json();
      })
      .then((data) => {
          if (Array.isArray(data)) {
              setReservas(data);
          }
      })
      .catch((error) => console.error("Error cargando reservas:", error));
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
            <h3>{usuarioNombre}</h3>
          </div>

          <nav className="user-menu">
            <Link to="/usuario">🏠 Inicio</Link>
            <Link to="/usuario/buscar-evento">🔍 Buscar evento</Link>
            <Link to="/usuario/mis-reservas" className="active">📅 Mis reservas</Link>
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
          <h1 className="text-3xl font-semibold text-green-800 mb-6">Mis reservas</h1>

          <section className="user-events-container">
            {reservas.length > 0 ? (
                reservas.map((res) => (
                  <div key={res.id} className="user-event-card">
                    <img
                      src={eventoDefaultImg}
                      alt="Evento"
                      className="user-event-img"
                    />
                    
                    <div style={{ padding: "10px" }}>
                        <h3 className="text-lg font-semibold mt-2">Reserva: {res.codigo_reserva}</h3>
                        <p>Estado: {res.estado_reserva}</p>
                        <p>Plazas: {res.cantidad_plazas}</p>
                    </div>

                    <Link to={`/usuario/reserva/${res.id}`} style={{ textDecoration: "none" }}>
                    <button className="admin-btn" style={{ width: "100%", marginTop: "10px" }}>Ver detalles</button>
                    </Link>
                  </div>
                ))
            ) : (
                <p>No tienes reservas activas.</p>
            )}
          </section>
        </main>
      </div>

      <Footer />
    </>
  );
}

export default MisReservas;