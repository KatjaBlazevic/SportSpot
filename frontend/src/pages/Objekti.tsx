function Objekti() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Svi sportski objekti</h1>
      <p className="text-gray-600 italic">Podaci se učitavaju s API-ja...</p>

      {/* Ovdje ćemo kasnije mapirati podatke */}
      <div className="mt-4 p-4 bg-white border rounded shadow-sm">
        <p className="font-semibold">Primjer objekta: Arena Zagreb</p>
      </div>
    </div>
  );
}

export default Objekti;
