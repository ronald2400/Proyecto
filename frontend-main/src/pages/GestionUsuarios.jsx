import "../styles/Administrador.css";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useEffect, useState } from "react";
import Gato from "../assets/Gato.png";

function GestionUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const navigate = useNavigate();

  // 1. Cargar Usuarios
  useEffect(() => {
    const token = localStorage.getItem("token");
    const rol = localStorage.getItem("user_rol");

    if (!token || rol !== 'admin') {
        navigate("/login");
        return;
    }

    cargarUsuarios(token);
  }, [navigate]);

  const cargarUsuarios = (token) => {
    fetch("http://127.0.0.1:8000/api/usuarios/", {
        headers: { "Authorization": `Token ${token}` }
    })
      .then(res => res.json())
      .then(data => {
          if (Array.isArray(data)) setUsuarios(data);
      })
      .catch(err => console.error(err));
  };

  // 2. Función para Cambiar ROL o ESTADO
  const actualizarUsuario = async (id, campo, valorNuevo) => {
      const token = localStorage.getItem("token");
      const confirmacion = window.confirm(`¿Estás seguro de cambiar ${campo} a "${valorNuevo}"?`);
      
      if (!confirmacion) return;

      try {
          const res = await fetch(`http://127.0.0.1:8000/api/usuarios/${id}/`, {
              method: "PATCH", 
              headers: { 
                  "Content-Type": "application/json",
                  "Authorization": `Token ${token}` 
              },
              body: JSON.stringify({ [campo]: valorNuevo })
          });

          if (res.ok) {
              alert("Usuario actualizado correctamente.");
              cargarUsuarios(token); 
          } else {
              alert("Error al actualizar usuario.");
          }
      } catch (error) {
          console.error(error);
          alert("Error de conexión.");
      }
  };

  const usuariosFiltrados = usuarios.filter((u) =>
    (u.nombre?.toLowerCase() || "").includes(busqueda.toLowerCase()) ||
    u.email.toLowerCase().includes(busqueda.toLowerCase())
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
            <Link to="/admin/usuarios" className="active">👥 Gestión de usuarios</Link>
            <Link to="/admin/eventos">📅 Gestión de eventos</Link>
            <Link to="/admin/reservas">📋 Gestión de reservas</Link>
            <Link to="/admin/reportes">📊 Reportes</Link>
          </nav>

          <div className="admin-logout">
            <span onClick={handleLogout} style={{cursor: "pointer", color: "inherit"}}>
                Cerrar sesión
            </span>
          </div>
        </aside>

        <main className="admin-content">
          <h1>Gestión de Usuarios</h1>
          
          <div className="eventos-toolbar">
              <input
                type="text"
                placeholder="Buscar por nombre o email..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                style={{width: "100%", minWidth: "300px"}} 
              />
          </div>

          <div className="tabla-container">
            <table className="tabla-eventos">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Rol</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {usuariosFiltrados.map((user) => (
                  <tr key={user.id}>
                    {/* QUITÉ EL STYLE #333 AQUÍ PARA QUE EL CSS MANEJE EL COLOR */}
                    <td>{user.id}</td>
                    <td>{user.nombre} {user.apellido}</td>
                    <td>{user.email}</td>
                    
                    {/* ROL */}
                    <td>
                        <span style={{
                            fontWeight: 'bold', 
                            color: user.rol === 'admin' ? '#d9534f' : '#0275d8'
                        }}>
                            {user.rol.toUpperCase()}
                        </span>
                    </td>

                    {/* ESTADO */}
                    <td>
                        <span style={{
                            color: user.estado === 'activo' ? 'green' : 'red',
                            fontWeight: 'bold'
                        }}>
                            {user.estado ? user.estado.toUpperCase() : 'ACTIVO'}
                        </span>
                    </td>

                    {/* BOTONES DE ACCIÓN */}
                    <td style={{display: 'flex', gap: '5px'}}>
                        <button 
                            className="admin-btn"
                            style={{fontSize: '0.8em', padding: '5px', backgroundColor: user.rol === 'admin' ? '#0275d8' : '#d9534f'}}
                            onClick={() => actualizarUsuario(user.id, 'rol', user.rol === 'admin' ? 'cliente' : 'admin')}
                            title={user.rol === 'admin' ? "Degradar a Cliente" : "Ascender a Admin"}
                        >
                            {user.rol === 'admin' ? '👮‍♂️ ➟ 👤' : '👤 ➟ 👮‍♂️'}
                        </button>

                        <button 
                            className="admin-btn"
                            style={{
                                fontSize: '0.8em', 
                                padding: '5px', 
                                backgroundColor: user.estado === 'activo' ? '#d9534f' : '#5cb85c'
                            }}
                            onClick={() => actualizarUsuario(user.id, 'estado', user.estado === 'activo' ? 'inactivo' : 'activo')}
                        >
                            {/* El texto dice la ACCIÓN que vas a realizar */}
                            {user.estado === 'activo' ? '🔒 Bloquear' : '🔓 Desbloquear'}
                        </button>

                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      <Footer />
    </>
  );
}

export default GestionUsuarios;