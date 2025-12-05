import "../styles/Administrador.css";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useEffect, useState } from "react";
import Gato from "../assets/Gato.png";

function GestionReservasAdmin() {
  const [reservas, setReservas] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const rol = localStorage.getItem("user_rol");

    if (!token || rol !== 'admin') {
        navigate("/login");
        return;
    }

    fetch("http://127.0.0.1:8000/api/reservas/", {
        headers: { "Authorization": `Token ${token}` }
    })
      .then(res => res.json())
      .then(data => {
          if (Array.isArray(data)) setReservas(data);
      })
      .catch(err => console.error("Error cargando reservas:", err));
  }, [navigate]);


  const reservasFiltradas = reservas.filter((reserva) => {
    const termino = busqueda.toLowerCase();

    const usuario = reserva.usuario ? reserva.usuario.toLowerCase() : "";
    const evento = reserva.evento ? reserva.evento.toString().toLowerCase() : ""; // Evento puede ser ID o nombre
    const codigo = reserva.codigo_reserva ? reserva.codigo_reserva.toLowerCase() : "";

    return usuario.includes(termino) || evento.includes(termino) || codigo.includes(termino);
  });

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

          <h1>Gestión de reservas</h1>
          <div className="eventos-toolbar">
            <div className="buscador" style={{width: "100%", display: "flex"}}>
              <input
                type="text"
                placeholder="Buscar por código, usuario o evento..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                style={{minWidth: "300px"}}
              />
            </div>
          </div>

          <div className="tabla-container">
            <table className="tabla-eventos">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Usuario</th>
                  <th>Fecha Reserva</th>
                  <th>Estado</th>
                  <th>Acción</th>
                </tr>
              </thead>

              <tbody>
                {reservasFiltradas.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{textAlign: "center"}}>No se encontraron reservas</td>
                  </tr>
                ) : (
                  reservasFiltradas.map((reserva) => (
                    <tr key={reserva.id}>
                      <td>{reserva.codigo_reserva}</td>
                      <td>{reserva.usuario || "Invitado"}</td>
                      <td>{new Date(reserva.fecha_reserva).toLocaleDateString()}</td>
                      <td>
                          <span style={{color: reserva.estado_reserva === 'cancelada' ? 'red' : 'green'}}>
                              {reserva.estado_reserva}
                          </span>
                      </td>
                      <td>
                        <Link to={`/admin/reservas/ver/${reserva.id}`}>
                          <button className="admin-btn">Ver Detalle</button>
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

        </main>
      </div>

      <Footer />
    </>
  );
}

export default GestionReservasAdmin;