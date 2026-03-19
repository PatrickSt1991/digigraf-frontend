import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  DashboardLayout,
  FormCard,
  FormField,
  FuneralForm,
  LoadingState,
  ErrorState,
} from "../../components";
import { useDropdownData, useFormHandler, useSaveAndNext } from "../../hooks";
import { calculateAge } from "../../utils/calculateAge";
import { endpoints } from "../../api/apiConfig";
import { DossierDto } from "../../types";

export default function Deceased() {
  const location = useLocation();
  const navigate = useNavigate();
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
      funeralLeader: "",
      funeralNumber: "",
      funeralType: "",
      voorregeling: false,
      dossierCompleted: false,
      deceased: {
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

  const { handleNext } = useSaveAndNext<DossierDto>({
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

  const currentDossierId = dossierId?.toString().trim() || "";

  return (
    <DashboardLayout>
      <div className="px-8 pb-8 max-w-8xl mx-auto space-y-6">
        <FuneralForm
          formData={formData}
          onChange={handleChange}
          onNext={handleNext}
          onBack={() => goBack(location.pathname)}
          readOnly={false}
          navigationActions={
            currentDossierId
              ? [
                  { label: "Dashboard", onClick: () => navigate("/dashboard") },
                  {
                    label: "Opdrachtgever",
                    onClick: () => navigate(`/deceased-information/${currentDossierId}`),
                  },
                  {
                    label: "Verzekeringen",
                    onClick: () => navigate(`/deceased-insurance/${currentDossierId}`),
                  },
                  {
                    label: "Opbaren",
                    onClick: () => navigate(`/deceased-layout/${currentDossierId}`),
                  },
                  {
                    label: "Condoleance",
                    onClick: () => navigate(`/deceased-funeral/${currentDossierId}`),
                  },
                  {
                    label: "Documenten",
                    onClick: () => navigate(`/deceased-documents/${currentDossierId}`),
                  },
                  {
                    label: "Kostenbegroting",
                    onClick: () => navigate(`/deceased-invoice/${currentDossierId}`),
                  },
                  {
                    label: "Diensten",
                    onClick: () => navigate(`/deceased-services/${currentDossierId}`),
                  },
                ]
              : []
          }
        />

        {loading ? (
          <LoadingState
            title="Overledene laden"
            message="Gegevens van de overledene worden geladen..."
          />
        ) : error ? (
          <ErrorState
            title="Fout bij laden"
            message={error}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormCard title="Persoonsgegevens Overledene">
              <FormField
                label="BSN"
                required
                name="deceased.socialSecurity"
                value={formData.deceased?.socialSecurity ?? ""}
                onChange={handleChange}
              />

              <FormField label="Aanhef" required>
                {dropdownLoading.salutations ? (
                  <LoadingState
                    title="Aanhef laden"
                    message="Aanheffen worden geladen..."
                  />
                ) : dropdownErrors.salutations ? (
                  <ErrorState
                    title="Fout bij aanheffen"
                    message={dropdownErrors.salutations}
                  />
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
                required
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
                  <LoadingState
                    title="Lijkvinding laden"
                    message="Lijkvindingen worden geladen..."
                  />
                ) : dropdownErrors.bodyFindings ? (
                  <ErrorState
                    title="Fout bij lijkvindingen"
                    message={dropdownErrors.bodyFindings}
                  />
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
                  <LoadingState
                    title="Herkomst laden"
                    message="Herkomsten worden geladen..."
                  />
                ) : dropdownErrors.origins ? (
                  <ErrorState
                    title="Fout bij herkomsten"
                    message={dropdownErrors.origins}
                  />
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
        )}
      </div>
    </DashboardLayout>
  );
}