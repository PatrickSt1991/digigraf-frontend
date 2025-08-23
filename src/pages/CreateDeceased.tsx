import React, { useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import FormCard from "../components/FormCard";
import FormField from "../components/FormField";
import { useDropdownData } from '../hooks';
import { calculateAge } from "../utils/calculateAge";
import FuneralForm from "../components/FuneralForm";

export default function CreateDeceased() {
  const user = { name: "Test User", role: "Admin" };

  const [formData, setFormData] = useState({
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
  });

  const { data: dropdownData } = useDropdownData({
    funeralLeaders: "/api/funeralTypes",
    bodyFindings: "/api/bodyFindings",
    origins: "/api/origins"
  });

  const [setResult] = useState<any>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

const handleDateOfBirthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const { name, value } = e.target;
  const calculatedAge = calculateAge(value, formData.dateofDeath || undefined);
  
  setFormData(prev => ({
    ...prev,
    [name]: value,
    age: calculatedAge.toString()
  }));
};

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submit data:", formData);
    setResult(formData);
  };

  return (
    <DashboardLayout user={user}>
      <div className="p-8 max-w-8xl mx-auto space-y-6">
        {/* Top small form */}
        <FuneralForm
          formData={formData}
          onChange={handleChange}
          dropdownData={dropdownData.funeralLeaders}
          onNext={handleSubmit}
          readOnly={false}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Left column */}
          <FormCard title="Persoonsgegevens Overledene">
            <FormField label="BSN" required name="socialsecurity" value={formData.socialsecurity} onChange={handleChange} />
            <FormField label="Aanhef" required name="salutation" value={formData.salutation} onChange={handleChange} />
            <FormField label="Voornamen" required name="firstName" value={formData.firstName} onChange={handleChange} />
            <FormField label="Achternaam" required name="lastName" value={formData.lastName} onChange={handleChange} />
            <FormField label="Geboortedatum" type="date" name="dob" value={formData.dob} onChange={handleDateOfBirthChange} />
            <FormField label="Geboorteplaats" name="placeofbirth" value={formData.placeofbirth} onChange={handleChange} />
            <FormField label="Leeftijd" name="age" value={formData.age} onChange={handleChange} />
            <FormField label="Postcode" required name="postalCode" value={formData.postalCode} onChange={handleChange} />
            <FormField label="Huisnummer" required name="housenumber" value={formData.housenumber} onChange={handleChange} />
            <FormField label="Toevoeging" name="housenumberAddition" value={formData.housenumberAddition} onChange={handleChange} />
            <FormField label="Straat" required name="street" value={formData.street} onChange={handleChange} />
            <FormField label="Plaats" required name="city" value={formData.city} onChange={handleChange} />
            <FormField label="Gemeente" required name="county" value={formData.county} onChange={handleChange} />
            <FormField label="Voorregeling">
              <input type="checkbox" name="voorregeling" checked={formData.voorregeling} onChange={handleChange} />
            </FormField>
            <FormField label="Home Deceased">
              <input type="checkbox" name="homedeceased" checked={formData.homedeceased} onChange={handleChange} />
            </FormField>
          </FormCard>

          {/* Right column */}
          <FormCard title="Gegevens overlijden">
            <FormField label="Datum" type="date" required name="dateofDeath" value={formData.dateofDeath} onChange={handleChange} />
            <FormField label="Tijdstip" type="time" required name="timeofDeath" value={formData.timeofDeath} onChange={handleChange} />
            <FormField label="Locatie" name="locationofDeath" value={formData.locationofDeath} onChange={handleChange} />
            <FormField label="Postcode" name="postalcodeofDeath" value={formData.postalcodeofDeath} onChange={handleChange} />
            <FormField label="Huisnummer" name="housenumberofDeath" value={formData.housenumberofDeath} onChange={handleChange} />
            <FormField label="Toevoeging" name="housenumberadditionofDeath" value={formData.housenumberadditionofDeath} onChange={handleChange} />
            <FormField label="Straat" name="streetofDeath" value={formData.streetofDeath} onChange={handleChange} />
            <FormField label="Plaats" name="cityofDeath" value={formData.cityofDeath} onChange={handleChange} />
            <FormField label="Gemeente" name="countyofDeath" value={formData.countyofDeath} onChange={handleChange} />
            <FormField label="Lijkvinding">
              <select
                name="bodyFinding"
                value={formData.bodyFinding}
                onChange={handleChange}
                className="w-full border-0 border-b border-gray-300 rounded-none focus:ring-0 focus:border-gray-900"
              >
                <option value="">Select a body finding...</option>
                {dropdownData.bodyFindings?.map((ft) => (
                  <option key={ft.id} value={ft.value}>
                    {ft.label}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Herkomst">
              <select
                name="origin"
                value={formData.origin}
                onChange={handleChange}
                className="w-full border-0 border-b border-gray-300 rounded-none focus:ring-0 focus:border-gray-900"
              >
                <option value="">Select a origin...</option>
                {dropdownData.origins?.map((ft) => (
                  <option key={ft.id} value={ft.value}>
                    {ft.label}
                  </option>
                ))}
              </select>
            </FormField>
          </FormCard>
        </div>
      </div>
    </DashboardLayout>
  );
}
