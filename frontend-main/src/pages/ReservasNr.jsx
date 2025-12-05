import Header from "../components/Header";
import Footer from "../components/Footer";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "../styles/Reservas.css";

function ReservasNr() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const eventoInicial = location.state?.eventoPreseleccionado || null;

  const [eventoSeleccionado, setEventoSeleccionado] = useState(eventoInicial);
  const [listaEventos, setListaEventos] = useState([]);
  
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [rut, setRut] = useState("");
  const [cantidad, setCantidad] = useState(1);
  const [error, setError] = useState("");
  const [exito, setExito] = useState(null);


  useEffect(() => {
    if (!eventoSeleccionado) {
        fetch("http://127.0.0.1:8000/api/eventos/")
            .then(res => res.json())
            .then(data => {
                const activos = data.filter(e => e.estado === 'activo' && e.cupos_disponibles > 0);
                setListaEventos(activos);
            })
            .catch(err => console.error(err));
    }
  }, [eventoSeleccionado]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!eventoSeleccionado) {
        setError("Por favor selecciona un evento.");
        return;
    }

    if (cantidad > eventoSeleccionado.cupos_disponibles) {
        setError(`Solo quedan ${eventoSeleccionado.cupos_disponibles} cupos.`);
        return;
    }

    try {
        const res = await fetch("http://127.0.0.1:8000/api/reservas/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                evento: eventoSeleccionado.id,
                cantidad_plazas: parseInt(cantidad),
                nombre_contacto: nombre,
                email_contacto: email,
                rut_contacto: rut 
            })
        });

        const data = await res.json();

        if (res.ok) {
            setExito(data.codigo_reserva);
            setNombre("");
            setEmail("");
            setRut("");
        } else {
            setError(data.error || "Error al procesar la reserva.");
        }

    } catch (err) {
        console.error(err);
        setError("Error de conexión.");
    }
  };

  return (
    <>
      <Header />

      <section className="reservas-section">
        <div className="reservas-container">

          <h1 className="reservas-title">Reserva como Invitado</h1>
          <p className="reservas-subtitle">
            Completa tus datos para reservar sin crear una cuenta.
          </p>

          <div className="reservas-info-box" style={{maxWidth: "500px", margin: "0 auto", textAlign: "left"}}>
            
            {exito ? (
                <div style={{textAlign: "center", padding: "20px"}}>
                    <h2 style={{color: "green"}}>¡Reserva Exitosa!</h2>
                    <p>Tu código de reserva es:</p>
                    <h1 style={{fontSize: "2.5rem", margin: "10px 0", color: "#333"}}>{exito}</h1>
                    <p>Guarda este código. Lo necesitarás para ingresar.</p>
                    <button onClick={() => navigate("/")} className="btn-reservas-register" style={{marginTop: "20px"}}>
                        Volver al Inicio
                    </button>
                </div>
            ) : (
                <form onSubmit={handleSubmit} style={{display: "flex", flexDirection: "column", gap: "15px"}}>
                    
         
                    <div>
                        <label style={{fontWeight: "bold"}}>Evento:</label>
                        {eventoInicial ? (
                            <div style={{padding: "10px", background: "#f0f0f0", borderRadius: "5px", color: "#333"}}>
                                <strong>{eventoInicial.nombre}</strong>
                                <br/>
                                <small>Fecha: {new Date(eventoInicial.fecha_inicio).toLocaleDateString()}</small>
                            </div>
                        ) : (
                            <select 
                                className="search-input"
                                style={{width: "100%", marginTop: "5px"}}
                                onChange={(e) => {
                                    const ev = listaEventos.find(item => item.id === parseInt(e.target.value));
                                    setEventoSeleccionado(ev);
                                }}
                                required
                                defaultValue=""
                            >
                                <option value="" disabled>Selecciona un evento...</option>
                                {listaEventos.map(ev => (
                                    <option key={ev.id} value={ev.id}>
                                        {ev.nombre} (Cupos: {ev.cupos_disponibles})
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>

     
                    <div>
                        <label>Nombre Completo:</label>
                        <input 
                            type="text" 
                            required 
                            className="search-input"
                            style={{width: "100%"}}
                            value={nombre}
                            onChange={e => setNombre(e.target.value)}
                            placeholder="Ej: Juan Pérez"
                        />
                    </div>

                    <div>
                        <label>RUT (Opcional):</label>
                        <input 
                            type="text" 
                            className="search-input"
                            style={{width: "100%"}}
                            value={rut}
                            onChange={e => setRut(e.target.value)}
                            placeholder="Ej: 12.345.678-9"
                        />
                    </div>

                    <div>
                        <label>Correo Electrónico:</label>
                        <input 
                            type="email" 
                            required 
                            className="search-input"
                            style={{width: "100%"}}
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="contacto@ejemplo.com"
                        />
                    </div>

                    <div>
                        <label>Cantidad de Personas:</label>
                        <input 
                            type="number" 
                            min="1" 
                            max={eventoSeleccionado ? eventoSeleccionado.cupos_disponibles : 10}
                            required 
                            className="search-input"
                            style={{width: "100%"}}
                            value={cantidad}
                            onChange={e => setCantidad(e.target.value)}
                        />
                        {eventoSeleccionado && (
                            <small style={{color: "#666"}}>Máximo disponible: {eventoSeleccionado.cupos_disponibles}</small>
                        )}
                    </div>

                    {error && <p style={{color: "red", fontWeight: "bold"}}>{error}</p>}

                    <button type="submit" className="btn-reservas-register" style={{marginTop: "10px", textAlign: "center"}}>
                        Confirmar Reserva
                    </button>

                    <hr style={{margin: "20px 0"}}/>
                    
                    <p className="reservas-login-text" style={{textAlign: "center"}}>
                        ¿Prefieres guardar tu historial?
                        <Link to="/registro" className="reservas-login-link"> Crea una cuenta</Link>
                    </p>
                </form>
            )}

          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}

export default ReservasNr;