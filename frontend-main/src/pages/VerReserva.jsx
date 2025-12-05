import "../styles/Usuario.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import GatoImg from "../assets/Gato.png";

const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
);

export default function VerReserva() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [reserva, setReserva] = useState(null);
  const [eventoInfo, setEventoInfo] = useState(null);
  const [usuarioNombre, setUsuarioNombre] = useState("Usuario");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
        navigate("/login");
        return;
    }
    setUsuarioNombre(localStorage.getItem("user_email") || "Usuario");

    fetch(`http://127.0.0.1:8000/api/reservas/${id}/`, {
        headers: { "Authorization": `Token ${token}` }
    })
      .then(res => {
          if (!res.ok) throw new Error("Reserva no encontrada");
          return res.json();
      })
      .then(data => {
          setReserva(data);
 
          return fetch(`http://127.0.0.1:8000/api/eventos/${data.evento}/`);
      })
      .then(res => res.json())
      .then(eventoData => setEventoInfo(eventoData))
      .catch(err => {
          console.error(err);
          alert("No se pudo cargar la información.");
          navigate("/usuario/mis-reservas");
      });
  }, [id, navigate]);


  const handleCancelar = async () => {
    if (!window.confirm("¿Estás seguro de que deseas cancelar esta reserva?")) return;

    try {
        const token = localStorage.getItem("token");
        const res = await fetch(`http://127.0.0.1:8000/api/reservas/${id}/cancelar/`, {
            method: "PATCH",
            headers: { "Authorization": `Token ${token}` }
        });

        if (res.ok) {
            alert("Reserva cancelada exitosamente.");
            navigate("/usuario/mis-reservas");
        } else {
            alert("Error al cancelar la reserva.");
        }
    } catch (error) {
        console.error(error);
        alert("Error de conexión.");
    }
  };


  const handleLogout = () => {
      localStorage.clear();
      navigate("/login");
  };

  if (!reserva || !eventoInfo) return <div style={{textAlign: "center", marginTop: "50px"}}>Cargando detalles...</div>;

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
          <h1 className="text-3xl font-semibold text-green-800 mb-6">
            Detalle de Reserva
          </h1>

          <div className="card p-6 bg-white rounded-xl shadow-md">
            <h2 className="text-xl font-semibold mb-4">{eventoInfo.nombre}</h2>

            <div className="mb-2 flex items-center gap-2">
              <CalendarIcon /> 
              <span>
                  {new Date(eventoInfo.fecha_inicio).toLocaleDateString()} - {new Date(eventoInfo.fecha_inicio).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </span>
            </div>

            <p className="mb-2"><strong>Código:</strong> {reserva.codigo_reserva}</p>
            <p className="mb-2">👥 Personas: {reserva.cantidad_plazas}</p>
            
            <p className="mb-4 font-medium" style={{color: reserva.estado_reserva === 'cancelada' ? 'red' : 'green'}}>
                Estado: {reserva.estado_reserva.toUpperCase()}
            </p>

            <div className="flex gap-2">
              <button className="btn btn-back" onClick={() => navigate(-1)}>
                ← Volver
              </button>
              
              {reserva.estado_reserva !== 'cancelada' && (
                  <button className="btn btn-cancel" onClick={handleCancelar}>
                    ❌ Cancelar Reserva
                  </button>
              )}
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </>
  );
}