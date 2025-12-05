import "../styles/Sections.css";

import eventoImg from "../assets/evento.png";
import cuposImg from "../assets/cupos.png";
import confirmarImg from "../assets/confirmar.png";

export default function Sections() {
  return (
    <section className="secciones-home">

      <div className="reserva-minutos">
        <h2>Reserva en Minutos</h2>
        <p>Selecciona tu evento, elige tus plazas y reserva en segundos.</p>

        <div className="pasos-container">
          
          <div className="paso">
            <img src={eventoImg} alt="Elegir evento" />
            <h3>Elige evento</h3>
          </div>

          <span className="flecha">→</span>

          <div className="paso">
            <img src={cuposImg} alt="Seleccionar cupos" />
            <h3>Selecciona cupos</h3>
          </div>

          <span className="flecha">→</span>

          <div className="paso">
            <img src={confirmarImg} alt="Confirmar reserva" />
            <h3>Confirma reserva</h3>
          </div>

        </div>
      </div>

      <div className="nosotros">
        <div className="nosotros-container">
          
          <div className="nosotros-texto">
            <h2>Sobre Nosotros</h2>
            <p>
              Somos una plataforma dedicada a la gestión de eventos y reservas,
              diseñada para facilitar la organización y participación en
              actividades de manera rápida, segura y eficiente.
            </p>
            <p>
              Nuestro objetivo es conectar a las personas con experiencias únicas,
              simplificando el proceso de búsqueda, reserva y administración de
              eventos.
            </p>
          </div>

          <div className="nosotros-valores">
            <div className="valor">✅ Gestión sencilla</div>
            <div className="valor">✅ Reservas en tiempo real</div>
            <div className="valor">✅ Accesible desde cualquier dispositivo</div>
            <div className="valor">✅ Confirmación inmediata</div>
          </div>

        </div>
      </div>

    </section>
  );
}