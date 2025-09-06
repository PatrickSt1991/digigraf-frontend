import { useEffect, useRef } from "react";
import { useLocation, useParams } from "react-router-dom";
import { DashboardLayout, FormCard, FormField, FuneralForm } from "../components";
import { useDropdownData, useFormHandler, useSaveAndNext } from "../hooks";
import { endpoints } from "../api/apiConfig";
import { InsuranceEntry } from "../types";

export default function InsuranceDeceased() {
  const location = useLocation();
  const { overledeneId } = useParams();
  const initializedRef = useRef(false);

  const {
    formData,
    handleChange,
    setFormData,
    goNext,
    goBack,
    loading: formLoading,
    error: formError,
  } = useFormHandler({
    initialData: {
      funeralLeader: "",
      funeralNumber: "",
      insuranceEntries: [] as InsuranceEntry[],
      age: "",
    },
    steps: [
      "/deceased-information",
      "/deceased-insurance",
      "/deceased-layout",
      "/success-deceased",
    ],
    fetchUrl: overledeneId
      ? `${endpoints.deceased}/${overledeneId}/insurances`
      : undefined,
  });

  const saveUrl = overledeneId
    ? `${endpoints.insuranceDeceased}?overledeneId=${overledeneId}`
    : endpoints.insuranceDeceased;

  const handleNext = useSaveAndNext({
    formData,
    endpoint: saveUrl,
    id: overledeneId,
    goNext,
  });

  const { data, loading: dropdownLoading, errors: dropdownErrors } = useDropdownData({
    insuranceCompanies: endpoints.insuranceCompanies,
  });

  // Always seed 5 default entries on first render, after dropdown load or error
  useEffect(() => {
    if (!initializedRef.current && !formLoading) {
      const entries: InsuranceEntry[] = Array.from({ length: 5 }).map(() => ({
        insuranceCompanyId: "",
        policyNumber: "",
        premium: undefined,
      }));
      setFormData(prev => ({ ...prev, insuranceEntries: entries }));
      initializedRef.current = true;
    }
  }, [formLoading, setFormData]);

  const handleEntryChange = (
    index: number,
    field: keyof InsuranceEntry,
    value: string | number
  ) => {
    const updated = [...formData.insuranceEntries];
    updated[index] = {
      ...updated[index],
      [field]: field === "premium" ? (value === "" ? undefined : Number(value)) : value,
    };
    setFormData(prev => ({ ...prev, insuranceEntries: updated }));
  };

  const addEntry = () => {
    const newEntry: InsuranceEntry = { insuranceCompanyId: "", policyNumber: "", premium: undefined };
    setFormData(prev => ({ ...prev, insuranceEntries: [...prev.insuranceEntries, newEntry] }));
  };

  const removeEntry = (index: number) => {
    const updated = formData.insuranceEntries.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, insuranceEntries: updated }));
  };

  return (
    <DashboardLayout>
      <div className="px-8 pb-8 max-w-8xl mx-auto space-y-6">
        <FuneralForm
          formData={formData}
          onChange={handleChange}
          onNext={() => goNext(location.pathname)}
          onBack={() => goBack(location.pathname)}
          readOnly={true}
        />

        {formLoading && <div>Gegevens laden...</div>}
        {formError && <div className="text-red-600">{formError}</div>}

        <FormCard title="Verzekeringen">
          {formData.insuranceEntries.map((entry: InsuranceEntry, index: number) => (
            <div
              key={index}
              className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 p-4 border rounded"
            >
              <FormField label="Verzekeringsmaatschappij" required>
                {dropdownLoading.insuranceCompanies ? (
                  <div>Loading...</div>
                ) : dropdownErrors.insuranceCompanies ? (
                  <div className="text-red-600">{dropdownErrors.insuranceCompanies}</div>
                ) : (
                  <select
                    value={entry.insuranceCompanyId}
                    onChange={e => handleEntryChange(index, "insuranceCompanyId", e.target.value)}
                    className="w-full border-0 border-b border-gray-300 rounded-none focus:ring-0 focus:border-gray-900"
                  >
                    <option value="">Selecteer een maatschappij...</option>
                    {(data.insuranceCompanies || []).map((c: any) => (
                      <option key={c.id} value={c.id}>{c.label ?? c.name ?? c.value}</option>
                    ))}
                  </select>
                )}
              </FormField>
              <FormField label="Polisnummer" required>
                <input
                  type="text"
                  value={entry.policyNumber}
                  onChange={e => handleEntryChange(index, "policyNumber", e.target.value)}
                  className="w-full border-0 border-b border-gray-300 rounded-none focus:ring-0 focus:border-gray-900"
                  placeholder="Voer polisnummer in..."
                />
              </FormField>

              <FormField label="Premie (€)">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={entry.premium ?? ""}
                  onChange={e => handleEntryChange(index, "premium", e.target.value)}
                  className="w-full border-0 border-b border-gray-300 rounded-none focus:ring-0 focus:border-gray-900"
                  placeholder="0.00"
                />
              </FormField>

              <div className="flex items-end">
                {formData.insuranceEntries.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeEntry(index)}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                    title="Verwijder deze verzekering"
                  >
                    Verwijder
                  </button>
                )}
              </div>
            </div>
          ))}

          <div className="flex gap-4 mt-6">
            <button
              type="button"
              onClick={addEntry}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
            >
              Voeg extra polis toe
            </button>
          </div>
        </FormCard>
      </div>
    </DashboardLayout>
  );
}