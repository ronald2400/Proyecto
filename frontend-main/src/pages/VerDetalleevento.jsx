import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import eventoDefaultImg from "../assets/evento.png";
import "../styles/DetalleEvento.css";

function VerDetalleEvento() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [evento, setEvento] = useState(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/api/eventos/${id}/`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Evento no encontrado");
        }
        return res.json();
      })
      .then((data) => {
        setEvento(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  const irAReservaInvitado = () => {
    navigate("/reservas", { state: { eventoPreseleccionado: evento } });
  };

  const getImagenEvento = () => {
    if (!evento?.imagen) {
      return eventoDefaultImg;
    }

    if (evento.imagen.startsWith("http")) {
      return evento.imagen;
    }

    return `http://127.0.0.1:8000/media/${evento.imagen}`;
  };

  if (loading) {
    return (
      <>
        <Header />
        <h2 style={{ textAlign: "center", padding: "40px" }}>
          Cargando información...
        </h2>
        <Footer />
      </>
    );
  }

  if (!evento) {
    return (
      <>
        <Header />
        <h2 style={{ textAlign: "center", padding: "40px" }}>
          Evento no encontrado
        </h2>
        <Footer />
      </>
    );
  }

  const hayCupos = evento.cupos_disponibles > 0;

  return (
    <>
      <Header />

      <section className="detalle-evento-section">
        <div className="detalle-evento-container">
          <div className="detalle-evento-img">
            <img
              src={getImagenEvento()}
              alt={evento.nombre}
              onError={(e) => (e.target.src = eventoDefaultImg)}
            />
          </div>

          <div className="detalle-evento-info">
            <h1>{evento.nombre}</h1>

            <p>
              Fecha:{" "}
              {new Date(evento.fecha_inicio).toLocaleDateString()} -{" "}
              {new Date(evento.fecha_inicio).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>

            <p style={{ color: hayCupos ? "inherit" : "red" }}>
              Cupos disponibles: {evento.cupos_disponibles}
            </p>

            <h3>Descripción del evento</h3>
            <p>{evento.descripcion}</p>

            <div
              style={{
                marginTop: "20px",
                display: "flex",
                gap: "10px",
                flexDirection: "column",
              }}
            >
              {hayCupos ? (
                <>
                  <button
                    onClick={irAReservaInvitado}
                    className="btn-evento"
                    style={{
                      backgroundColor: "#000000ff",
                      cursor: "pointer",
                    }}
                  >
                    🎫 Reservar como Invitado
                  </button>

                  {token ? (
                    <Link
                      to={`/usuario/evento/${id}/reservar`}
                      className="btn-evento"
                      style={{
                        backgroundColor: "#000000ff",
                        textAlign: "center",
                      }}
                    >
                      ✅ Reservar con mi Cuenta
                    </Link>
                  ) : (
                    <Link
                      to="/login"
                      className="btn-evento"
                      style={{
                        backgroundColor: "#000000ff",
                        textAlign: "center",
                      }}
                    >
                      🔑 Iniciar Sesión para Reservar
                    </Link>
                  )}
                </>
              ) : (
                <button
                  disabled
                  className="btn-evento"
                  style={{
                    backgroundColor: "gray",
                    cursor: "not-allowed",
                  }}
                >
                  ❌ Agotado
                </button>
              )}

              <Link
                to="/eventos"
                className="btn-evento"
                style={{
                  backgroundColor: "#007bff",
                  textAlign: "center",
                }}
              >
                Volver a la lista
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}

export default VerDetalleEvento;
