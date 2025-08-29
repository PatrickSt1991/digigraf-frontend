import { useLocation, useParams } from "react-router-dom";
import { DashboardLayout, FormCard, FormField, FuneralForm } from "../components";
import { useDropdownData, useFormHandler, useSaveAndNext } from "../hooks";
import { endpoints } from "../api/apiConfig";

export default function LayoutDeceased() {
  const location = useLocation();
  const { overledeneId } = useParams<{ overledeneId: string }>();

  const {
    formData,
    handleChange,
    goNext,
    goBack,
    loading,
    error,
  } = useFormHandler({
    initialData: {
      funeralLeader: "",
      funeralNumber: "",
      layoutLocation: "",
      coffinType: "",
      coffinDescription: "",
      coffinLength: "",
      relativesVisited: "",
      firstCaregiver: "",
      firstCaregiverStartTime: "",
      firstCaregiverEndTime: "",
      secondCaregiver: "",
      secondCaregiverStartTime: "",
      secondCaregiverEndTime: "",
      thirdCaregiver: "",
      thirdCaregiverStartTime: "",
      thirdCaregiverEndTime: "",
      coolingHome: "",
      clothingPresent: "",
      clothingReturn: "",
      juwerly: "",
      juwerlyDescription: "",
      juwerlyReturn: "",
      additionalInformation: "",
    },
    steps: ["/insurance-information", "/layout-information", "/the-next-step", "/success-deceased"],
    fetchUrl: overledeneId ? `${endpoints.deceased}/${overledeneId}` : undefined,
  });

  const saveUrl = overledeneId
    ? `${endpoints.deceased}?overledeneId=${overledeneId}`
    : endpoints.deceased;

  const handleNext = useSaveAndNext({
    formData,
    endpoint: saveUrl,
    id: overledeneId,
    goNext,
  });

  const { data, loading: dropdownLoading, errors: dropdownErrors } = useDropdownData({
    coffinTypes: endpoints.coffins,
    funeralLeaders: endpoints.funeralLeaders,
    caretakers: endpoints.caretakers,
    coffinLengths: endpoints.coffinlenghts,
  });

  if (loading) return <div>Loading layout deceased data...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  const renderSelect = (
    key: string,
    value: string,
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void,
    placeholder: string
  ) => {
    if (dropdownLoading[key]) return <div>Loading...</div>;
    if (dropdownErrors[key]) return <div className="text-red-600">{dropdownErrors[key]}</div>;
    return (
      <select
        name={key}
        value={value}
        onChange={onChange}
        className="w-full border-0 border-b border-gray-300 rounded-none focus:ring-0 focus:border-gray-900"
      >
        <option value="">{placeholder}</option>
        {(data[key] || []).map((item: any) => (
          <option key={item.id} value={item.code}>
            {item.label}
          </option>
        ))}
      </select>
    );
  };

  return (
    <DashboardLayout>
      <div className="p-8 max-w-8xl mx-auto space-y-6">
        <FuneralForm
          formData={formData}
          onChange={handleChange}
          onNext={() => goNext(location.pathname)}
          onBack={() => goBack(location.pathname)}
          readOnly={true}
        />

        <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
          <FormCard title="Opbaren Overledene">
            <FormField label="Opbaring te" required name="layoutLocation" value={formData.layoutLocation} onChange={handleChange} />

            <FormField label="Uitvaartkist" required>
              {renderSelect("coffinTypes", formData.coffinType, handleChange, "Selecteer Uitvaartkist...")}
            </FormField>

            <FormField label="Omschrijving" required name="coffinDescription" multiline rows={6} value={formData.coffinDescription} onChange={handleChange} />

            <FormField label="Lengte" required>
              {renderSelect("coffinLengths", formData.coffinLength, handleChange, "Selecteer lengte...")}
            </FormField>

            <FormField label="Nabestanden bezocht">
              <select
                name="relativesVisited"
                value={formData.relativesVisited}
                onChange={handleChange}
                className="w-full border-0 border-b border-gray-300 rounded-none focus:ring-0 focus:border-gray-900"
              >
                <option value="">Selecteer een optie...</option>
                <option value="ja">Ja</option>
                <option value="nee">Nee</option>
                <option value="onbekend">Onbekend</option>
              </select>
            </FormField>

            <FormField label="Verzorger" required>
              {renderSelect("caretakers", formData.firstCaregiver, handleChange, "Selecteer Verzorger...")}
            </FormField>
            <FormField label="Start" name="firstCaregiverStartTime" value={formData.firstCaregiverStartTime} onChange={handleChange} />
            <FormField label="Eind" name="firstCaregiverEndTime" value={formData.firstCaregiverEndTime} onChange={handleChange} />

            <FormField label="Verzorger" required>
              {renderSelect("caretakers", formData.secondCaregiver, handleChange, "Selecteer Verzorger...")}
            </FormField>
            <FormField label="Start" name="secondCaregiverStartTime" value={formData.secondCaregiverStartTime} onChange={handleChange} />
            <FormField label="Eind" name="secondCaregiverEndTime" value={formData.secondCaregiverEndTime} onChange={handleChange} />

            <FormField label="Verzorger" required>
              {renderSelect("caretakers", formData.thirdCaregiver, handleChange, "Selecteer Verzorger...")}
            </FormField>
            <FormField label="Start" name="thirdCaregiverStartTime" value={formData.thirdCaregiverStartTime} onChange={handleChange} />
            <FormField label="Eind" name="thirdCaregiverEndTime" value={formData.thirdCaregiverEndTime} onChange={handleChange} />

            <FormField label="Koelvoorziening thuis">
              <select name="coolingHome" value={formData.coolingHome} onChange={handleChange} className="w-full border-0 border-b border-gray-300 rounded-none focus:ring-0 focus:border-gray-900">
                <option value="">Selecteer een optie...</option>
                <option value="ja">Ja</option>
                <option value="nee">Nee</option>
                <option value="onbekend">Onbekend</option>
              </select>
            </FormField>

            <FormField label="Kleding aanwezig">
              <select name="clothingPresent" value={formData.clothingPresent} onChange={handleChange} className="w-full border-0 border-b border-gray-300 rounded-none focus:ring-0 focus:border-gray-900">
                <option value="">Selecteer een optie...</option>
                <option value="ja">Ja</option>
                <option value="nee">Nee</option>
                <option value="onbekend">Onbekend</option>
              </select>
            </FormField>

            <FormField label="Kleding retour">
              <select name="clothingReturn" value={formData.clothingReturn} onChange={handleChange} className="w-full border-0 border-b border-gray-300 rounded-none focus:ring-0 focus:border-gray-900">
                <option value="">Selecteer een optie...</option>
                <option value="ja">Ja</option>
                <option value="nee">Nee</option>
                <option value="onbekend">Onbekend</option>
              </select>
            </FormField>

            <FormField label="Sieraden">
              <select name="juwerly" value={formData.juwerly} onChange={handleChange} className="w-full border-0 border-b border-gray-300 rounded-none focus:ring-0 focus:border-gray-900">
                <option value="">Selecteer een optie...</option>
                <option value="ja">Ja</option>
                <option value="nee">Nee</option>
                <option value="onbekend">Onbekend</option>
              </select>
            </FormField>

            <FormField label="Sieraden omschrijving" required name="juwerlyDescription" multiline rows={6} value={formData.juwerlyDescription} onChange={handleChange} />

            <FormField label="Sieraden retour">
              <select name="juwerlyReturn" value={formData.juwerlyReturn} onChange={handleChange} className="w-full border-0 border-b border-gray-300 rounded-none focus:ring-0 focus:border-gray-900">
                <option value="">Selecteer een optie...</option>
                <option value="ja">Ja</option>
                <option value="nee">Nee</option>
                <option value="onbekend">Onbekend</option>
              </select>
            </FormField>

            <FormField label="Extra informatie" required name="additionalInformation" multiline rows={6} value={formData.additionalInformation} onChange={handleChange} />
          </FormCard>
        </div>
      </div>
      </DashboardLayout>
    );
}
