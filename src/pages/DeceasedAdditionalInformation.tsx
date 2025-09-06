import { useLocation, useParams } from "react-router-dom";
import { DashboardLayout, FormCard, FormField, FuneralForm } from "../components";
import { useDropdownData, useFormHandler, useSaveAndNext } from "../hooks";
import { calculateAge } from "../utils/calculateAge";
import { endpoints } from "../api/apiConfig";

export default function AdditionalInformationDeceased() {
  const location = useLocation();
  const { overledeneId } = useParams();

  const {
    formData,
    handleChange,
    handleDateChange,
    goNext,
    goBack,
    loading: formLoading,
    error: formError,
  } = useFormHandler({
    initialData: {
      // Additional information about the deceased
      maritalstatus: "",
      belief: "",
      numberofchilderen: "",
      numberofminors: "",
      numberofdeceased: "",
      firstparent: "",
      firstparentdeceased: "",
      secondparent: "",
      secondparentdeceased: "",
      executor: "",
      executorphone: "",
      notary: "",
      notaryphone: "",
      will: "",

      // Client information
      socialsecurity: "",
      salutation: "",
      lastname: "",
      firstname: "",
      dob: "",
      age: "",
      postalCode: "",
      housenumber: "",
      housenumberAddition: "",
      street: "",
      city: "",
      county: "",
      phonenumber: "",
      email: "",
      relation: "",
      notes: "",

      // Funeral info
      funeralLeader: "",
      funeralNumber: "",
    },
    steps: ["/deceased","/deceased-information","/deceased-insurance","/success-deceased"],
    dateFieldName: "dob",
    calculateAge,
    fetchUrl: overledeneId ? `${endpoints.additional}/${overledeneId}` : undefined,
  });

  const saveurl = overledeneId 
    ? `${endpoints.additional}?overledeneId=${overledeneId}`
    : endpoints.additional;

  const handleNext = useSaveAndNext({
    formData,
    endpoint: saveurl,
    id: overledeneId,
    goNext,
  });

  const { data, loading: dropdownLoading, errors: dropdownErrors } = useDropdownData({
    maritialstatuses: endpoints.maritalstatuses,
    salutations: endpoints.salutation,
  });

  return (
    <DashboardLayout>
      <div className="px-8 pb-8 max-w-8xl mx-auto space-y-6">
        {/* Additional information deceased form */}
        <FuneralForm
          formData={formData}
          onChange={handleChange}
          onNext={() => goNext(location.pathname)} //handleNext = prod
          onBack={() => goBack(location.pathname)}
          readOnly={true}
        />

        {/* Handle form-level fetch errors */}
        {formLoading && <div>Gegevens laden...</div>}
        {formError && <div className="text-red-600">{formError}</div>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Left column */}
          <FormCard title="Extra Gegevens Overledene">
            <FormField label="Burgelijkestaat">
              {dropdownLoading.maritalstatus ? (
                <div>Loading...</div>
              ) : dropdownErrors.maritalstatus ? (
                <div className="text-red-600">{ dropdownErrors.maritalstatus }</div>
              ) : (
                <select
                  name="maritalstatus"
                  value={formData.maritalstatus}
                  onChange={handleChange}
                  className="w-full border-0 border-b border-gray-300 rounded-none focus:ring-0 focus:border-gray-900"
                >
                  <option value="">Selecteer een burgelijkestaat...</option>
                  {data.maritialstatuses?.map((ms: any) => (
                    <option key={ms.id} value={ms.code}>
                      {ms.label}
                    </option>
                  ))}
                </select>
              )}
            </FormField>
            <FormField label="Levensovertuiging" name="belief" value={formData.belief} onChange={handleChange} />
            <FormField label="Aantal kinderen" name="numberofchilderen" value={formData.numberofchilderen} onChange={handleChange} />
            <FormField label="Waarvan minderjarig" name="numberofminors" value={formData.numberofminors} onChange={handleChange} />
            <FormField label="Waarvan overleden" name="numberofdeceased" value={formData.numberofdeceased} onChange={handleChange} />
            <FormField label="Eerste ouder overledene" name="firstparent" value={formData.firstparent} onChange={handleChange} />
            <FormField label="Eerste ouder overleden">
              <select
                name="firstparentdeceased"
                value={formData.firstparentdeceased}
                onChange={handleChange}
                className="w-full border-0 border-b border-gray-300 rounded-none focus:ring-0 focus:border-gray-900"
              >
                <option value="">Selecteer een optie...</option>
                <option value="ja">Ja</option>
                <option value="nee">Nee</option>
                <option value="onbekend">Onbekend</option>
              </select>
            </FormField>
            <FormField label="Tweede ouder overledene" name="secondparent" value={formData.secondparent} onChange={handleChange} />
            <FormField label="Tweede ouder overleden">
              <select
                name="secondparentdeceased"
                value={formData.secondparentdeceased}
                onChange={handleChange}
                className="w-full border-0 border-b border-gray-300 rounded-none focus:ring-0 focus:border-gray-900"
              >
                <option value="">Selecteer een optie...</option>
                <option value="ja">Ja</option>
                <option value="nee">Nee</option>
                <option value="onbekend">Onbekend</option>
              </select>
            </FormField>
            <FormField label="Executeur" name="executor" value={formData.executor} onChange={handleChange} />
            <FormField label="Executeur Telefoon" name="executorphone" value={formData.executorphone} onChange={handleChange} />
            <FormField label="Notaris" name="notary" value={formData.notary} onChange={handleChange} />
            <FormField label="Notaris Telefoon" name="notaryphone" value={formData.notaryphone} onChange={handleChange} />
            <FormField label="Testament" name="will" value={formData.will} onChange={handleChange} />
          </FormCard>

          {/* Right Column */}
          <FormCard title="Persoonsgegevens Opdrachtgever">
            <FormField label="BSN" name="socialsecurity" value={formData.socialsecurity} onChange={handleChange} />
            <FormField label="Aanhef" required>
              {dropdownLoading.salutations ? (
                <div>Loading...</div>
              ) : dropdownErrors.salutations ? (
                <div className="text-red-600">{ dropdownErrors.salutations }</div>
              ) : (
                <select
                  name="salutation"
                  value={formData.salutation}
                  onChange={handleChange}
                  className="w-full border-0 border-b border-gray-300 rounded-none focus:ring-0 focus:border-gray-900"
                >
                  <option value="">Selecteer een aanhef...</option>
                  {data.salutations?.map((s: any) => (
                    <option key={s.id} value={s.code}>
                      {s.label}
                    </option>
                  ))}
                </select>
              )}
            </FormField>
            <FormField label="Achternaam" name="lastname" value={formData.lastname} onChange={handleChange} />
            <FormField label="Voornaam" required name="firstname" value={formData.firstname} onChange={handleChange} />
            <FormField label="Geboortedatum" type="date" name="dob" value={formData.dob} onChange={handleDateChange} />
            <FormField label="Leeftijd" name="age" value={formData.age} onChange={handleChange} />
            <FormField label="Postcode" required name="postalCode" value={formData.postalCode} onChange={handleChange} />
            <FormField label="Huisnummer" name="housenumber" value={formData.housenumber} onChange={handleChange} />
            <FormField label="Toevoeging" name="housenumberAddition" value={formData.housenumberAddition} onChange={handleChange} />
            <FormField label="Straat" required name="street" value={formData.street} onChange={handleChange} />
            <FormField label="City" required name="city" value={formData.city} onChange={handleChange} />
            <FormField label="Gemeente" name="county" value={formData.county} onChange={handleChange} />
            <FormField label="Telefoonnummer" required name="phonenumber" value={formData.phonenumber} onChange={handleChange} />
            <FormField label="E-mail" name="email" value={formData.email} onChange={handleChange} />
            <FormField label="Relatie tot overledene" required name="relation" value={formData.relation} onChange={handleChange} />
            <FormField label="Overige informatie" required name="notes" multiline rows={6} value={formData.notes} onChange={handleChange} />
          </FormCard>
        </div>
      </div>
    </DashboardLayout>
  );
}