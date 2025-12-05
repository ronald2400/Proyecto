import "../styles/Administrador.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Gato from "../assets/Gato.png";
import { Link, useNavigate } from "react-router-dom"; 
import { useState, useEffect } from "react";

function AdminCard({ title, children, linkButtons }) {
  return (
    <div className="admin-card">
      
      <h3>{title}</h3>
      
 
      <div className="admin-card-content">
        {children}
      </div>

      {linkButtons && linkButtons.map((btn, index) => (
        <Link to={btn.to} key={index}>
          <button className={`admin-btn ${btn.outline ? 'outline' : ''}`}>
            {btn.label}
          </button>
        </Link>
      ))}
    </div>
  );
}


function Administrador() {
  const [eventosActivos, setEventosActivos] = useState(0);
  const [reservasTotales, setReservasTotales] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
 
    const token = localStorage.getItem("token");
    const rol = localStorage.getItem("user_rol");

    if (!token || rol !== 'admin') {
        alert("Acceso denegado. Solo administradores.");
        navigate("/login");
        return;
    }

    fetch("http://127.0.0.1:8000/api/eventos/", {
        headers: { "Authorization": `Token ${token}` }
    })
      .then(res => res.json())
      .then(data => {
          if (Array.isArray(data)) setEventosActivos(data.length);
      })
      .catch(err => console.error(err));

    fetch("http://127.0.0.1:8000/api/reservas/", {
        headers: { "Authorization": `Token ${token}` }
    })
      .then(res => res.json())
      .then(data => {
          if (Array.isArray(data)) setReservasTotales(data.length);
      })
      .catch(err => console.error(err));

  }, [navigate]);

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
            <Link to="/admin" className="active">🏠 Inicio</Link>
            <Link to="/admin/eventos">📅 Gestión de eventos</Link>
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
          <h1>Panel de Administración</h1>

          <section className="admin-cards">

            <AdminCard title="Eventos activos" style>
              <p className="admin-number">{eventosActivos}</p>
            </AdminCard>

            <AdminCard 
              title="Reportes"
              linkButtons={[{ to: "/admin/reportes", label: "Ver reportes" }]}
            >
              <p>Genera reportes detallados sobre eventos y reservas.</p>
            </AdminCard>

            <AdminCard 
              title="Gestión de eventos"
              linkButtons={[
                { to: "/admin/eventos/crear", label: "Crear nuevo evento" },
                { to: "/admin/eventos", label: "Ver todos los eventos", outline: true }
              ]}
            >
              <p>Administra y organiza eventos</p>
            </AdminCard>

            <AdminCard 
              title="Gestión de reservas"
              linkButtons={[{ to: "/admin/reservas", label: "Ver todas las reservas" }]}
            >
              <p>Total reservas: {reservasTotales}</p>
            </AdminCard>

          </section>
        </main>
      </div>

      <Footer />
    </>
  );
}

export default Administrador;