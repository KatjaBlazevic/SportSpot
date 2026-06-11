import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import ScrollToTop from "./components/ScrollToTop";
import ObjektDetalji from "./pages/ObjektDetalji";
import Prijava from "./pages/Prijava";
import Registracija from "./pages/Registracija";
import Profil from "./pages/Profil";
import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen" style={{ background: "#F0F4FF" }}>
        <ScrollToTop />
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/objekt/:id" element={<ObjektDetalji />} />
          <Route path="/prijava" element={<Prijava />} />
          <Route path="/registracija" element={<Registracija />} />
          <Route path="/profil" element={<Profil />} />
          <Route
            path="*"
            element={
              <h1 className="text-center mt-20 text-2xl">
                404 - Stranica nije pronađena
              </h1>
            }
          />
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;
