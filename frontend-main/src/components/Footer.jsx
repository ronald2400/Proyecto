import "../styles/Footer.css";
import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">

        <div className="footer-brand">
          <div className="footer-logo-row">
            <img src="/logo.png" alt="Logo" className="footer-logo" />
            <strong className="footer-title">RESERVAS</strong>
          </div>

          <p className="footer-text">
            La forma más fácil, rápida y segura de reservar tus eventos
          </p>
        </div>

        
        <div className="footer-links">
          <h4>Enlaces</h4>
          <Link to="/">Inicio</Link>
          <Link to="/eventos">Eventos</Link>
          <Link to="/reservas">Reservas</Link>
        </div>

       
        <div className="footer-links">
          <h4>Ayuda</h4>
          <Link to="/preguntas-frecuentes">Preguntas frecuentes</Link>
        </div>

      
        <div className="footer-socials">
          <h4>Síguenos</h4>

          <div className="social-icons">
            <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer">
              <img src="/logoface.png" alt="Facebook" />
            </a>
            <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer">
              <img src="/logoinsta.png" alt="Instagram" />
            </a>
            <a href="https://www.twitter.com" target="_blank" rel="noopener noreferrer">
              <img src="/logotwi.png" alt="Twitter" />
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
}

export default Footer;
