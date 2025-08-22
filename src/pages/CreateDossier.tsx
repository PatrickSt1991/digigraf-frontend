import React, { useState } from "react";
import { createNewDossier, DossierResponse } from "../api/dossierApi";
import DashboardLayout from "../components/DashboardLayout"; // ✅ import added

export default function CreateDossier() {
  const user = { name: "Test User", role: "Admin" }; // later from JWT/context
  const [funeralCode, setFuneralCode] = useState("");
  const [funeralLeader, setFuneralLeader] = useState("");
  const [voorregeling, setVoorregeling] = useState(false);
  const [funeralType, setFuneralType] = useState("Funeral");
  const [result, setResult] = useState<DossierResponse | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await createNewDossier({
        funeralCode,
        funeralLeader,
        voorregeling,
        funeralType,
      });
      setResult(response);
    } catch (error) {
      console.error(error);
      alert("Failed to create dossier");
    }
  };

  return (
    <DashboardLayout user={user}>
      <div className="p-8 max-w-lg mx-auto">
        <h1 className="text-2xl font-bold mb-4">Create New Funeral Dossier</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block">Funeral Code:</label>
            <input
              value={funeralCode}
              onChange={(e) => setFuneralCode(e.target.value)}
              required
              className="border p-2 rounded w-full"
            />
          </div>

          <div>
            <label className="block">Funeral Leader:</label>
            <input
              value={funeralLeader}
              onChange={(e) => setFuneralLeader(e.target.value)}
              required
              className="border p-2 rounded w-full"
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={voorregeling}
              onChange={(e) => setVoorregeling(e.target.checked)}
            />
            <label>Voorregeling</label>
          </div>

          <div>
            <label className="block">Funeral Type:</label>
            <select
              value={funeralType}
              onChange={(e) => setFuneralType(e.target.value)}
              className="border p-2 rounded w-full"
            >
              <option value="Funeral">Funeral</option>
              <option value="Cremation">Cremation</option>
            </select>
          </div>

          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            Create
          </button>
        </form>

        {result && (
          <div className="mt-6 bg-gray-100 p-4 rounded">
            <h2 className="text-lg font-semibold mb-2">Dossier Created</h2>
            <pre className="text-sm">{JSON.stringify(result, null, 2)}</pre>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}