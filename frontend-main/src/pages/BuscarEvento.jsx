import "../styles/Usuario.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import GatoImg from "../assets/Gato.png";
import eventoDefaultImg from "../assets/evento.png";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";

function BuscarEvento() {
  const [usuario, setUsuario] = useState({ email: "Cargando..." });
  const [search, setSearch] = useState("");
  const [fecha, setFecha] = useState("");
  const [eventos, setEventos] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("user_id");

    if (!token) {
      navigate("/login");
      return;
    }

    if (userId) {
      fetch(`http://127.0.0.1:8000/api/usuarios/${userId}/`, {
        headers: { Authorization: `Token ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          setUsuario({ email: data.email || "Usuario" });
        })
        .catch(err => {
          console.error("Error cargando usuario:", err);
          setUsuario({ email: localStorage.getItem("user_email") || "Usuario" });
        });
    } else {
      setUsuario({ email: localStorage.getItem("user_email") || "Usuario" });
    }
  }, [navigate]);

  const buscarEventos = useCallback(() => {
    let url = "http://127.0.0.1:8000/api/eventos/?";
    if (search) url += `search=${search}&`;
    if (fecha) url += `fecha=${fecha}&`;

    fetch(url)
      .then(response => response.json())
      .then(data => setEventos(data))
      .catch(error => console.error("Error al buscar:", error));
  }, [search, fecha]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      buscarEventos();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [buscarEventos]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const getImagenEvento = (evento) => {
    if (!evento?.imagen) {
      return eventoDefaultImg;
    }

    if (evento.imagen.startsWith("http")) {
      return evento.imagen;
    }

    return `http://127.0.0.1:8000/media/${evento.imagen}`;
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
            <Link to="/usuario">🏠 Inicio</Link>
            <Link to="/usuario/buscar-evento" className="active">
              🔍 Buscar evento
            </Link>
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
          <h1>Búsqueda de eventos</h1>

          <div className="search-container">
            <input
              type="text"
              placeholder="Buscar evento (Nombre o Ubicación)"
              className="search-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <input
              type="date"
              className="date-input"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
            />
          </div>

          <section className="user-events-container">
            {eventos.length > 0 ? (
              eventos.map(ev => (
                <div key={ev.id} className="user-event-card">
                  <img
                    src={getImagenEvento(ev)}
                    alt={ev.nombre}
                    className="user-event-img"
                    onError={(e) => (e.target.src = eventoDefaultImg)}
                  />
                  <h3>{ev.nombre}</h3>
                  <p>{new Date(ev.fecha_inicio).toLocaleDateString()}</p>

                  <Link to={`/usuario/evento/${ev.id}`}>
                    <button className="admin-btn">Ver detalles</button>
                  </Link>
                </div>
              ))
            ) : (
              <p>No hay eventos que coincidan con la búsqueda.</p>
            )}
          </section>
        </main>
      </div>

      <Footer />
    </>
  );
}

export default BuscarEvento;
