import { useLocation, useParams } from "react-router-dom";
import { useEffect } from "react";
import {
  DashboardLayout,
  FormCard,
  FuneralForm,
  FormField,
} from "../../components";
import {
  useDropdownData,
  useFormHandler,
  useSaveAndNext,
} from "../../hooks";
import { endpoints } from "../../api/apiConfig";
import { InvoiceFormData, PriceComponent } from "../../types";

type DeceasedInvoiceFormData = InvoiceFormData & {
  funeralLeader: string;
  funeralNumber: string;
};

export default function DeceasedInvoice() {
  const location = useLocation();
  const { overledeneId } = useParams<{ overledeneId: string }>();

  const initialData: DeceasedInvoiceFormData = {
    insurancePartyId: "",
    priceComponents: [{ omschrijving: "", aantal: 1, bedrag: 0 }],
    discountAmount: 0,
    subtotal: 0,
    total: 0,
    isExcelButtonEnabled: true,
    funeralLeader: "",
    funeralNumber: "",
  };

  const {
    formData,
    handleChange,
    goNext,
    goBack,
    loading,
    error,
  } = useFormHandler<DeceasedInvoiceFormData>({
    initialData,
    steps: [
      "/deceased-documents",
      "/deceased-invoice",
      "/deceased-services",
      "/success-deceased",
    ],
    fetchUrl: overledeneId
      ? `${endpoints.invoiceDeceased}/${overledeneId}`
      : undefined,
  });

  const saveUrl = overledeneId
    ? `${endpoints.invoiceDeceased}?overledeneId=${overledeneId}`
    : endpoints.invoiceDeceased;

  const handleNext = useSaveAndNext({
    formData,
    endpoint: saveUrl,
    id: overledeneId,
    goNext,
  });

  const {
    data,
    loading: dropdownLoading,
    errors: dropdownErrors,
  } = useDropdownData({
    insuranceParties: endpoints.insuranceCompanies,
  });

  const insurers =
    data.insuranceParties?.filter((p: any) => p.isInsurance) ?? [];

  /* -------------------------------------------------------------------------- */
  /*                          CALCULATIONS (SUB / TOTAL)                         */
  /* -------------------------------------------------------------------------- */

  useEffect(() => {
    const subtotal = formData.priceComponents.reduce(
      (sum, pc) =>
        sum +
        (Number(pc.bedrag) || 0) * (Number(pc.aantal) || 0),
      0
    );

    const total = subtotal - (Number(formData.discountAmount) || 0);

    handleChange({ subtotal, total });
  }, [formData.priceComponents, formData.discountAmount]);

/* -------------------------------------------------------------------------- */
/*                  LOAD PRICE TEMPLATE ON INSURER CHANGE                      */
/* -------------------------------------------------------------------------- */

useEffect(() => {
  if (!formData.insurancePartyId) {
    handleChange({ priceComponents: [] });
    return;
  }

  fetch(
    `${endpoints.invoiceDeceased}/templates?insurancePartyId=${formData.insurancePartyId}`
  )
    .then((res) => {
      if (!res.ok) throw new Error("Failed to load price template");
      return res.json();
    })
    .then((components: PriceComponent[]) => {
      handleChange({ priceComponents: components });
    })
    .catch(() => {
      handleChange({ priceComponents: [] });
    });
}, [formData.insurancePartyId]);


  /* -------------------------------------------------------------------------- */
  /*                              PRICE COMPONENTS                              */
  /* -------------------------------------------------------------------------- */

  const updatePriceComponent = (
    idx: number,
    key: keyof PriceComponent,
    value: any
  ) => {
    const updated = [...formData.priceComponents];
    updated[idx] = {
      ...updated[idx],
      [key]:
        key === "bedrag" || key === "aantal"
          ? value === ""
            ? ""
            : Number(value)
          : value,
    };
    handleChange({ priceComponents: updated });
  };

  const addPriceComponent = () => {
    handleChange({
      priceComponents: [
        ...formData.priceComponents,
        { omschrijving: "", aantal: 1, bedrag: 0 },
      ],
    });
  };

  const removePriceComponent = (idx: number) => {
    handleChange({
      priceComponents: formData.priceComponents.filter(
        (_, i) => i !== idx
      ),
    });
  };

  /* -------------------------------------------------------------------------- */
  /*                                EXCEL EXPORT                                 */
  /* -------------------------------------------------------------------------- */

  const handleGenerateExcel = async () => {
    const response = await fetch(
      `${endpoints.invoiceDeceased}/generate-excel`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      }
    );

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  };

  /* -------------------------------------------------------------------------- */
  /*                                    RENDER                                   */
  /* -------------------------------------------------------------------------- */

  return (
    <DashboardLayout>
      <div className="px-8 pb-8 max-w-8xl mx-auto space-y-6">
        {/* Funeral header */}
        <FuneralForm
          formData={formData}
          onChange={handleChange}
          onNext={() => goNext(location.pathname)}
          onBack={() => goBack(location.pathname)}
          readOnly
        />

        <FormCard title="Factuur Overledene">
          {/* Verzekeraar + Excel */}
          <div className="mt-4 flex items-end justify-between gap-4">
            <div className="w-64">
              <FormField label="Verzekeraar">
                {dropdownLoading.insuranceParties ? (
                  <div>Loading...</div>
                ) : dropdownErrors.insuranceParties ? (
                  <div className="text-red-600">
                    {dropdownErrors.insuranceParties}
                  </div>
                ) : (
                  <select
                    name="insurancePartyId"
                    value={formData.insurancePartyId}
                    onChange={handleChange}
                    className="w-full border-0 border-b border-gray-300 rounded-none focus:ring-0 focus:border-gray-900"
                  >
                    <option value="">Selecteer verzekeraar...</option>
                    {insurers.map((p: any) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                )}
              </FormField>
            </div>

            <button
              onClick={handleGenerateExcel}
              disabled={
                !formData.insurancePartyId ||
                !formData.isExcelButtonEnabled
              }
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
            >
              Excel Genereren
            </button>
          </div>

          {/* Price table */}
          <div className="w-full mt-6">
            <div className="flex gap-4 mb-2 font-semibold text-gray-700">
              <div className="flex-1">Omschrijving</div>
              <div className="w-20">Aantal</div>
              <div className="w-20">Bedrag</div>
              <div className="w-20">Acties</div>
            </div>

            {formData.priceComponents.map((pc, idx) => (
              <div
                key={idx}
                className="flex gap-4 mb-2 items-end w-full"
              >
                <div className="flex-1">
                  <input
                    type="text"
                    value={pc.omschrijving}
                    onChange={(e) =>
                      updatePriceComponent(
                        idx,
                        "omschrijving",
                        e.target.value
                      )
                    }
                    disabled={!formData.insurancePartyId}
                    className="w-full border-0 border-b border-gray-300 focus:ring-0 text-sm disabled:opacity-50"
                  />
                </div>

                <div className="w-20">
                  <input
                    type="number"
                    value={pc.aantal}
                    onChange={(e) =>
                      updatePriceComponent(
                        idx,
                        "aantal",
                        e.target.value
                      )
                    }
                    disabled={!formData.insurancePartyId}
                    className="w-full border-0 border-b border-gray-300 focus:ring-0 text-sm disabled:opacity-50"
                  />
                </div>

                <div className="w-20">
                  <input
                    type="number"
                    value={pc.bedrag}
                    onChange={(e) =>
                      updatePriceComponent(
                        idx,
                        "bedrag",
                        e.target.value
                      )
                    }
                    disabled={!formData.insurancePartyId}
                    className="w-full border-0 border-b border-gray-300 focus:ring-0 text-sm disabled:opacity-50"
                  />
                </div>

                <div className="w-20">
                  <button
                    type="button"
                    onClick={() => removePriceComponent(idx)}
                    disabled={!formData.insurancePartyId}
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
              disabled={!formData.insurancePartyId}
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 disabled:opacity-50 mt-2"
            >
              Voeg regel toe
            </button>
          </div>

          {/* Totals */}
          <div className="mt-6 space-y-2">
            <div>Subtotaal: € {formData.subtotal}</div>
            <div>
              Korting:{" "}
              <input
                type="number"
                name="discountAmount"
                value={formData.discountAmount}
                onChange={handleChange}
                disabled={!formData.insurancePartyId}
                className="w-24 border-0 border-b border-gray-300 focus:ring-0"
              />
            </div>
            <div className="font-semibold">
              Totaal: € {formData.total}
            </div>
          </div>
        </FormCard>
      </div>
    </DashboardLayout>
  );
}
