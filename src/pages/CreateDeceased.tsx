import React, { useState } from "react";
import DashboardLayout from "../components/DashboardLayout";

export default function CreateDeceased() {
  const user = { name: "Test User", role: "Admin" }; // from JWT later

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("Male");
  const [dod, setDod] = useState("");
  const [funeralType, setFuneralType] = useState("Funeral");
  const [voorregeling, setVoorregeling] = useState(false);
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [funeralLeader, setFuneralLeader] = useState("");
  const [notes, setNotes] = useState("");
  const [result, setResult] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      firstName,
      lastName,
      dob,
      gender,
      dod,
      funeralType,
      voorregeling,
      address,
      phone,
      email,
      funeralLeader,
      notes,
    };
    console.log("Submit data:", data);
    setResult(data); // for testing
  };

  return (
    <DashboardLayout user={user}>
      <div className="p-8 max-w-8xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Left column: All your original inputs */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-6">Persoonsgegevens Overledene</h1>
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Personal Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 font-medium text-gray-700">
                  BSN <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="border p-2 rounded w-full"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 font-medium text-gray-700">
                  Aanhef <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="border p-2 rounded w-full"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 font-medium">First Name <span className="text-red-500 ml-1">*</span></label>
                <input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="border p-2 rounded w-full"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Last Name <span className="text-red-500 ml-1">*</span></label>
                <input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="border p-2 rounded w-full"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block mb-1 font-medium">Date of Birth <span className="text-red-500 ml-1">*</span></label>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="border p-2 rounded w-full"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="border p-2 rounded w-full"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
              <div>
                <label className="block mb-1 font-medium">Date of Death</label>
                <input
                  type="date"
                  value={dod}
                  onChange={(e) => setDod(e.target.value)}
                  className="border p-2 rounded w-full"
                />
              </div>
            </div>

            {/* Funeral Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 font-medium">Funeral Type</label>
                <select
                  value={funeralType}
                  onChange={(e) => setFuneralType(e.target.value)}
                  className="border p-2 rounded w-full"
                >
                  <option value="Funeral">Funeral</option>
                  <option value="Cremation">Cremation</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={voorregeling}
                  onChange={(e) => setVoorregeling(e.target.checked)}
                />
                <label className="font-medium">Voorregeling</label>
              </div>
            </div>

            {/* Contact Info */}
            <div>
              <label className="block mb-1 font-medium">Address</label>
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="border p-2 rounded w-full"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 font-medium">Phone</label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="border p-2 rounded w-full"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Email</label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  className="border p-2 rounded w-full"
                />
              </div>
            </div>

            <div>
              <label className="block mb-1 font-medium">Funeral Leader</label>
              <input
                value={funeralLeader}
                onChange={(e) => setFuneralLeader(e.target.value)}
                className="border p-2 rounded w-full"
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="border p-2 rounded w-full"
                rows={3}
              />
            </div>
          </form>

          {result && (
            <div className="mt-6 bg-gray-100 p-4 rounded">
              <h2 className="text-lg font-semibold mb-2">Submitted Data</h2>
              <pre className="text-sm">{JSON.stringify(result, null, 2)}</pre>
            </div>
          )}
        </div>

        {/* Right column: Dummy info */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Overlijdensinformatie (Dummy)</h2>
          <div className="space-y-4">
            <div>
              <label className="block mb-1 font-medium">Date of Death</label>
              <input
                type="date"
                value="2025-08-22"
                className="border p-2 rounded w-full bg-gray-100"
                readOnly
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Place of Death</label>
              <input
                value="Amsterdam Hospital"
                className="border p-2 rounded w-full bg-gray-100"
                readOnly
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Funeral Leader</label>
              <input
                value="John Doe"
                className="border p-2 rounded w-full bg-gray-100"
                readOnly
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Notes</label>
              <textarea
                value="Some placeholder notes about the deceased"
                className="border p-2 rounded w-full bg-gray-100"
                rows={3}
                readOnly
              />
            </div>
          </div>
            <div className="pt-4">
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
              >
                Create Deceased
              </button>
            </div>
        </div>
      </div>
    </DashboardLayout>
  );
}