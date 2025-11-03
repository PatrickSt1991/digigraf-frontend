import { DashboardLayout, FormCard, FormField, FormRow, FuneralForm } from "../../components";
import { useDropdownData, useFormHandler } from "../../hooks";
import { endpoints } from "../../api/apiConfig";
import { useParams, useLocation } from "react-router-dom";

// Assume these are the new endpoints based on the XAML file
const newEndpoints = {
  ...endpoints,
  stoneSuppliers: "/api/stone-suppliers",
  flowerSuppliers: "/api/flower-suppliers",
  urnSuppliers: "/api/urn-suppliers",
  employees: "/api/employees",
};

const initialFormData = {
  funeralLeader: "",
  funeralNumber: "",
  attendantIntake: "",
  // Steenhouwerij
  stoneDescription: "",
  stoneAmount: "",
  stoneSupplier: "",
  stoneEmployee: "",
  // Bloemen
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
  // Urnen en Gedenksieraden
  urnDescription: "",
  urnAmount: "",
  urnSupplier: "",
  urnEmployee: "",
  // Werkbonnen (placeholder for a dynamic list)
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
  // Finish Popup
  customerScore: "",
  isNotificationEnabled: false,
};

export default function DeceasedServicesLayout() {
  const { deceasedId } = useParams<{ deceasedId: string }>();
  const location = useLocation();

  const { formData, handleChange, goNext, goBack, loading, error } = useFormHandler({
    initialData: initialFormData,
    steps: ["/deceased-invoice", "/deceased-services", "/the-next-step-final-step", "/success-deceased"],
    fetchUrl: deceasedId ? `${newEndpoints.deceased}/${deceasedId}` : undefined,
  });

  const { data, loading: dropdownLoading, errors: dropdownErrors } = useDropdownData({
    stoneSuppliers: newEndpoints.stoneSuppliers,
    flowerSuppliers: newEndpoints.flowerSuppliers,
    urnSuppliers: newEndpoints.urnSuppliers,
    employees: newEndpoints.employees,
  });

  if (loading) return <div>Loading data...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  const handleWorksheetChange = (index: number, name: string, value: any) => {
    const newWorksheets = [...formData.worksheets];
    newWorksheets[index] = { ...newWorksheets[index], [name]: value };
    handleChange({
      target: {
        name: "worksheets",
        value: newWorksheets,
      },
    });
  };

  return (
    <DashboardLayout>
      <div className="px-8 pb-8 max-w-8xl mx-auto space-y-6">
        <FuneralForm
          formData={formData}
          onChange={handleChange}
          onBack={() => goBack(location.pathname)}
          onComplete={() => goNext(location.pathname)}
          readOnly={true}
        />

        {/* Steenhouwerij Card */}
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
              {dropdownLoading.stoneSuppliers ? (
                <div>Loading...</div>
              ) : dropdownErrors.stoneSuppliers ? (
                <div className="text-red-600">{dropdownErrors.stoneSuppliers}</div>
              ) : (
                <select
                  name="stoneSupplier"
                  value={formData.stoneSupplier}
                  onChange={handleChange}
                  className="w-full border-0 border-b border-gray-300 rounded-none focus:ring-0 focus:border-gray-900"
                >
                  <option value="">Selecteer Leverancier...</option>
                  {data.stoneSuppliers?.map((s: any) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
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
                    <option key={e.id} value={e.id}>{e.displayName}</option>
                  ))}
                </select>
              )}
            </FormField>
          </FormRow>
          <div className="border-t border-gray-300 my-4 pt-4">
            <h3 className="text-lg font-semibold mb-2">Overzicht weergave</h3>
            {/* DataGrid equivalent */}
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Uitvaartnummer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bedrag</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Leverancier</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Werknemer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Datum uitbetaling</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {/* Placeholder for data rows */}
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">...</td>
                  <td className="px-6 py-4 whitespace-nowrap">...</td>
                  <td className="px-6 py-4 whitespace-nowrap">...</td>
                  <td className="px-6 py-4 whitespace-nowrap">...</td>
                  <td className="px-6 py-4 whitespace-nowrap">...</td>
                </tr>
              </tbody>
            </table>
          </div>
        </FormCard>

        {/* Bloemen Card */}
        <FormCard title="Bloemen">
          <FormField
            label="Omschrijving"
            required
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
            <FormField label="Leverancier" required>
              {dropdownLoading.flowerSuppliers ? (
                <div>Loading...</div>
              ) : dropdownErrors.flowerSuppliers ? (
                <div className="text-red-600">{dropdownErrors.flowerSuppliers}</div>
              ) : (
                <select
                  name="flowerSupplier"
                  value={formData.flowerSupplier}
                  onChange={handleChange}
                  className="w-full border-0 border-b border-gray-300 rounded-none focus:ring-0 focus:border-gray-900"
                >
                  <option value="">Selecteer Leverancier...</option>
                  {data.flowerSuppliers?.map((s: any) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              )}
            </FormField>
          </FormRow>
          <FormRow cols={2}>
            <FormField
              label="Bezorg adres"
              name="deliveryAddress"
              value={formData.deliveryAddress}
              onChange={handleChange}
            />
            <FormField
              label="Bezorg datum"
              name="deliveryDate"
              type="date"
              value={formData.deliveryDate}
              onChange={handleChange}
            />
          </FormRow>
          <FormRow cols={2}>
            <FormField label="Kaart" type="checkbox" name="flowersWithCard" checked={formData.flowersWithCard} onChange={handleChange} />
            <FormField label="Lint" type="checkbox" name="flowersWithRibbon" checked={formData.flowersWithRibbon} onChange={handleChange} />
          </FormRow>
          {formData.flowersWithRibbon && (
            <>
              <h3 className="text-lg font-semibold border-b border-gray-300 pb-2 mb-4">Lint teksten</h3>
              <FormRow cols={2}>
                <FormField label="Eerste lint" name="ribbon1" value={formData.ribbon1} onChange={handleChange} />
                <FormField label="Tweede lint" name="ribbon2" value={formData.ribbon2} onChange={handleChange} />
              </FormRow>
              <FormRow cols={2}>
                <FormField label="Derde lint" name="ribbon3" value={formData.ribbon3} onChange={handleChange} />
                <FormField label="Vierde lint" name="ribbon4" value={formData.ribbon4} onChange={handleChange} />
              </FormRow>
            </>
          )}
        </FormCard>

        <FormCard title="Urnen en Gedenksieraden">
          <FormField
            label="Omschrijving"
            required
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
            <FormField label="Leverancier" required>
              {dropdownLoading.urnSuppliers ? (
                <div>Loading...</div>
              ) : dropdownErrors.urnSuppliers ? (
                <div className="text-red-600">{dropdownErrors.urnSuppliers}</div>
              ) : (
                <select
                  name="urnSupplier"
                  value={formData.urnSupplier}
                  onChange={handleChange}
                  className="w-full border-0 border-b border-gray-300 rounded-none focus:ring-0 focus:border-gray-900"
                >
                  <option value="">Selecteer Leverancier...</option>
                  {data.urnSuppliers?.map((s: any) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
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
                  name="urnEmployee"
                  value={formData.urnEmployee}
                  onChange={handleChange}
                  className="w-full border-0 border-b border-gray-300 rounded-none focus:ring-0 focus:border-gray-900"
                >
                  <option value="">Selecteer Werknemer...</option>
                  {data.employees?.map((e: any) => (
                    <option key={e.id} value={e.id}>{e.displayName}</option>
                  ))}
                </select>
              )}
            </FormField>
          </FormRow>
        </FormCard>

        {/* Werkbonnen Card */}
        <FormCard title="Werkbonnen">
          {formData.worksheets.map((worksheet: any, index: number) => (
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
                      onChange={(e) => handleWorksheetChange(index, e.target.name, e.target.value)}
                      className="w-full border-0 border-b border-gray-300 rounded-none focus:ring-0 focus:border-gray-900"
                    >
                      <option value="">Selecteer Personeel...</option>
                      {data.employees?.map((e: any) => (
                        <option key={e.id} value={e.id}>{e.displayName}</option>
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
                  onChange={(e) => handleWorksheetChange(index, e.target.name, e.target.value)}
                />
              </FormRow>
              <FormRow cols={3}>
                <FormField
                  label="Rouwauto"
                  type="checkbox"
                  name="hearse"
                  checked={worksheet.hearse}
                  onChange={(e) => handleWorksheetChange(index, e.target.name, e.target.checked)}
                />
                <FormField
                  label="Volgauto"
                  type="checkbox"
                  name="escortVehicle"
                  checked={worksheet.escortVehicle}
                  onChange={(e) => handleWorksheetChange(index, e.target.name, e.target.checked)}
                />
                <FormField
                  label="Laatste verzorging"
                  type="checkbox"
                  name="lastCare"
                  checked={worksheet.lastCare}
                  onChange={(e) => handleWorksheetChange(index, e.target.name, e.target.checked)}
                />
              </FormRow>
              <FormRow cols={3}>
                <FormField
                  label="Overbrengen"
                  type="checkbox"
                  name="transfer"
                  checked={worksheet.transfer}
                  onChange={(e) => handleWorksheetChange(index, e.target.name, e.target.checked)}
                />
                <FormField
                  label="Condoleance"
                  type="checkbox"
                  name="condolence"
                  checked={worksheet.condolence}
                  onChange={(e) => handleWorksheetChange(index, e.target.name, e.target.checked)}
                />
              </FormRow>
            </div>
          ))}
        </FormCard>
      </div>
    </DashboardLayout>
  );
}