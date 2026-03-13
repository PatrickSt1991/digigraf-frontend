import { useLocation, useParams } from "react-router-dom";
import { DashboardLayout, FormCard, FormField, FuneralForm } from "../../components";
import { useDropdownData, useFormHandler, useSaveAndNext } from "../../hooks";
import { calculateAge } from "../../utils/calculateAge";
import { endpoints } from "../../api/apiConfig";
import { DossierDto } from "../../types";

export default function Deceased() {
  const location = useLocation();
  const { dossierId } = useParams<{ dossierId: string }>();

  const {
    formData,
    handleChange,
    handleDateChange,
    goBack,
    loading,
    error,
  } = useFormHandler<DossierDto>({
    initialData: {
      id: "",
      funeralLeader: "",
      funeralNumber: "",
      funeralType: "",
      voorregeling: false,
      dossierCompleted: false,
      deceased: {
        id: "",
        socialSecurity: "",
        firstName: "",
        lastName: "",
        salutation: "",
        dob: "",
        placeOfBirth: "",
        postalCode: "",
        street: "",
        houseNumber: "",
        houseNumberAddition: "",
        city: "",
        county: "",
        homeDeceased: false,
      },
      deathInfo: {
        id: "",
        dossierId: "",
        dateOfDeath: "",
        timeOfDeath: "",
        locationOfDeath: "",
        postalCodeOfDeath: "",
        streetOfDeath: "",
        houseNumberOfDeath: "",
        houseNumberAdditionOfDeath: "",
        cityOfDeath: "",
        countyOfDeath: "",
        bodyFinding: "",
        origin: "",
      },
    },
    steps: ["/dashboard", "/deceased", "/deceased-information", "/success-deceased"],
    dateFieldName: "deceased.dob",
    deathDateFieldName: "deathInfo.dateOfDeath",
    calculateAge,
    fetchUrl: dossierId ? `${endpoints.deceased}/${dossierId}` : undefined,
    allow404AsEmpty: true,
  });

  const saveUrl = dossierId
    ? `${endpoints.deceased}/${dossierId}`
    : `${endpoints.deceased}/new`;

  const {handleNext} = useSaveAndNext<DossierDto>({
    formData,
    endpoint: saveUrl,
    id: dossierId,
    getNextPath: (result, currentId) => {
      const savedId = currentId ?? result?.id;
      return savedId
        ? `/deceased-information/${savedId}`
        : "/deceased-information";
    },
    getNextState: (_result, currentId) => ({
      dossierId: currentId ?? formData.id ?? "",
      funeralLeader: formData.funeralLeader ?? "",
      funeralNumber: formData.funeralNumber ?? "",
    }),
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
      <div className="px-8 pb-8 max-w-8xl mx-auto space-y-6">
        <FuneralForm
          formData={formData}
          onChange={handleChange}
          onNext={handleNext}
          onBack={() => goBack(location.pathname)}
          readOnly={false}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormCard title="Persoonsgegevens Overledene">
            <FormField
              label="BSN"
              required
              name="deceased.socialSecurity"
              value={(formData as any).deceased?.socialSecurity ?? ""}
              onChange={handleChange}
            />

            <FormField label="Aanhef" required>
              {dropdownLoading.salutations ? (
                <div>Loading...</div>
              ) : dropdownErrors.salutations ? (
                <div className="text-red-600">{dropdownErrors.salutations}</div>
              ) : (
                <select
                  name="deceased.salutation"
                  value={formData.deceased?.salutation ?? ""}
                  onChange={handleChange}
                  className="w-full border-0 border-b border-gray-300 rounded-none focus:ring-0 focus:border-gray-900"
                >
                  <option value="">Selecteer een aanhef...</option>
                  {data.salutations?.map((s: any) => (
                    <option key={s.id} value={s.label}>
                      {s.label}
                    </option>
                  ))}
                </select>
              )}
            </FormField>

            <FormField
              label="Voornamen"
              required
              name="deceased.firstName"
              value={formData.deceased?.firstName ?? ""}
              onChange={handleChange}
            />

            <FormField
              label="Achternaam"
              required
              name="deceased.lastName"
              value={formData.deceased?.lastName ?? ""}
              onChange={handleChange}
            />

            <FormField
              label="Geboortedatum"
              type="date"
              name="deceased.dob"
              value={formData.deceased?.dob?.split("T")[0] ?? ""}
              onChange={handleDateChange}
            />

            <FormField
              label="Geboorteplaats"
              name="deceased.placeOfBirth"
              value={formData.deceased?.placeOfBirth ?? ""}
              onChange={handleChange}
            />

            <FormField
              label="Leeftijd"
              name="deceased.age"
              value={formData.deceased?.dob ? String(calculateAge(formData.deceased.dob)) : ""}
              onChange={() => {}}
            />

            <FormField
              label="Postcode"
              required
              name="deceased.postalCode"
              value={formData.deceased?.postalCode ?? ""}
              onChange={handleChange}
            />

            <FormField
              label="Huisnummer"
              required
              name="deceased.houseNumber"
              value={formData.deceased?.houseNumber ?? ""}
              onChange={handleChange}
            />

            <FormField
              label="Toevoeging"
              name="deceased.houseNumberAddition"
              value={formData.deceased?.houseNumberAddition ?? ""}
              onChange={handleChange}
            />

            <FormField
              label="Straat"
              required
              name="deceased.street"
              value={formData.deceased?.street ?? ""}
              onChange={handleChange}
            />

            <FormField
              label="Plaats"
              required
              name="deceased.city"
              value={formData.deceased?.city ?? ""}
              onChange={handleChange}
            />

            <FormField
              label="Gemeente"
              required
              name="deceased.county"
              value={formData.deceased?.county ?? ""}
              onChange={handleChange}
            />

            <FormField label="Voorregeling">
              <input
                type="checkbox"
                name="voorregeling"
                checked={formData.voorregeling ?? false}
                onChange={handleChange}
              />
            </FormField>

            <FormField label="Home Deceased">
              <input
                type="checkbox"
                name="deceased.homeDeceased"
                checked={formData.deceased?.homeDeceased ?? false}
                onChange={handleChange}
              />
            </FormField>
          </FormCard>

          <FormCard title="Gegevens overlijden">
            <FormField
              label="Datum"
              type="date"
              required
              name="deathInfo.dateOfDeath"
              value={formData.deathInfo?.dateOfDeath?.split("T")[0] ?? ""}
              onChange={handleDateChange}
            />

            <FormField
              label="Tijdstip"
              type="time"
              required
              name="deathInfo.timeOfDeath"
              value={formData.deathInfo?.timeOfDeath ?? ""}
              onChange={handleChange}
            />

            <FormField
              label="Locatie"
              name="deathInfo.locationOfDeath"
              value={formData.deathInfo?.locationOfDeath ?? ""}
              onChange={handleChange}
            />

            <FormField
              label="Postcode"
              name="deathInfo.postalCodeOfDeath"
              value={formData.deathInfo?.postalCodeOfDeath ?? ""}
              onChange={handleChange}
            />

            <FormField
              label="Huisnummer"
              name="deathInfo.houseNumberOfDeath"
              value={formData.deathInfo?.houseNumberOfDeath ?? ""}
              onChange={handleChange}
            />

            <FormField
              label="Toevoeging"
              name="deathInfo.houseNumberAdditionOfDeath"
              value={formData.deathInfo?.houseNumberAdditionOfDeath ?? ""}
              onChange={handleChange}
            />

            <FormField
              label="Straat"
              name="deathInfo.streetOfDeath"
              value={formData.deathInfo?.streetOfDeath ?? ""}
              onChange={handleChange}
            />

            <FormField
              label="Plaats"
              name="deathInfo.cityOfDeath"
              value={formData.deathInfo?.cityOfDeath ?? ""}
              onChange={handleChange}
            />

            <FormField
              label="Gemeente"
              name="deathInfo.countyOfDeath"
              value={formData.deathInfo?.countyOfDeath ?? ""}
              onChange={handleChange}
            />

            <FormField label="Lijkvinding">
              {dropdownLoading.bodyFindings ? (
                <div>Loading...</div>
              ) : dropdownErrors.bodyFindings ? (
                <div className="text-red-600">{dropdownErrors.bodyFindings}</div>
              ) : (
                <select
                  name="deathInfo.bodyFinding"
                  value={formData.deathInfo?.bodyFinding ?? ""}
                  onChange={handleChange}
                  className="w-full border-0 border-b border-gray-300 rounded-none focus:ring-0 focus:border-gray-900"
                >
                  <option value="">Selecteer een lijkvinding...</option>
                  {data.bodyFindings?.map((s: any) => (
                    <option key={s.id} value={s.label}>
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
                <div className="text-red-600">{dropdownErrors.origins}</div>
              ) : (
                <select
                  name="deathInfo.origin"
                  value={formData.deathInfo?.origin ?? ""}
                  onChange={handleChange}
                  className="w-full border-0 border-b border-gray-300 rounded-none focus:ring-0 focus:border-gray-900"
                >
                  <option value="">Selecteer een herkomst...</option>
                  {data.origins?.map((s: any) => (
                    <option key={s.id} value={s.label}>
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