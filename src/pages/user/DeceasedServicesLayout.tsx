import { useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import {
  DashboardLayout,
  FormCard,
  FormField,
  FormRow,
  FuneralForm,
} from "../../components";
import { useDropdownData, useFormHandler, useSaveAndNext } from "../../hooks";
import { endpoints } from "../../api/apiConfig";
import apiClient from "../../api/apiClient";
import CompleteDossierModal from "../../modals/user/CompleteDossierModal";

type Worksheet = {
  employee: string;
  otherServices: string;
  hearse: boolean;
  escortVehicle: boolean;
  lastCare: boolean;
  transfer: boolean;
  condolence: boolean;
};

type DeceasedServicesFormData = {
  id?: string;
  funeralLeader: string;
  funeralNumber: string;
  attendantIntake: string;

  stoneDescription: string;
  stoneAmount: string;
  stoneSupplier: string;
  stoneEmployee: string;

  flowerDescription: string;
  flowerAmount: string;
  flowerSupplier: string;
  flowerEmployee: string;
  flowersWithCard: boolean;
  flowersWithRibbon: boolean;
  deliveryAddress: string;
  deliveryDate: string;
  ribbon1: string;
  ribbon2: string;
  ribbon3: string;
  ribbon4: string;

  urnDescription: string;
  urnAmount: string;
  urnSupplier: string;
  urnEmployee: string;

  worksheets: Worksheet[];

  customerScore: string;
  isNotificationEnabled: boolean;
};

export default function DeceasedServicesLayout() {
  const location = useLocation();
  const { dossierId } = useParams<{ dossierId: string }>();

  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);

  const navState = location.state as
    | {
        dossierId?: string;
        funeralLeader?: string;
        funeralNumber?: string;
      }
    | undefined;

  const {
    formData,
    handleChange,
    setFormData,
    goBack,
    loading,
    error,
  } = useFormHandler<DeceasedServicesFormData>({
    initialData: {
      id: dossierId ?? "",
      funeralLeader: navState?.funeralLeader ?? "",
      funeralNumber: navState?.funeralNumber ?? "",
      attendantIntake: "",

      stoneDescription: "",
      stoneAmount: "",
      stoneSupplier: "",
      stoneEmployee: "",

      flowerDescription: "",
      flowerAmount: "",
      flowerSupplier: "",
      flowerEmployee: "",
      flowersWithCard: false,
      flowersWithRibbon: false,
      deliveryAddress: "",
      deliveryDate: "",
      ribbon1: "",
      ribbon2: "",
      ribbon3: "",
      ribbon4: "",

      urnDescription: "",
      urnAmount: "",
      urnSupplier: "",
      urnEmployee: "",

      worksheets: [
        {
          employee: "",
          otherServices: "",
          hearse: false,
          escortVehicle: false,
          lastCare: false,
          transfer: false,
          condolence: false,
        },
      ],

      customerScore: "",
      isNotificationEnabled: false,
    },
    steps: ["/deceased-invoice", "/deceased-services", "/success-deceased"],
    fetchUrl: dossierId ? `${endpoints.deceasedServices}/${dossierId}` : undefined,
    allow404AsEmpty: true,
  });

  const { data, loading: dropdownLoading, errors: dropdownErrors } =
    useDropdownData({
      suppliers: endpoints.suppliers,
      employees: endpoints.employees,
    });

  const saveUrl = dossierId
    ? `${endpoints.deceasedServices}/${dossierId}`
    : endpoints.deceasedServices;

  const { handleSaveAndClose } = useSaveAndNext({
    formData,
    endpoint: saveUrl,
    id: dossierId as string | undefined,
    getClosePath: () => "/dashboard",
    getCloseState: (_result, currentId) => ({
      dossierId: currentId ?? formData.id ?? "",
      funeralLeader: formData.funeralLeader ?? "",
      funeralNumber: formData.funeralNumber ?? "",
    }),
  });

  const stoneSuppliers =
    data.suppliers?.filter((s: any) => s.type?.code === "Steenhouwer") ?? [];

  const flowerSuppliers =
    data.suppliers?.filter((s: any) => s.type?.code === "Bloemen") ?? [];

  const urnSuppliers =
    data.suppliers?.filter((s: any) => s.type?.code === "UrnAndGedenksieraden") ??
    [];

  const handleWorksheetChange = (
    index: number,
    name: keyof Worksheet,
    value: string | boolean
  ) => {
    setFormData((prev) => {
      const newWorksheets = [...prev.worksheets];
      newWorksheets[index] = {
        ...newWorksheets[index],
        [name]: value,
      };

      return {
        ...prev,
        worksheets: newWorksheets,
      };
    });
  };

  const addWorksheet = () => {
    setFormData((prev) => ({
      ...prev,
      worksheets: [
        ...prev.worksheets,
        {
          employee: "",
          otherServices: "",
          hearse: false,
          escortVehicle: false,
          lastCare: false,
          transfer: false,
          condolence: false,
        },
      ],
    }));
  };

  const removeWorksheet = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      worksheets: prev.worksheets.filter((_, i) => i !== index),
    }));
  };

  const handleOpenCompleteModal = () => {
    setIsCompleteModalOpen(true);
  };

  const handleCloseCompleteModal = () => {
    setIsCompleteModalOpen(false);
  };

  const handleConfirmComplete = async ({
    customerScore,
    isNotificationEnabled,
    file,
  }: {
    customerScore: string;
    isNotificationEnabled: boolean;
    file: File;
  }) => {
    const nextFormData: DeceasedServicesFormData = {
      ...formData,
      customerScore,
      isNotificationEnabled,
    };

    setFormData(nextFormData);

    const saveResult = await apiClient<any>(saveUrl, {
      method: dossierId ? "PUT" : "POST",
      body: nextFormData,
    });

    const resolvedDossierId =
      dossierId ?? saveResult?.id ?? nextFormData.id ?? "";

    if (!resolvedDossierId) {
      throw new Error("Geen dossierId beschikbaar na opslaan.");
    }

    const uploadData = new FormData();
    uploadData.append("file", file);
    uploadData.append("customerScore", customerScore);
    uploadData.append(
      "isNotificationEnabled",
      String(isNotificationEnabled)
    );

    // Pas dit endpoint aan als jouw backend route anders heet.
    const response = await fetch(
      `${endpoints.deceasedServices}/${resolvedDossierId}/complete`,
      {
        method: "POST",
        body: uploadData,
      }
    );

    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || "Afronden mislukt.");
    }

    setIsCompleteModalOpen(false);
    window.location.href = `/success-deceased/${resolvedDossierId}`;
  };

  if (loading) return <div>Loading data...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <DashboardLayout>
      <div className="px-8 pb-8 max-w-8xl mx-auto space-y-6">
        <FuneralForm
          formData={formData}
          onChange={handleChange}
          onBack={() =>
            goBack(location.pathname, {
              dossierId: dossierId ?? formData.id ?? "",
              funeralLeader: formData.funeralLeader ?? "",
              funeralNumber: formData.funeralNumber ?? "",
            })
          }
          onSaveAndClose={handleSaveAndClose}
          onComplete={handleOpenCompleteModal}
          isLastStep={true}
          readOnly={true}
        />

        <FormCard title="Steenhouwerij">
          <FormField
            label="Omschrijving"
            required
            name="stoneDescription"
            multiline
            rows={6}
            value={formData.stoneDescription}
            onChange={handleChange}
          />
          <FormRow cols={2}>
            <FormField
              label="Bedrag"
              name="stoneAmount"
              type="number"
              value={formData.stoneAmount}
              onChange={handleChange}
            />
            <FormField label="Leverancier" required>
              {dropdownLoading.suppliers ? (
                <div>Loading...</div>
              ) : dropdownErrors.suppliers ? (
                <div className="text-red-600">{dropdownErrors.suppliers}</div>
              ) : (
                <select
                  name="stoneSupplier"
                  value={formData.stoneSupplier}
                  onChange={handleChange}
                  className="w-full border-0 border-b border-gray-300 rounded-none focus:ring-0 focus:border-gray-900"
                >
                  <option value="">Selecteer Leverancier...</option>
                  {stoneSuppliers.map((s: any) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              )}
            </FormField>
          </FormRow>
          <FormRow cols={2}>
            <FormField label="Persoon overzicht">
              {dropdownLoading.employees ? (
                <div>Loading...</div>
              ) : dropdownErrors.employees ? (
                <div className="text-red-600">{dropdownErrors.employees}</div>
              ) : (
                <select
                  name="stoneEmployee"
                  value={formData.stoneEmployee}
                  onChange={handleChange}
                  className="w-full border-0 border-b border-gray-300 rounded-none focus:ring-0 focus:border-gray-900"
                >
                  <option value="">Selecteer Werknemer...</option>
                  {data.employees?.map((e: any) => (
                    <option key={e.id} value={e.id}>
                      {e.fullName}
                    </option>
                  ))}
                </select>
              )}
            </FormField>
          </FormRow>
        </FormCard>

        <FormCard title="Bloemen">
          <FormField
            label="Omschrijving"
            name="flowerDescription"
            multiline
            rows={6}
            value={formData.flowerDescription}
            onChange={handleChange}
          />
          <FormRow cols={2}>
            <FormField
              label="Bedrag"
              name="flowerAmount"
              type="number"
              value={formData.flowerAmount}
              onChange={handleChange}
            />
            <FormField label="Leverancier">
              {dropdownLoading.suppliers ? (
                <div>Loading...</div>
              ) : dropdownErrors.suppliers ? (
                <div className="text-red-600">{dropdownErrors.suppliers}</div>
              ) : (
                <select
                  name="flowerSupplier"
                  value={formData.flowerSupplier}
                  onChange={handleChange}
                  className="w-full border-0 border-b border-gray-300 rounded-none focus:ring-0 focus:border-gray-900"
                >
                  <option value="">Selecteer Leverancier...</option>
                  {flowerSuppliers.map((s: any) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              )}
            </FormField>
          </FormRow>
        </FormCard>

        <FormCard title="Urnen en Gedenksieraden">
          <FormField
            label="Omschrijving"
            name="urnDescription"
            multiline
            rows={6}
            value={formData.urnDescription}
            onChange={handleChange}
          />
          <FormRow cols={2}>
            <FormField
              label="Bedrag"
              name="urnAmount"
              type="number"
              value={formData.urnAmount}
              onChange={handleChange}
            />
            <FormField label="Leverancier">
              {dropdownLoading.suppliers ? (
                <div>Loading...</div>
              ) : dropdownErrors.suppliers ? (
                <div className="text-red-600">{dropdownErrors.suppliers}</div>
              ) : (
                <select
                  name="urnSupplier"
                  value={formData.urnSupplier}
                  onChange={handleChange}
                  className="w-full border-0 border-b border-gray-300 rounded-none focus:ring-0 focus:border-gray-900"
                >
                  <option value="">Selecteer Leverancier...</option>
                  {urnSuppliers.map((s: any) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              )}
            </FormField>
          </FormRow>
        </FormCard>

        <FormCard title="Werkbonnen">
          {formData.worksheets.map((worksheet: Worksheet, index: number) => (
            <div key={index} className="border-b border-gray-200 pb-4 mb-4">
              <FormRow cols={2}>
                <FormField label="Personeel" required>
                  {dropdownLoading.employees ? (
                    <div>Loading...</div>
                  ) : dropdownErrors.employees ? (
                    <div className="text-red-600">{dropdownErrors.employees}</div>
                  ) : (
                    <select
                      name="employee"
                      value={worksheet.employee}
                      onChange={(e) =>
                        handleWorksheetChange(index, "employee", e.target.value)
                      }
                      className="w-full border-0 border-b border-gray-300 rounded-none focus:ring-0 focus:border-gray-900"
                    >
                      <option value="">Selecteer Personeel...</option>
                      {data.employees?.map((e: any) => (
                        <option key={e.id} value={e.id}>
                          {e.fullName}
                        </option>
                      ))}
                    </select>
                  )}
                </FormField>

                <FormField
                  label="Overige diensten"
                  multiline
                  rows={4}
                  name="otherServices"
                  value={worksheet.otherServices}
                  onChange={(e) =>
                    handleWorksheetChange(index, "otherServices", e.target.value)
                  }
                />
              </FormRow>

              <FormRow cols={3}>
                <FormField
                  label="Rouwauto"
                  type="checkbox"
                  name="hearse"
                  checked={worksheet.hearse}
                  onChange={(e) =>
                    handleWorksheetChange(index, "hearse", e.target.checked)
                  }
                />
                <FormField
                  label="Volgauto"
                  type="checkbox"
                  name="escortVehicle"
                  checked={worksheet.escortVehicle}
                  onChange={(e) =>
                    handleWorksheetChange(index, "escortVehicle", e.target.checked)
                  }
                />
                <FormField
                  label="Laatste verzorging"
                  type="checkbox"
                  name="lastCare"
                  checked={worksheet.lastCare}
                  onChange={(e) =>
                    handleWorksheetChange(index, "lastCare", e.target.checked)
                  }
                />
              </FormRow>

              <FormRow cols={3}>
                <FormField
                  label="Overbrengen"
                  type="checkbox"
                  name="transfer"
                  checked={worksheet.transfer}
                  onChange={(e) =>
                    handleWorksheetChange(index, "transfer", e.target.checked)
                  }
                />
                <FormField
                  label="Condoleance"
                  type="checkbox"
                  name="condolence"
                  checked={worksheet.condolence}
                  onChange={(e) =>
                    handleWorksheetChange(index, "condolence", e.target.checked)
                  }
                />
              </FormRow>

              <div className="flex justify-end mt-2">
                {formData.worksheets.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeWorksheet(index)}
                    className="px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600"
                  >
                    Verwijder werkbon
                  </button>
                )}
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addWorksheet}
            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
          >
            Werkbon toevoegen
          </button>
        </FormCard>
      </div>

      <CompleteDossierModal
        isOpen={isCompleteModalOpen}
        onClose={handleCloseCompleteModal}
        onConfirm={handleConfirmComplete}
        initialCustomerScore={formData.customerScore}
        initialNotificationEnabled={formData.isNotificationEnabled}
      />
    </DashboardLayout>
  );
}