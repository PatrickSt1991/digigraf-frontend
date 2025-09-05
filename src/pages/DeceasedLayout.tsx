import { useLocation, useParams } from "react-router-dom";
import { DashboardLayout, FormCard, FormField, FuneralForm, FormRow } from "../components";
import { useDropdownData, useFormHandler, useSaveAndNext } from "../hooks";
import { endpoints } from "../api/apiConfig";

export default function LayoutDeceased() {
  const location = useLocation();
  const { overledeneId } = useParams<{ overledeneId: string }>();

  const { formData, handleChange, goNext, goBack, loading, error } = useFormHandler({
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
    steps: ["/insurance-information", "/layout-information", "/funeral-information", "/success-deceased"],
    fetchUrl: overledeneId ? `${endpoints.deceased}/${overledeneId}` : undefined,
  });

  const saveUrl = overledeneId ? `${endpoints.deceased}?overledeneId=${overledeneId}` : endpoints.deceased;

  const handleNext = useSaveAndNext({ formData, endpoint: saveUrl, id: overledeneId, goNext });

  const { data, loading: dropdownLoading, errors: dropdownErrors } = useDropdownData({
    coffinTypes: endpoints.coffins,
    coffinLengths: endpoints.coffinlenghts,
    caretakers: endpoints.caretakers,
  });

  if (loading) return <div>Loading layout deceased data...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <DashboardLayout>
      <div className="px-8 pb-8 max-w-8xl mx-auto space-y-6">
        <FuneralForm formData={formData} onChange={handleChange} onNext={() => goNext(location.pathname)} onBack={() => goBack(location.pathname)} readOnly={true} />

        <div className="grid grid-cols-1 gap-4">
          <FormCard title="Opbaren Overledene">
            <FormField label="Opbaring te" required name="layoutLocation" value={formData.layoutLocation} onChange={handleChange} />

            <FormField label="Uitvaartkist" required>
              {dropdownLoading.coffinTypes ? (
                <div>Loading...</div>
              ) : dropdownErrors.coffinTypes ? (
                <div className="text-red-600">{dropdownErrors.coffinTypes}</div>
              ) : (
                <select name="coffinType" value={formData.coffinType} onChange={handleChange} className="w-full border-0 border-b border-gray-300 rounded-none focus:ring-0 focus:border-gray-900">
                  <option value="">Selecteer Uitvaartkist...</option>
                  {data.coffinTypes?.map((c: any) => <option key={c.id} value={c.code}>{c.code} - {c.description}</option>)}
                </select>
              )}
            </FormField>

            <FormField label="Omschrijving" required name="coffinDescription" multiline rows={6} value={formData.coffinDescription} onChange={handleChange} />

            <FormField label="Lengte" required>
              {dropdownLoading.coffinLengths ? (
                <div>Loading...</div>
              ) : dropdownErrors.coffinLengths ? (
                <div className="text-red-600">{dropdownErrors.coffinLengths}</div>
              ) : (
                <select name="coffinLength" value={formData.coffinLength} onChange={handleChange} className="w-full border-0 border-b border-gray-300 rounded-none focus:ring-0 focus:border-gray-900">
                  <option value="">Selecteer lengte...</option>
                  {data.coffinLengths?.map((c: any) => <option key={c.id} value={c.code}>{c.description}</option>)}
                </select>
              )}
            </FormField>
            <FormRow cols={3}>            
                <FormField label="Verzorger 1" required>
                {dropdownLoading.caretakers ? (
                    <div>Loading...</div>
                ) : dropdownErrors.caretakers ? (
                    <div className="text-red-600">{dropdownErrors.caretakers}</div>
                ) : (
                    <select name="firstCaregiver" value={formData.firstCaregiver} onChange={handleChange} className="w-full border-0 border-b border-gray-300 rounded-none focus:ring-0 focus:border-gray-900">
                    <option value="">Selecteer Verzorger...</option>
                    {data.caretakers?.map((c: any) => <option key={c.id} value={c.code}>{c.displayName}</option>)}
                    </select>
                )}
                </FormField>
                <FormField label="Start" name="firstCaregiverStartTime" value={formData.firstCaregiverStartTime} onChange={handleChange} />
                <FormField label="Eind" name="firstCaregiverEndTime" value={formData.firstCaregiverEndTime} onChange={handleChange} />
            </FormRow>
            <FormRow cols={3}>
                <FormField label="Verzorger 2" required>
                {dropdownLoading.caretakers ? (
                    <div>Loading...</div>
                ) : dropdownErrors.caretakers ? (
                    <div className="text-red-600">{dropdownErrors.caretakers}</div>
                ) : (
                    <select name="secondCaregiver" value={formData.secondCaregiver} onChange={handleChange} className="w-full border-0 border-b border-gray-300 rounded-none focus:ring-0 focus:border-gray-900">
                    <option value="">Selecteer Verzorger...</option>
                    {data.caretakers?.map((c: any) => <option key={c.id} value={c.code}>{c.label}</option>)}
                    </select>
                )}
                </FormField>
                <FormField label="Start" name="secondCaregiverStartTime" value={formData.secondCaregiverStartTime} onChange={handleChange} />
                <FormField label="Eind" name="secondCaregiverEndTime" value={formData.secondCaregiverEndTime} onChange={handleChange} />
            </FormRow>
            <FormRow cols={3}>
                <FormField label="Verzorger 3" required>
                {dropdownLoading.caretakers ? (
                    <div>Loading...</div>
                ) : dropdownErrors.caretakers ? (
                    <div className="text-red-600">{dropdownErrors.caretakers}</div>
                ) : (
                    <select name="thirdCaregiver" value={formData.thirdCaregiver} onChange={handleChange} className="w-full border-0 border-b border-gray-300 rounded-none focus:ring-0 focus:border-gray-900">
                    <option value="">Selecteer Verzorger...</option>
                    {data.caretakers?.map((c: any) => <option key={c.id} value={c.code}>{c.label}</option>)}
                    </select>
                )}
                </FormField>
                <FormField label="Start" name="thirdCaregiverStartTime" value={formData.thirdCaregiverStartTime} onChange={handleChange} />
                <FormField label="Eind" name="thirdCaregiverEndTime" value={formData.thirdCaregiverEndTime} onChange={handleChange} />
            </FormRow>

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