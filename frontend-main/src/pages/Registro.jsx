import Carousel from "../components/Carrusel";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Login.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useState } from "react";

function Registro() {
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  
  const navigate = useNavigate();


  async function handleRegister(e) {
    e.preventDefault();
    setError("");

    try {
      
      const res = await fetch("http://127.0.0.1:8000/api/usuarios/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            email, 
            password, 
            nombre, 
            apellido
        }),
      });

   
      if (res.ok) {
        alert("Cuenta creada exitosamente. Ahora puedes iniciar sesión.");
        navigate("/login");
      } else {
        const data = await res.json();
        const errorMsg = data.email ? "El correo ya está registrado." : "Error al crear cuenta.";
        setError(errorMsg);
      }
    } catch (err) {
      console.error(err);
      setError("Error al conectar con el servidor.");
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

            <h2 className="register-title">Crear cuenta</h2>

            {error && <p className="error-text" style={{color: 'red', textAlign: 'center'}}>{error}</p>}

            <form className="register-form" onSubmit={handleRegister}>
              <input
                type="text"
                placeholder="Nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
              />
              
     
              <input
                type="text"
                placeholder="Apellido"
                value={apellido}
                onChange={(e) => setApellido(e.target.value)}
                required
              />

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
                Registrarse
              </button>
            </form>

            <p className="register-login-text">
              ¿Ya tienes una cuenta?{" "}
              <Link to="/login" className="login-link">Iniciar Sesión</Link>
            </p>
          </div>
        </div>

      </div>

      <Footer />
    </>
  );
}
 
export default Registro;