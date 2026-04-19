import { Routes, Route, Link } from "react-router-dom";
import Objekti from "./pages/Objekti";

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-blue-600 p-4 text-white flex gap-4 shadow-lg">
        <Link to="/" className="hover:text-blue-200 font-bold">
          Početna
        </Link>
        <Link to="/objekti" className="hover:text-blue-200 font-bold">
          Sportski Objekti
        </Link>
      </nav>

      <main className="p-8">
        <Routes>
          <Route
            path="/"
            element={
              <div className="text-center">
                <h1 className="text-4xl font-bold">Dobrodošli u SportSpot</h1>
                <p className="mt-4 text-gray-600">
                  Pronađi svoj termin brzo i lako.
                </p>
              </div>
            }
          />

          <Route path="/objekti" element={<Objekti />} />

          <Route path="*" element={<h1>404 - Stranica nije pronađena</h1>} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
