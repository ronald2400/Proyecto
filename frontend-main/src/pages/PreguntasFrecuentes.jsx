import "../styles/Preguntas.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useState } from "react";


export default function PreguntasFrecuentes() {
  const [faq, setFaq] = useState([
    {
      id: 1,
      pregunta: "¿Cómo puedo reservar un evento?",
      respuesta: "Para reservar un evento, primero ingresa a la página del evento y haz clic en 'Reservar'. Luego completa la información solicitada y confirma tu reserva.",
      abierto: false,
    },
    {
      id: 2,
      pregunta: "¿Puedo cancelar una reserva?",
      respuesta: "Sí, puedes cancelar tu reserva desde la sección 'Mis reservas'. Selecciona la reserva que deseas cancelar y haz clic en 'Cancelar'.",
      abierto: false,
    },
    {
      id: 3,
      pregunta: "¿Cómo puedo ver mi historial de reservas?",
      respuesta: "En el menú de usuario, haz clic en 'Historial'. Allí verás todas tus reservas anteriores y sus detalles.",
      abierto: false,
    },
    {
      id: 4,
      pregunta: "¿Hay límite de personas por reserva?",
      respuesta: "Sí, cada evento tiene un límite de personas permitido. Este límite se mostrará al momento de realizar la reserva.",
      abierto: false,
    },
  ]);

  const togglePregunta = (id) => {
    setFaq(faq.map(item => 
      item.id === id ? { ...item, abierto: !item.abierto } : item
    ));
  };

  return (
    <>
      <Header />


        
        <main className="user-content">
          <h1 className="user-page-title">Preguntas Frecuentes</h1>

          <div className="faq-container">
            {faq.map(item => (
              <div key={item.id} className="faq-item">
                <button 
                  className="faq-question"
                  onClick={() => togglePregunta(item.id)}
                >
                  {item.pregunta} {item.abierto ? "▲" : "▼"}
                </button>
                {item.abierto && (
                  <div className="faq-answer">
                    {item.respuesta}
                  </div>
                )}
              </div>
            ))}
          </div>
        </main>
      

      <Footer />
    </>
  );
}