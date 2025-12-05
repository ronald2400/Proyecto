import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/Header.css";

import { ThemeContext } from "../context/ThemeContext";

import modoNocturno from "../assets/modonocturno.png";
import modoNormal from "../assets/modonormal.png";

function Header() {
  const { darkMode, setDarkMode } = useContext(ThemeContext);
  const [menuOpen, setMenuOpen] = useState(false);

  // Lee si hay usuario logueado
  const token = localStorage.getItem("token");
  const rol = localStorage.getItem("user_rol");

  // Define donde lleva el botón "Mi Perfil"
  const perfilPath = rol === 'admin' ? '/admin' : '/usuario';

  return (
    <header className="header">
      <div className="header-left">
        <Link to="/"><img src="/logo.png" alt="Logo" className="logo" /></Link>
      </div>

      <button className="menu-btn" onClick={() => setMenuOpen(!menuOpen)}>
        ☰
      </button>

      <nav className={`nav ${menuOpen ? "open" : ""}`}>
        <div className="nav-left">
          <Link to="/">Inicio</Link>
          <Link to="/eventos">Eventos</Link>
          <Link to="/reservas">Reservas</Link>
        </div>

        <div className="nav-right">
          <img
            src={darkMode ? modoNormal : modoNocturno}
            alt="Modo oscuro"
            className="btn-darkmode-img"
            onClick={() => setDarkMode(!darkMode)}
            style={{cursor: "pointer"}}
          />
          {/* Logica Visual: ¿logueado? */}
          {token ? (
            // CON TOKEN: Muestra "Mi Perfil"
            <Link to={perfilPath} className="btn login">
               Mi Perfil
            </Link>
          ) : (
            // SIN TOKEN: Muestra Login y Registro
            <>
              <Link to="/login" className="btn login">Iniciar Sesión</Link>
              <Link to="/registro" className="btn register">Registrarse</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}

export default Header;