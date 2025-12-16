import "../styles/Administrador.css";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Gato from "../assets/Gato.png";
import eventoDefaultImg from "../assets/evento.png";

function EditarEvento() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    fecha: "",
    hora: "",
    fecha_fin: "",
    hora_fin: "",
    capacidad: "",
    ubicacion: "",
    estado: "activo",
  });

  const [imagenActual, setImagenActual] = useState(null);
  const [nuevaImagen, setNuevaImagen] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const rol = localStorage.getItem("user_rol");

    if (!token || rol !== "admin") {
      navigate("/login");
      return;
    }

    fetch(`http://127.0.0.1:8000/api/eventos/${id}/`, {
      headers: { Authorization: `Token ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Error al cargar");
        return res.json();
      })
      .then((data) => {
        setForm({
          nombre: data.nombre,
          descripcion: data.descripcion,
          fecha: data.fecha_inicio.split("T")[0],
          hora: data.fecha_inicio.split("T")[1].substring(0, 5),
          fecha_fin: data.fecha_fin.split("T")[0],
          hora_fin: data.fecha_fin.split("T")[1].substring(0, 5),
          capacidad: data.capacidad,
          ubicacion: data.ubicacion,
          estado: data.estado,
        });

        setImagenActual(data.imagen);
      })
      .catch((err) => {
        console.error(err);
        alert("No se pudo cargar el evento.");
        navigate("/admin/eventos");
      });
  }, [id, navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    setNuevaImagen(e.target.files[0]);
  };

  const getImagenPreview = () => {
    if (nuevaImagen) {
      return URL.createObjectURL(nuevaImagen);
    }
    if (imagenActual) {
      return `http://127.0.0.1:8000/media/${imagenActual}`;
    }
    return eventoDefaultImg;
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
    formData.append("estado", form.estado);

    if (nuevaImagen) {
      formData.append("imagen", nuevaImagen);
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://127.0.0.1:8000/api/eventos/${id}/`, {
        method: "PUT",
        headers: {
          Authorization: `Token ${token}`,
        },
        body: formData,
      });

      if (res.ok) {
        alert("Evento actualizado correctamente.");
        navigate("/admin/eventos");
      } else {
        alert("Error al actualizar el evento.");
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
            <Link to="/admin/eventos" className="active">
              📅 Gestión de eventos
            </Link>
            <Link to="/admin/reservas">📋 Gestión de reservas</Link>
            <Link to="/admin/reportes">📊 Reportes</Link>
          </nav>

          <div className="admin-logout">
            <span
              onClick={handleLogout}
              style={{ cursor: "pointer", display: "block", width: "100%" }}
            >
              Cerrar sesión
            </span>
          </div>
        </aside>

        <main className="admin-content">
          <h1>Editar evento #{id}</h1>

          <form className="form-evento" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Nombre</label>
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

            <div className="form-group" style={{ display: "flex", gap: "10px" }}>
              <div style={{ flex: 1 }}>
                <label>Capacidad</label>
                <input
                  type="number"
                  name="capacidad"
                  value={form.capacidad}
                  onChange={handleChange}
                  required
                />
              </div>
              <div style={{ flex: 1 }}>
                <label>Estado</label>
                <select
                  name="estado"
                  value={form.estado}
                  onChange={handleChange}
                  style={{ width: "100%", padding: "10px" }}
                >
                  <option value="activo">Activo</option>
                  <option value="cancelado">Cancelado</option>
                </select>
              </div>
            </div>

            {/* IMAGEN AL FINAL */}
            <div className="form-group">
              <label>Imagen del evento</label>
              <img
                src={getImagenPreview()}
                alt="Evento"
                style={{
                  width: "100%",
                  maxHeight: "250px",
                  objectFit: "cover",
                  marginBottom: "10px",
                }}
              />
              <input type="file" accept="image/*" onChange={handleImageChange} />
            </div>

            {/* BOTONES ALINEADOS */}
            <div
              className="form-group"
              style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}
            >
              <button type="submit" className="admin-btn">
                Guardar cambios
              </button>

              <Link to="/admin/eventos">
                <button type="button" className="admin-btn outline">
                  Cancelar
                </button>
              </Link>
            </div>
          </form>
        </main>
      </div>

      <Footer />
    </>
  );
}

export default EditarEvento;
