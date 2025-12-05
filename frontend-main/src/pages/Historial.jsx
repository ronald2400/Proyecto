import "../styles/Usuario.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import GatoImg from "../assets/Gato.png";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

const EyeIcon = ({ color = "#2563eb" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
);

const Card = ({ children }) => (
  <div className="user-card">{children}</div>
);

export default function Historial() {
  const [usuarioNombre, setUsuarioNombre] = useState("Usuario");
  const [reservas, setReservas] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Verificación de Seguridad
    const token = localStorage.getItem("token");
    if (!token) {
        navigate("/login");
        return;
    }
    setUsuarioNombre(localStorage.getItem("user_email") || "Usuario");

    // Carga Historial desde Backend
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
      .catch((error) => console.error("Error al cargar historial:", error));
  }, [navigate]);

  // Logout
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
            <Link to="/usuario/mis-reservas">📅 Mis reservas</Link>
            <Link to="/usuario/historial" className="active">📜 Historial</Link>
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
          <h1 className="user-page-title">Historial de reservas</h1>

          <Card>
            <div className="user-reservas-list">
              {reservas.length > 0 ? (
                  reservas.map((reserva) => (
                    <div key={reserva.id} className="user-reserva-item">

                      <span className="reserva-name">
                        {reserva.codigo_reserva} ({reserva.estado_reserva})
                      </span>
                      
                      <Link
                        to={`/usuario/reserva/${reserva.id}`}
                        className="user-reserva-link"
                      >
                        Ver detalle <EyeIcon />
                      </Link>
                    </div>
                  ))
              ) : (
                  <p style={{ padding: "20px", textAlign: "center", color: "#333" }}>No hay historial disponible.</p>
              )}
            </div>
          </Card>
        </main>
      </div>

      <Footer />
    </>
  );
}