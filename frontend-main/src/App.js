import { Routes, Route } from "react-router-dom";

/* Páginas principales */
import Home from "./pages/Home";
import Eventos from "./pages/Eventos";
import VerDetalleEvento from "./pages/VerDetalleevento";
import ReservasNr from "./pages/ReservasNr";
import Register from "./pages/Registro";
import Login from "./pages/Inicio_sesion";
import PreguntasFrecuentes from "./pages/PreguntasFrecuentes";

/* Usuario */
import Usuario from "./pages/Usuario";
import BuscarEvento from "./pages/BuscarEvento";
import MisReservas from "./pages/MisReservas";
import Historial from "./pages/Historial";
import VerEvento from "./pages/VerEvento";
import ReservarEvento from "./pages/ReservarEvento";
import VerReserva from "./pages/VerReserva";


/* Administrador */
import Administrador from "./pages/Administrador";
import GestionEventos from "./pages/GestionEventos";
import VerEventoAdmin from "./pages/VerEventoAdmin";
import EditarEvento from "./pages/EditarEvento";
import CrearEvento from "./pages/CrearEvento";
import GestionReservasAdmin from "./pages/GestionReservasAdmin";
import VerReservaAdmin from "./pages/VerReservaAdmin";
import ReportesAdmin from "./pages/ReportesAdmin";

import ScrollToTop from "./components/ScrollToTop";

function App() {
  return (
    <>
      <ScrollToTop />

      <Routes>
        {/* Público */}
        <Route path="/" element={<Home />} />
        <Route path="/eventos" element={<Eventos />} />
        <Route path="/evento/:id" element={<VerDetalleEvento />} />
        <Route path="/reservas" element={<ReservasNr />} />
        <Route path="/registro" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/preguntas-frecuentes" element={<PreguntasFrecuentes />} />
        

        {/* Usuario */}
        <Route path="/usuario" element={<Usuario />} />
        <Route path="/usuario/buscar-evento" element={<BuscarEvento />} />
        <Route path="/usuario/mis-reservas" element={<MisReservas />} />
        <Route path="/usuario/historial" element={<Historial />} />
        <Route path="/usuario/evento/:id" element={<VerEvento />} />
        <Route path="/usuario/evento/:id/reservar" element={<ReservarEvento />} />
        <Route path="/usuario/reserva/:id" element={<VerReserva />} />
        
        
        {/* Administrador */}
        <Route path="/admin" element={<Administrador />} />
        <Route path="/admin/eventos" element={<GestionEventos />} />
        <Route path="/admin/eventos/crear" element={<CrearEvento />} />
        <Route path="/admin/eventos/:id" element={<VerEventoAdmin />} />
        <Route path="/admin/eventos/editar/:id" element={<EditarEvento />} />
        <Route path="/admin/reservas" element={<GestionReservasAdmin />} />
        <Route path="/admin/reservas/ver/:id" element={<VerReservaAdmin />} />
        <Route path="/admin/reportes" element={<ReportesAdmin />} />
      </Routes>
    </>
  );
}

export default App;
