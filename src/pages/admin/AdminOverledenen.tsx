import { DashboardLayout, FormCard } from "../../components";
import { useEffect, useState } from "react";
import { adminEndpoints } from "../../api/apiConfig";

export default function AdminOverledenen() {
  const [overledenen, setOverledenen] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(adminEndpoints.deceased)
      .then(res => res.json())
      .then(data => {
        setOverledenen(data);
        setLoading(false);
      });
  }, []);

  return (
    <DashboardLayout>
      <div className="px-8 py-6 max-w-6xl mx-auto space-y-6">
        <h1 className="text-2xl font-semibold mb-6">Overledenen Beheren</h1>

        <FormCard title="Overledenen lijst">
          {loading ? (
            <p>Laden...</p>
          ) : (
            <table className="w-full border-collapse border text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border px-2 py-1 text-left">Naam</th>
                  <th className="border px-2 py-1 text-left">Datum overlijden</th>
                  <th className="border px-2 py-1 text-left">Verzekeraar</th>
                  <th className="border px-2 py-1">Acties</th>
                </tr>
              </thead>
              <tbody>
                {overledenen.map(o => (
                  <tr key={o.id}>
                    <td className="border px-2 py-1">{o.naam}</td>
                    <td className="border px-2 py-1">{o.datumOverlijden}</td>
                    <td className="border px-2 py-1">{o.verzekeraar}</td>
                    <td className="border px-2 py-1 text-center">
                      <button className="text-blue-600 hover:underline mr-2">Bewerken</button>
                      <button className="text-red-600 hover:underline">Verwijderen</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </FormCard>
      </div>
    </DashboardLayout>
  );
}