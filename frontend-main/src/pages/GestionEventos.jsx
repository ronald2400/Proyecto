import "../styles/Administrador.css";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Gato from "../assets/Gato.png";

function GestionEventos() {
  const [eventos, setEventos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
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
          if (Array.isArray(data)) setEventos(data);
      })
      .catch(err => console.error("Error cargando eventos:", err));
  }, [navigate]);

  
  const eliminarEvento = async (id) => {
    const confirmar = window.confirm("¿Seguro que deseas eliminar este evento? Esta acción no se puede deshacer.");
    if (!confirmar) return;

    try {
        const token = localStorage.getItem("token");
        const res = await fetch(`http://127.0.0.1:8000/api/eventos/${id}/`, {
            method: "DELETE",
            headers: { "Authorization": `Token ${token}` }
        });

        if (res.ok) {
            setEventos(eventos.filter(evento => evento.id !== id));
            alert("Evento eliminado correctamente.");
        } else {
            alert("Error al eliminar el evento.");
        }
    } catch (error) {
        console.error(error);
        alert("Error de conexión.");
    }
  };

  const eventosFiltrados = eventos.filter(evento =>
    evento.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

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

          <h1>Gestión de eventos</h1>

          <div className="eventos-toolbar">
            <input
              type="text"
              placeholder="Buscar evento..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />

            <Link to="/admin/eventos/crear">
              <button className="admin-btn">➕ Crear evento</button>
            </Link>
          </div>

          <table className="tabla-eventos">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Fecha</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {eventosFiltrados.length > 0 ? (
                  eventosFiltrados.map((evento) => (
                    <tr key={evento.id}>
                      <td>{evento.nombre}</td>
                      <td>{new Date(evento.fecha_inicio).toLocaleDateString()}</td>
                      <td className="acciones">

                        <Link to={`/admin/eventos/${evento.id}`}>
                          <button title="Ver">👁</button>
                        </Link>

                        <Link to={`/admin/eventos/editar/${evento.id}`}>
                          <button title="Editar">✏️</button>
                        </Link>

                        <button onClick={() => eliminarEvento(evento.id)} title="Eliminar" style={{cursor: "pointer"}}>
                          🗑
                        </button>

                      </td>
                    </tr>
                  ))
              ) : (
                  <tr>
                      <td colSpan="3" style={{textAlign: "center"}}>No hay eventos registrados.</td>
                  </tr>
              )}
            </tbody>
          </table>

        </main>
      </div>

      <Footer />
    </>
  );
}

export default GestionEventos;