import { useLocation, useParams } from "react-router-dom";
import { useEffect } from "react";
import { DashboardLayout, FormCard, FuneralForm, FormField } from "../components";
import { useDropdownData, useFormHandler, useSaveAndNext } from "../hooks";
import { endpoints } from "../api/apiConfig";
import { InvoiceFormData, PriceComponent } from "../types";

// Extend InvoiceFormData to include funeralLeader & funeralNumber
type DeceasedInvoiceFormData = InvoiceFormData & {
  funeralLeader: string;
  funeralNumber: string;
};

export default function DeceasedInvoice() {
  const location = useLocation();
  const { overledeneId } = useParams<{ overledeneId: string }>();

  const initialData: DeceasedInvoiceFormData = {
    selectedVerzekeraar: "",
    priceComponents: [{ omschrijving: "", aantal: 1, bedrag: 0 }],
    discountAmount: 0,
    subtotal: 0,
    total: 0,
    isExcelButtonEnabled: true,
    funeralLeader: "",
    funeralNumber: "",
  };

  const { formData, handleChange, goNext, goBack, loading, error } = useFormHandler<DeceasedInvoiceFormData>({
    initialData,
    steps: ["/deceased-documents", "/deceaded-invoice", "/deceased-services", "/success-deceased"],
    fetchUrl: overledeneId ? `${endpoints.invoiceDeceased}/${overledeneId}` : undefined,
  });

  const saveUrl = overledeneId ? `${endpoints.invoiceDeceased}?overledeneId=${overledeneId}` : endpoints.invoiceDeceased;
  const handleNext = useSaveAndNext({ formData, endpoint: saveUrl, id: overledeneId, goNext });

  const { data, loading: dropdownLoading, errors: dropdownErrors } = useDropdownData({
    insurers: endpoints.insuranceCompanies,
  });

  // Recalculate subtotal & total whenever priceComponents or discountAmount changes
  useEffect(() => {
    const subtotal = formData.priceComponents.reduce((sum, pc) => sum + (Number(pc.bedrag) || 0) * (Number(pc.aantal) || 0),0);
    const total = subtotal - formData.discountAmount;
    handleChange({ subtotal, total });
  }, [formData.priceComponents, formData.discountAmount]);

  const updatePriceComponent = (idx: number, key: keyof PriceComponent, value: any) => {
    const updatedComponents = [...formData.priceComponents];
    updatedComponents[idx] = {
      ...updatedComponents[idx],
      [key]: key === "bedrag" || key === "aantal" 
        ? value === ""
          ? ""
          : Number(value) 
        : value,
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
      <div className="px-8 pb-8 max-w-8xl mx-auto space-y-6">
        {/* FuneralForm at the top */}
        <FuneralForm
          formData={formData}
          onChange={handleChange}
          onNext={() => goNext(location.pathname)}
          onBack={() => goBack(location.pathname)}
          readOnly={true}
        />

        <FormCard title="Factuur Overledene">
          {/* Insurance selection */}
          {/* Verzekeraar + Excel Button Row */}
          <div className="mt-4 flex items-end justify-between gap-4">
            <div className="w-64"> {/* fixed width for dropdown */}
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
            </div>

            <div>
              <button
                onClick={handleGenerateExcel}
                disabled={!formData.isExcelButtonEnabled || !formData.selectedVerzekeraar} 
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
              >
                Excel Genereren
              </button>
            </div>
          </div>

          {/* Price Components Table */}
          <div className="w-full">
            {/* Table Header */}
            <div className="flex gap-4 mb-2 font-semibold text-gray-700">
              <div className="flex-1">Omschrijving</div>
              <div className="w-20 flex-shrink-0">Aantal</div>
              <div className="w-20 flex-shrink-0">Bedrag</div>
              <div className="w-20 flex-shrink-0">Acties</div>
            </div>

            {/* Table Rows */}
            {formData.priceComponents.map((pc, idx) => (
              <div key={idx} className="flex gap-4 mb-2 items-end w-full">
                <div className="flex-1">
                  <input
                    type="text"
                    value={pc.omschrijving}
                    onChange={e => updatePriceComponent(idx, "omschrijving", e.target.value)}
                    disabled={!formData.selectedVerzekeraar}
                    className="w-full border-0 border-b border-gray-300 rounded-none focus:ring-0 focus:border-gray-900 text-sm py-1 disabled:opacity-50"
                  />
                </div>

                <div className="w-20 flex-shrink-0">
                  <input
                    type="number"
                    value={pc.aantal}
                    onChange={e => updatePriceComponent(idx, "aantal", e.target.value)}
                    disabled={!formData.selectedVerzekeraar}
                    className="w-full border-0 border-b border-gray-300 rounded-none focus:ring-0 focus:border-gray-900 text-sm py-1 disabled:opacity-50"
                  />
                </div>

                <div className="w-20 flex-shrink-0">
                  <input
                    type="number"
                    value={pc.bedrag}
                    onChange={e => updatePriceComponent(idx, "bedrag", e.target.value)}
                    disabled={!formData.selectedVerzekeraar}
                    className="w-full border-0 border-b border-gray-300 rounded-none focus:ring-0 focus:border-gray-900 text-sm py-1 disabled:opacity-50"
                  />
                </div>

                <div className="flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => removePriceComponent(idx)}
                    disabled={!formData.selectedVerzekeraar}
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm disabled:opacity-50"
                  >
                    Verwijder
                  </button>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={addPriceComponent}
              disabled={!formData.selectedVerzekeraar}
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 disabled:opacity-50 mt-2"
            >
              Voeg regel toe
            </button>
          </div>
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
                disabled={!formData.selectedVerzekeraar}
                className="w-24 border-0 border-b border-gray-300 rounded-none focus:ring-0 focus:border-gray-900"
              />
            </div>
            <div>Totaal: {formData.total}</div>
          </div>
        </FormCard>
      </div>
    </DashboardLayout>
  );
}