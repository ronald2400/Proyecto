import "../styles/Administrador.css";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Gato from "../assets/Gato.png";

function CrearEvento() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    fecha: "",
    hora: "",
    fecha_fin: "",
    hora_fin: "",
    capacidad: "",
    ubicacion: ""
  });

  const [imagen, setImagen] = useState(null);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const fechaInicioISO = `${form.fecha}T${form.hora}:00`;
    const fechaFinISO = `${form.fecha_fin}T${form.hora_fin}:00`;

    const formData = new FormData();
    formData.append("nombre", form.nombre);
    formData.append("descripcion", form.descripcion);
    formData.append("fecha_inicio", fechaInicioISO);
    formData.append("fecha_fin", fechaFinISO);
    formData.append("capacidad", parseInt(form.capacidad));
    formData.append("ubicacion", form.ubicacion);
    formData.append("estado", "activo");

    if (imagen) {
      formData.append("imagen", imagen);
    }

    try {
      const token = localStorage.getItem("token");

      const res = await fetch("http://127.0.0.1:8000/api/eventos/", {
        method: "POST",
        headers: {
          "Authorization": `Token ${token}`,
        },
        body: formData,
      });

      if (res.ok) {
        alert("Evento creado correctamente.");
        navigate("/admin/eventos");
      } else {
        const data = await res.json();
        console.error("Error backend:", data);
        alert("Error al crear evento.");
      }
    } catch (error) {
      console.error("Error de conexión:", error);
      alert("Error de conexión con el servidor.");
    }
  };

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
            <Link to="/admin/usuarios">👥 Gestión de usuarios</Link>
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
          <h1>Crear nuevo evento</h1>

          <form className="form-evento" onSubmit={handleSubmit}>

            <div className="form-group">
              <label>Nombre del evento</label>
              <input
                type="text"
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Descripción</label>
              <textarea
                name="descripcion"
                value={form.descripcion}
                onChange={handleChange}
                rows="4"
                required
              ></textarea>
            </div>

            <div className="form-group" style={{ display: "flex", gap: "10px" }}>
              <div style={{ flex: 1 }}>
                <label>Fecha Inicio</label>
                <input
                  type="date"
                  name="fecha"
                  value={form.fecha}
                  onChange={handleChange}
                  required
                />
              </div>
              <div style={{ flex: 1 }}>
                <label>Hora Inicio</label>
                <input
                  type="time"
                  name="hora"
                  value={form.hora}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group" style={{ display: "flex", gap: "10px" }}>
              <div style={{ flex: 1 }}>
                <label>Fecha Fin</label>
                <input
                  type="date"
                  name="fecha_fin"
                  value={form.fecha_fin}
                  onChange={handleChange}
                  required
                />
              </div>
              <div style={{ flex: 1 }}>
                <label>Hora Fin</label>
                <input
                  type="time"
                  name="hora_fin"
                  value={form.hora_fin}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Ubicación</label>
              <input
                type="text"
                name="ubicacion"
                value={form.ubicacion}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Capacidad (Personas)</label>
              <input
                type="number"
                name="capacidad"
                min="1"
                value={form.capacidad}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Imagen del evento</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImagen(e.target.files[0])}
              />
            </div>

            <button type="submit" className="admin-btn">
              Crear evento
            </button>

          </form>
        </main>
      </div>

      <Footer />
    </>
  );
}

export default CrearEvento;
