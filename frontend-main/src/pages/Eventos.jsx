import "../styles/Eventos.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import eventoDefaultImg from "../assets/evento.png";

function EventCard({ evento }) {

  const getImagenEvento = () => {
    if (!evento.imagen) {
      return eventoDefaultImg;
    }

    // Si viene una URL completa
    if (evento.imagen.startsWith("http")) {
      return evento.imagen;
    }

    // Imagen servida por Django
    return `http://127.0.0.1:8000/media/${evento.imagen}`;
  };

  return (
    <div className="evento-card">
      <img
        src={getImagenEvento()}
        alt={evento.nombre}
        onError={(e) => (e.target.src = eventoDefaultImg)}
      />

      <div className="evento-info">
        <h3>{evento.nombre}</h3>

        <p>
          Fecha:{" "}
          {new Date(evento.fecha_inicio).toLocaleDateString()}
        </p>

        <p
          style={{
            color: evento.cupos_disponibles > 0 ? "inherit" : "red",
          }}
        >
          Cupos disponibles: {evento.cupos_disponibles}
        </p>

        <Link to={`/evento/${evento.id}`} className="btn-evento">
          Ver detalle
        </Link>
      </div>
    </div>
  );
}

export default function Eventos() {
  const [eventos, setEventos] = useState([]);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/eventos/")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const activos = data.filter(
            (e) => e.estado === "activo"
          );
          setEventos(activos);
        }
      })
      .catch((err) =>
        console.error("Error al cargar eventos:", err)
      );
  }, []);

  return (
    <>
      <Header />

      <section className="eventos-section">
        <div className="eventos-header">
          <h1>Eventos Disponibles</h1>
          <p>
            Elige tu evento, revisa los detalles y reserva en minutos.
          </p>
        </div>

        <div className="eventos-grid">
          {eventos.length > 0 ? (
            eventos.map((evento) => (
              <EventCard key={evento.id} evento={evento} />
            ))
          ) : (
            <p
              style={{
                textAlign: "center",
                width: "100%",
                padding: "20px",
              }}
            >
              No hay eventos disponibles en este momento.
            </p>
          )}
        </div>
      </section>

      <Footer />
    </>
  );
}
