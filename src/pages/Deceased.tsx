import { useLocation, useParams } from "react-router-dom";
import { DashboardLayout, FormCard, FormField, FuneralForm } from "../components";
import { useDropdownData, useFormHandler, useSaveAndNext } from "../hooks";
import { calculateAge } from "../utils/calculateAge";
import { endpoints } from "../api/apiConfig";

export default function Deceased() {
  const location = useLocation();
  const { overledeneId } = useParams<{ overledeneId: string }>();

  const {
    formData,
    handleChange,
    handleDateChange,
    goNext,
    goBack,
    loading,
    error,
  } = useFormHandler({
    initialData: {
      // Deceased personal information
      socialsecurity: "",
      salutation: "",
      lastName: "",
      firstName: "",
      dob: "",
      placeofbirth: "",
      age: "",
      postalCode: "",
      housenumber: "",
      housenumberAddition: "",
      street: "",
      city: "",
      county: "",
      voorregeling: false,
      homedeceased: false,

      // Deceased location information
      dateofDeath: "",
      timeofDeath: "",
      locationofDeath: "",
      postalcodeofDeath: "",
      housenumberofDeath: "",
      housenumberadditionofDeath: "",
      streetofDeath: "",
      cityofDeath: "",
      countyofDeath: "",
      bodyFinding: "",
      origin: "",

      // Deceased medical information
      gp: "",
      gpPhone: "",
      me: "",

      // Funeral info
      funeralLeader: "",
      funeralNumber: "",
    },
    steps: ["/dashboard", "/deceased", "/additional-information", "/success-deceased"],
    dateFieldName: "dob",
    deathDateFieldName: "dateofDeath",
    calculateAge,
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
    salutations: endpoints.salutation,
    bodyFindings: endpoints.bodyfindings,
    origins: endpoints.origins,
  });

  if (loading) return <div>Loading deceased data...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <DashboardLayout>
      <div className="p-8 max-w-8xl mx-auto space-y-6">
        {/* Funeral info form */}
        <FuneralForm
          formData={formData}
          onChange={handleChange}
          onNext={() => goNext(location.pathname)} //handleNext = prod
          onBack={() => goBack(location.pathname)}
          readOnly={false}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Left column */}
          <FormCard title="Persoonsgegevens Overledene">
            <FormField
              label="BSN"
              required
              name="socialsecurity"
              value={formData.socialsecurity}
              onChange={handleChange}
            />
            <FormField label="Aanhef" required>
              {dropdownLoading.salutations  ? (
                <div>Loading...</div>
              ) : dropdownErrors.salutations  ? (
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
            <FormField
              label="Voornamen"
              required
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
            />
            <FormField
              label="Achternaam"
              required
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
            />
            <FormField
              label="Geboortedatum"
              type="date"
              name="dob"
              value={formData.dob}
              onChange={handleDateChange}
            />
            <FormField
              label="Geboorteplaats"
              name="placeofbirth"
              value={formData.placeofbirth}
              onChange={handleChange}
            />
            <FormField
              label="Leeftijd"
              name="age"
              value={formData.age}
              onChange={handleChange}
            />
            <FormField
              label="Postcode"
              required
              name="postalCode"
              value={formData.postalCode}
              onChange={handleChange}
            />
            <FormField
              label="Huisnummer"
              required
              name="housenumber"
              value={formData.housenumber}
              onChange={handleChange}
            />
            <FormField
              label="Toevoeging"
              name="housenumberAddition"
              value={formData.housenumberAddition}
              onChange={handleChange}
            />
            <FormField
              label="Straat"
              required
              name="street"
              value={formData.street}
              onChange={handleChange}
            />
            <FormField
              label="Plaats"
              required
              name="city"
              value={formData.city}
              onChange={handleChange}
            />
            <FormField
              label="Gemeente"
              required
              name="county"
              value={formData.county}
              onChange={handleChange}
            />
            <FormField label="Voorregeling">
              <input
                type="checkbox"
                name="voorregeling"
                checked={formData.voorregeling}
                onChange={handleChange}
              />
            </FormField>
            <FormField label="Home Deceased">
              <input
                type="checkbox"
                name="homedeceased"
                checked={formData.homedeceased}
                onChange={handleChange}
              />
            </FormField>
          </FormCard>

          {/* Right column */}
          <FormCard title="Gegevens overlijden">
            <FormField
              label="Datum"
              type="date"
              required
              name="dateofDeath"
              value={formData.dateofDeath}
              onChange={handleChange}
            />
            <FormField
              label="Tijdstip"
              type="time"
              required
              name="timeofDeath"
              value={formData.timeofDeath}
              onChange={handleChange}
            />
            <FormField
              label="Locatie"
              name="locationofDeath"
              value={formData.locationofDeath}
              onChange={handleChange}
            />
            <FormField
              label="Postcode"
              name="postalcodeofDeath"
              value={formData.postalcodeofDeath}
              onChange={handleChange}
            />
            <FormField
              label="Huisnummer"
              name="housenumberofDeath"
              value={formData.housenumberofDeath}
              onChange={handleChange}
            />
            <FormField
              label="Toevoeging"
              name="housenumberadditionofDeath"
              value={formData.housenumberadditionofDeath}
              onChange={handleChange}
            />
            <FormField
              label="Straat"
              name="streetofDeath"
              value={formData.streetofDeath}
              onChange={handleChange}
            />
            <FormField
              label="Plaats"
              name="cityofDeath"
              value={formData.cityofDeath}
              onChange={handleChange}
            />
            <FormField
              label="Gemeente"
              name="countyofDeath"
              value={formData.countyofDeath}
              onChange={handleChange}
            />
            <FormField label="Lijkvinding">
              {dropdownLoading.bodyFindings ? (
                <div>Loading...</div>
              ) : dropdownErrors.bodyFindings ? (
                <div className="text-red-600">{ dropdownErrors.bodyFindings }</div>
              ) : (
                <select
                  name="bodyFinding"
                  value={formData.bodyFinding}
                  onChange={handleChange}
                  className="w-full border-0 border-b border-gray-300 rounded-none focus:ring-0 focus:border-gray-900"
                >
                  <option value="">Selecteer een lijkvinding...</option>
                  {data.bodyFindings?.map((s: any) => (
                    <option key={s.id} value={s.code}>
                      {s.label}
                    </option>
                  ))}
                </select>
              )}
            </FormField>

            <FormField label="Herkomst">
              {dropdownLoading.origins ? (
                <div>Loading...</div>
              ) : dropdownErrors.origins ? (
                <div className="text-red-600">{ dropdownErrors.origins }</div>
              ) : (
                <select
                  name="origin"
                  value={formData.origin}
                  onChange={handleChange}
                  className="w-full border-0 border-b border-gray-300 rounded-none focus:ring-0 focus:border-gray-900"
                >
                  <option value="">Selecteer een herkomst...</option>
                  {data.origins?.map((s: any) => (
                    <option key={s.id} value={s.code}>
                      {s.label}
                    </option>
                  ))}
                </select>
              )}
            </FormField>
          </FormCard>
        </div>
      </div>
    </DashboardLayout>
  );
}