import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Objekti from "./pages/Objekti";
import ObjektDetalji from "./pages/ObjektDetalji";

function App() {
  return (
    <div className="min-h-screen" style={{ background: "#F0F4FF" }}>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/objekt/:id" element={<ObjektDetalji />} />
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
  );
}

export default App;
