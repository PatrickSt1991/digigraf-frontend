import { useLocation, useParams } from "react-router-dom";
import { useEffect } from "react";
import { DashboardLayout, FormCard, FormField } from "../components";
import { useDropdownData, useFormHandler, useSaveAndNext } from "../hooks";
import { endpoints } from "../api/apiConfig";
import { InvoiceFormData, PriceComponent } from "../types";

export default function DeceasedInvoice() {
  const location = useLocation();
  const { overledeneId } = useParams<{ overledeneId: string }>();

  const initialData: InvoiceFormData = {
    selectedVerzekeraar: "",
    priceComponents: [{ omschrijving: "", aantal: 1, bedrag: 0 }],
    discountAmount: 0,
    subtotal: 0,
    total: 0,
    isExcelButtonEnabled: true,
  };

  const { formData, handleChange, goNext, goBack, loading, error } = useFormHandler<InvoiceFormData>({
    initialData,
    steps: ["/funeral-documents", "/invoice", "/the-next-page", "/success-deceased"],
    fetchUrl: overledeneId ? `${endpoints.invoiceDeceased}/${overledeneId}` : undefined,
  });

  const saveUrl = overledeneId ? `${endpoints.invoiceDeceased}?overledeneId=${overledeneId}` : endpoints.invoiceDeceased;
  const handleNext = useSaveAndNext({ formData, endpoint: saveUrl, id: overledeneId, goNext });

  const { data, loading: dropdownLoading, errors: dropdownErrors } = useDropdownData({
    insurers: endpoints.insuranceCompanies,
  });

  // Recalculate subtotal & total whenever priceComponents or discountAmount changes
  useEffect(() => {
    const subtotal = formData.priceComponents.reduce((sum, pc) => sum + (pc.bedrag * pc.aantal), 0);
    const total = subtotal - formData.discountAmount;
    handleChange({ subtotal, total });
  }, [formData.priceComponents, formData.discountAmount]);

  const updatePriceComponent = (idx: number, key: keyof PriceComponent, value: any) => {
    const updatedComponents = [...formData.priceComponents];
    updatedComponents[idx] = {
      ...updatedComponents[idx],
      [key]: key === "bedrag" || key === "aantal" ? Number(value) : value,
    };
    handleChange({ priceComponents: updatedComponents });
  };

  const addPriceComponent = () => {
    handleChange({
      priceComponents: [...formData.priceComponents, { omschrijving: "", aantal: 1, bedrag: 0 }],
    });
  };

  const removePriceComponent = (idx: number) => {
    const updatedComponents = formData.priceComponents.filter((_, i) => i !== idx);
    handleChange({ priceComponents: updatedComponents });
  };

  const handleGenerateExcel = async () => {
    const response = await fetch(`${endpoints.invoiceDeceased}/generate-excel`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  };

  if (loading) return <div>Loading invoice data...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <DashboardLayout>
      <div className="p-8 max-w-8xl mx-auto space-y-6">
        <FormCard title="Factuur Overledene">
          {/* Insurance selection */}
          <FormField label="Verzekeraar">
            {dropdownLoading.insurers ? (
              <div>Loading...</div>
            ) : dropdownErrors.insurers ? (
              <div className="text-red-600">{dropdownErrors.insurers}</div>
            ) : (
              <select
                name="selectedVerzekeraar"
                value={formData.selectedVerzekeraar}
                onChange={handleChange}
                className="w-full border-0 border-b border-gray-300 rounded-none focus:ring-0 focus:border-gray-900"
              >
                <option value="">Selecteer verzekeraar...</option>
                {data.insurers?.map(i => (
                  <option key={i.id} value={i.value}>{i.value}</option>
                ))}
              </select>
            )}
          </FormField>

          {/* Price Components Table */}
          {formData.priceComponents.map((pc, idx) => (
            <div key={idx} className="grid grid-cols-3 gap-4 mb-2 items-end">
              <FormField label="Omschrijving">
                <input
                  type="text"
                  value={pc.omschrijving}
                  onChange={e => updatePriceComponent(idx, "omschrijving", e.target.value)}
                  className="w-full border-0 border-b border-gray-300 rounded-none focus:ring-0 focus:border-gray-900"
                />
              </FormField>
              <FormField label="Aantal">
                <input
                  type="number"
                  value={pc.aantal}
                  onChange={e => updatePriceComponent(idx, "aantal", e.target.value)}
                  className="w-full border-0 border-b border-gray-300 rounded-none focus:ring-0 focus:border-gray-900"
                />
              </FormField>
              <FormField label="Bedrag">
                <input
                  type="number"
                  value={pc.bedrag}
                  onChange={e => updatePriceComponent(idx, "bedrag", e.target.value)}
                  className="w-full border-0 border-b border-gray-300 rounded-none focus:ring-0 focus:border-gray-900"
                />
              </FormField>
              <button
                type="button"
                onClick={() => removePriceComponent(idx)}
                className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Verwijder
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={addPriceComponent}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Voeg regel toe
          </button>

          {/* Totals */}
          <div className="mt-4 space-y-2">
            <div>Subtotaal: {formData.subtotal}</div>
            <div>
              Korting:{" "}
              <input
                type="number"
                name="discountAmount"
                value={formData.discountAmount}
                onChange={handleChange}
                className="w-24 border-0 border-b border-gray-300 rounded-none focus:ring-0 focus:border-gray-900"
              />
            </div>
            <div>Totaal: {formData.total}</div>
          </div>

          {/* Actions */}
          <div className="mt-4 flex gap-4">
            <button
              onClick={() => goBack(location.pathname)}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              Terug
            </button>
            <button
              onClick={handleNext}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Opslaan & Volgende
            </button>
            <button
              onClick={handleGenerateExcel}
              disabled={!formData.isExcelButtonEnabled}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
            >
              Excel Genereren
            </button>
          </div>
        </FormCard>
      </div>
    </DashboardLayout>
  );
}