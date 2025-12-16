import "../styles/Usuario.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import GatoImg from "../assets/Gato.png";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";

export default function ReservarEvento() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [evento, setEvento] = useState(null);
  const [usuarioNombre, setUsuarioNombre] = useState("Usuario");
  const [usuarioEmail, setUsuarioEmail] = useState("");
  const [personas, setPersonas] = useState(1); 
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
        navigate("/login");
        return;
    }

    // Leer nombre y email guardados en localStorage (asegúrate de guardarlos en el login)
    const storedName = localStorage.getItem("user_name");
    const storedEmail = localStorage.getItem("user_email");
    if (storedName && storedName.trim().length > 0) {
      setUsuarioNombre(storedName);
    } else if (storedEmail) {
      // fallback: parte local del email
      setUsuarioNombre(storedEmail.split("@")[0]);
    }

    if (storedEmail) setUsuarioEmail(storedEmail);

    fetch(`http://127.0.0.1:8000/api/eventos/${id}/`)
      .then((res) => {
        if (!res.ok) throw new Error("Evento no encontrado");
        return res.json();
      })
      .then((data) => setEvento(data))
      .catch((err) => {
        console.error(err);
        setError("Error al cargar el evento.");
      });
  }, [id, navigate]);

  if (!evento) return <div style={{textAlign: "center", marginTop: "50px"}}>Cargando información del evento...</div>;

  const esEventoActivo = evento.estado === 'activo';
  const hayCupos = evento.cupos_disponibles > 0;
  const puedeReservar = esEventoActivo && hayCupos;

  let mensajeEstado = null;
  if (evento.estado === 'cancelado') mensajeEstado = "⛔ Este evento ha sido cancelado.";
  else if (evento.estado === 'finalizado') mensajeEstado = "⏳ Este evento ya finalizó.";
  else if (!hayCupos) mensajeEstado = "❌ Cupos agotados.";

  const handleReservar = async () => {
    setError("");
    
    if (personas < 1) {
      setError("Debes ingresar al menos 1 persona.");
      return;
    }
    if (personas > evento.cupos_disponibles) {
      setError(`Solo hay ${evento.cupos_disponibles} cupos disponibles.`);
      return;
    }

    try {
        const token = localStorage.getItem("token");

        // Leer datos de contacto que vamos a enviar
        const nombreContacto = localStorage.getItem("user_name") || usuarioNombre || "";
        const emailContacto = localStorage.getItem("user_email") || usuarioEmail || "";

        const res = await fetch("http://127.0.0.1:8000/api/reservas/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Token ${token}`
            },
            body: JSON.stringify({
                evento: evento.id,
                cantidad_plazas: personas,
                // campos adicionales para que la reserva guarde nombre/email de contacto
                nombre_contacto: nombreContacto,
                email_contacto: emailContacto
                // puedes añadir telefono_contacto aquí si lo tienes
            })
        });

        if (res.ok) {
            const data = await res.json();
            alert(`¡Reserva Exitosa!\nCódigo: ${data.codigo_reserva}`);
            navigate("/usuario/mis-reservas");
        } else {
            const data = await res.json();
            setError(data.error || "Error al procesar la reserva.");
        }

    } catch (err) {
        console.error(err);
        setError("Error de conexión con el servidor.");
    }
  };

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
            Reservar Evento
          </h1>

          <div className="card p-6 bg-white rounded-xl shadow-md">
            <h2 className="text-xl font-semibold mb-4">{evento.nombre}</h2>
            <p className="mb-2">📅 Fecha: {new Date(evento.fecha_inicio).toLocaleDateString()}</p>
            <p className="mb-2">⏰ Hora: {new Date(evento.fecha_inicio).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
            
            {!puedeReservar && (
                <div style={{padding: "10px", backgroundColor: "#ffebee", color: "#c62828", borderRadius: "5px", marginBottom: "15px", fontWeight: "bold"}}>
                    {mensajeEstado}
                </div>
            )}

            <p className="mb-4" style={{color: hayCupos ? 'green' : 'red'}}>
                🎟️ Cupos disponibles: {evento.cupos_disponibles}
            </p>

            <div className="mb-4">
              <label htmlFor="personas" className="block mb-1 font-medium">
                Número de personas
              </label>
              <input
                type="number"
                id="personas"
                min="1"
                max={evento.cupos_disponibles}
                value={personas}
                onChange={(e) => setPersonas(Number(e.target.value))}
                className="border border-gray-300 rounded-md p-2 w-full"
                disabled={!puedeReservar} 
              />
            </div>

            {error && <p className="text-red-600 mb-4">{error}</p>}

            <button 
                className="btn btn-reserve" 
                onClick={handleReservar} 
                disabled={!puedeReservar}
                style={{opacity: !puedeReservar ? 0.5 : 1, cursor: !puedeReservar ? 'not-allowed' : 'pointer'}}
            >
              Confirmar Reserva
            </button>
            
            <button className="btn btn-back ml-2" onClick={() => navigate(-1)}>
              ← Volver
            </button>
          </div>
        </main>
      </div>

      <Footer />
    </>
  );
}