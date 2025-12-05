import Carousel from "../components/Carrusel";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Login.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useState } from "react";

function Inicio_sesion() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(""); 
  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    setError(""); 

    try {
 
      const res = await fetch("http://127.0.0.1:8000/api/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
 
        body: JSON.stringify({ username: email, password: password }),
      });

      const data = await res.json();

      if (res.ok) {
 
        localStorage.setItem("token", data.token);
        localStorage.setItem("user_rol", data.rol);
        localStorage.setItem("user_email", data.email);
        localStorage.setItem("user_id", data.user_id);

 
        if (data.rol === 'admin') {
            navigate("/admin"); 
        } else {
            navigate("/usuario");
        }

      } else {
    
        setError("Credenciales incorrectas. Verifique correo y contraseña.");
      }
    } catch (err) {
      console.error(err);
      setError("Error al conectar con el servidor. Revise que el Backend esté encendido.");
    }
  }

  return (
    <>
      <Header />

      <div className="register-container">

        <div className="register-left">
          <Carousel />
        </div>

        <div className="register-right">
          <div className="register-box">

            <h2 className="register-title">Iniciar sesión</h2>

            {error && <p className="error-text" style={{color: 'red', textAlign: 'center'}}>{error}</p>}

            <form className="register-form" onSubmit={handleLogin}>
              <input 
                type="email" 
                placeholder="Correo electrónico" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <div className="password-wrapper">
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Contraseña" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                
              </div>

              <button type="submit" className="register-btn">
                Acceder
              </button>
              
            </form>

            <p className="register-login-text">
              ¿Aún no tienes cuenta?
              <Link to="/registro" className="login-link">Registrarse</Link>
            </p>

          </div>
        </div>

      </div>

      <Footer />
    </>
  );
}

export default Inicio_sesion;