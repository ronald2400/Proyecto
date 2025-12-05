import Header from "../components/Header";
import Carousel from "../components/Carrusel";
import Sections from "../components/Sections";
import Footer from "../components/Footer";

function Home() {
  return (
    <div className="app-container">
      <Header />
      <Carousel />
      <Sections />
      <Footer />
    </div>
  );
}

export default Home;