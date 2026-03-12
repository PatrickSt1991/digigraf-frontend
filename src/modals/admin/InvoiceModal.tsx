import React, { useEffect, useMemo, useState } from "react";
import { FaTimes, FaPlus, FaTrash, FaSave, FaFileExcel } from "react-icons/fa";
import type { InvoiceFormData, PriceComponent } from "../../types";
import {
  getInvoiceByDossierId,
  saveInvoiceForDossier,
  generateInvoiceExcelForDossier,
} from "../../api/adminApi";

const emptyInvoice: InvoiceFormData = {
  selectedVerzekeraarId: "",
  insurancePartyId: "",
  priceComponents: [{ omschrijving: "", aantal: 1, bedrag: 0 }],
  insurancePolicies: [],
  discountAmount: 0,
  subtotal: 0,
  total: 0,
  isExcelButtonEnabled: false,
  invoiceDate: "",
};

export default function AdminInvoiceModal({
  dossierId,
  onClose,
}: {
  dossierId: string;
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [invoice, setInvoice] = useState<InvoiceFormData>(emptyInvoice);
  const [selectedVerzekeraar, setSelectedVerzekeraar] = useState<string>("");

  useEffect(() => {
    (async () => {
      try {
        setError(null);
        setLoading(true);

        const data: any = await getInvoiceByDossierId(dossierId);

        // data includes at least the form fields; if it also returns selectedVerzekeraar, store it
        setSelectedVerzekeraar(data.selectedVerzekeraar ?? "");

        setInvoice({
          insurancePartyId: data.insurancePartyId ?? data.selectedVerzekeraarId ?? "",
          selectedVerzekeraarId: data.insurancePartyId ?? data.selectedVerzekeraarId ?? "",
          priceComponents: data.priceComponents ?? [],
          insurancePolicies: data.insurancePolicies ?? [],
          discountAmount: data.discountAmount ?? 0,
          subtotal: data.subtotal ?? 0,
          total: data.total ?? 0,
          isExcelButtonEnabled: true,
          invoiceDate: data.invoiceDate
        });
      } catch (e: any) {
        setError(e?.message ?? "Kon factuur niet laden.");
      } finally {
        setLoading(false);
      }
    })();
  }, [dossierId]);

  const subtotal = useMemo(() => {
    return (invoice.priceComponents ?? []).reduce(
      (sum, pc) => sum + (Number(pc.bedrag) || 0) * (Number(pc.aantal) || 0),
      0
    );
  }, [invoice.priceComponents]);

  const insuranceTotal = useMemo(() => {
    return (invoice.insurancePolicies ?? []).reduce(
      (sum, p) => sum + (Number(p.premium) || 0),
      0
    );
  }, [invoice.insurancePolicies]);

  const total = useMemo(
    () => subtotal - (Number(invoice.discountAmount) || 0) - insuranceTotal,
    [subtotal, invoice.discountAmount, insuranceTotal]
  );

  const setLine = (idx: number, key: keyof PriceComponent, value: any) => {
    setInvoice((prev) => {
      const next = [...prev.priceComponents];
      next[idx] = {
        ...next[idx],
        [key]: key === "aantal" || key === "bedrag" ? Number(value) : value,
      };
      return { ...prev, priceComponents: next };
    });
  };

  const addLine = () =>
    setInvoice((prev) => ({
      ...prev,
      priceComponents: [...prev.priceComponents, { omschrijving: "", aantal: 1, bedrag: 0 }],
    }));

  const removeLine = (idx: number) =>
    setInvoice((prev) => ({
      ...prev,
      priceComponents: prev.priceComponents.filter((_, i) => i !== idx),
    }));

  const onSave = async () => {
    try {
      setSaving(true);
      setError(null);

      const payload: InvoiceFormData = {
        ...invoice,
        subtotal,
        total,
        isExcelButtonEnabled: true,
      };

      await saveInvoiceForDossier(dossierId, payload);
      setInvoice(payload);
    } catch (e: any) {
      setError(e?.message ?? "Opslaan mislukt.");
    } finally {
      setSaving(false);
    }
  };

  const onExcel = async () => {
    console.log("Generating Excel with payload:", { ...invoice, subtotal, total });
    const payload: InvoiceFormData = { ...invoice, subtotal, total, isExcelButtonEnabled: true };
    await generateInvoiceExcelForDossier(dossierId, payload);
  };

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="absolute left-1/2 top-1/2 w-[95vw] max-w-5xl -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Kostenbegroting</h2>
            <p className="text-sm text-gray-600">
              {selectedVerzekeraar ? `Verzekeraar: ${selectedVerzekeraar}` : "Bestaande factuur bewerken"}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Sluiten"
          >
            <FaTimes size={16} />
          </button>
        </div>

        {loading ? (
          <div className="p-6 text-gray-600">Laden...</div>
        ) : (
          <div className="p-6 space-y-6">
            {error && <div className="text-sm text-red-600">{error}</div>}

            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-3 md:items-end md:justify-between">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full md:max-w-xl">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Korting</label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    value={invoice.discountAmount}
                    onChange={(e) =>
                      setInvoice((p) => ({ ...p, discountAmount: Number(e.target.value) }))
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Totaal</label>
                  <input
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
                    value={total.toFixed(2)}
                    readOnly
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  onClick={onExcel}
                  className="px-4 py-2 rounded-lg border hover:bg-gray-50 transition-colors inline-flex items-center gap-2"
                >
                  <FaFileExcel size={16} />
                  Excel
                </button>

                <button
                  onClick={onSave}
                  disabled={saving}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
                >
                  <FaSave size={16} />
                  {saving ? "Opslaan..." : "Opslaan"}
                </button>
              </div>
            </div>

            {/* Lines */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Omschrijving
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Aantal
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Bedrag
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Acties
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-200">
                    {invoice.priceComponents.map((pc, idx) => (
                      <tr key={`pc-${idx}`} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-3">
                          <input
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            value={pc.omschrijving}
                            onChange={(e) => setLine(idx, "omschrijving", e.target.value)}
                          />
                        </td>

                        <td className="px-6 py-3 w-28">
                          <input
                            type="number"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            value={pc.aantal}
                            onChange={(e) => setLine(idx, "aantal", e.target.value)}
                          />
                        </td>

                        <td className="px-6 py-3 w-40">
                          <input
                            type="number"
                            step="0.01"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            value={pc.bedrag}
                            onChange={(e) => setLine(idx, "bedrag", e.target.value)}
                          />
                        </td>

                        <td className="px-6 py-3 text-right">
                          <button
                            onClick={() => removeLine(idx)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Verwijder regel"
                          >
                            <FaTrash size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}

                    {(invoice.insurancePolicies ?? []).length > 0 && (
                      <tr className="bg-gray-50">
                        <td colSpan={4} className="px-6 py-2 text-xs font-semibold text-gray-500 uppercase">
                          Verzekeringspolissen
                        </td>
                      </tr>
                    )}

                    {(invoice.insurancePolicies ?? []).map((policy) => (
                      <tr key={`ip-${policy.id}`} className="bg-blue-50/40">
                        <td className="px-6 py-3">
                          <input
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-100 text-gray-700"
                            value={policy.policyNumber ? `Verzekering ${policy.policyNumber}` : "Verzekering"}
                            readOnly
                          />
                        </td>

                        <td className="px-6 py-3 w-28">
                          <input
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-100 text-gray-700"
                            value={1}
                            readOnly
                          />
                        </td>

                        <td className="px-6 py-3 w-40">
                          <input
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-100 text-gray-700"
                            value={policy.premium}
                            readOnly
                          />
                        </td>

                        <td className="px-6 py-3 text-right">
                          <span className="text-xs text-gray-500">Automatisch</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-4 border-t border-gray-200 flex items-center justify-between">
                <button
                  onClick={addLine}
                  className="px-4 py-2 rounded-lg border hover:bg-gray-50 transition-colors inline-flex items-center gap-2"
                >
                  <FaPlus size={14} />
                  Regel toevoegen
                </button>

                <div className="text-sm text-gray-700 flex gap-6">
                  <div>
                    Subtotaal: <span className="font-medium">{subtotal.toFixed(2)}</span>
                  </div>
                  <div>
                    Totaal: <span className="font-medium">{total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-xs text-gray-500">
              Admin modus: laadt een bestaande factuur (geen template/verzekeraar flow).
            </div>
          </div>
        )}
      </div>
    </div>
  );
}