import React, { useState, useEffect } from "react";
import { DashboardLayout } from "../../components";
import { Link } from "react-router-dom";
import {
  FaShieldAlt, FaCheckCircle, FaTimesCircle, FaUpload, FaKey,
  FaExclamationTriangle, FaCalendarAlt, FaArrowLeft, FaUsers,
  FaAward, FaBuilding, FaFileContract, FaSave, FaGlobe,
  FaPhone, FaEnvelope, FaMapMarkerAlt,
} from "react-icons/fa";
import { getLicenseInfo, uploadLicenseFile, activateLicenseKey } from "../../api/licenseApi";
import { getCompanySettings, saveCompanySettings } from "../../api/adminApi";
import { LicenseInfo } from "../../types/license";
import { CompanySettings } from '../../types';

type Tab = "license" | "company" | "terms";

const LicenseManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>("license");

  // ── License state ──────────────────────────────────────────────────────────
  const [licenseInfo, setLicenseInfo] = useState<LicenseInfo | null>(null);
  const [licenseLoading, setLicenseLoading] = useState(true);
  const [uploadMode, setUploadMode] = useState<"file" | "key">("file");
  const [licenseKey, setLicenseKey] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // ── Company settings state ─────────────────────────────────────────────────
  const [company, setCompany] = useState<CompanySettings>({
    name: "",
    address: "",
    postalCode: "",
    city: "",
    country: "Nederland",
    phone: "",
    email: "",
    website: "",
    kvkNumber: "",
    btwNumber: "",
    termsAndConditions: "",
  });
  const [companyLoading, setCompanyLoading] = useState(true);
  const [savingCompany, setSavingCompany] = useState(false);

  // ── Shared message ─────────────────────────────────────────────────────────
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  // ── Fetch on mount ─────────────────────────────────────────────────────────
  useEffect(() => {
    fetchLicense();
    fetchCompany();
  }, []);

  const fetchLicense = async () => {
    try {
      setLicenseLoading(true);
      setLicenseInfo(await getLicenseInfo());
    } catch {
      showMessage("error", "Licentiegegevens ophalen mislukt");
    } finally {
      setLicenseLoading(false);
    }
  };

  const fetchCompany = async () => {
    try {
      setCompanyLoading(true);
      const data = await getCompanySettings();
      if (data) setCompany(data);
    } catch {
      // Silently ignore – first-time setup, no data yet
    } finally {
      setCompanyLoading(false);
    }
  };

  // ── License handlers ───────────────────────────────────────────────────────
  const handleFileUpload = async () => {
    if (!selectedFile) return showMessage("error", "Selecteer een licentiebestand");
    try {
      setUploading(true);
      const res = await uploadLicenseFile(selectedFile);
      if (res.message) { showMessage("success", res.message); setSelectedFile(null); await fetchLicense(); }
    } catch { showMessage("error", "Upload mislukt"); }
    finally { setUploading(false); }
  };

  const handleKeyActivation = async () => {
    if (!licenseKey.trim()) return showMessage("error", "Voer een licentiesleutel in");
    try {
      setUploading(true);
      const res = await activateLicenseKey(licenseKey.trim());
      showMessage("success", res.message);
      setLicenseKey(""); await fetchLicense();
    } catch (err: any) { showMessage("error", err?.message || "Activering mislukt"); }
    finally { setUploading(false); }
  };

  // ── Company handler ────────────────────────────────────────────────────────
  const handleSaveCompany = async () => {
    try {
      setSavingCompany(true);
      await saveCompanySettings(company);
      showMessage("success", "Instellingen opgeslagen");
    } catch { showMessage("error", "Opslaan mislukt"); }
    finally { setSavingCompany(false); }
  };

  const updateCompany = (field: keyof CompanySettings, value: string) =>
    setCompany((prev) => ({ ...prev, [field]: value }));

  // ── Derived license values ─────────────────────────────────────────────────
  const usagePercentage = licenseInfo ? (licenseInfo.currentUsers / licenseInfo.maxUsers) * 100 : 0;
  const isNearLimit = usagePercentage >= 80 && licenseInfo?.isValid;
  const isOverLimit = licenseInfo && !licenseInfo.isValid;

  // ── Tab config ─────────────────────────────────────────────────────────────
  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "license",  label: "Licentie",           icon: <FaShieldAlt /> },
    { id: "company",  label: "Bedrijfsgegevens",    icon: <FaBuilding /> },
    { id: "terms",    label: "Algemene Voorwaarden", icon: <FaFileContract /> },
  ];

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto space-y-6">

          {/* ── Header ── */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-10 flex items-center gap-4">
            <Link to="/admin" className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
              <FaArrowLeft />
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <FaShieldAlt className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Beheerinstellingen</h1>
                <p className="text-gray-600">Licentie, bedrijfsgegevens en algemene voorwaarden</p>
              </div>
            </div>
          </div>

          {/* ── Tabs ── */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="flex border-b border-gray-200">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setMessage(null); }}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? "border-b-2 border-blue-600 text-blue-600 bg-blue-50/40"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="p-6">

              {/* ══ LICENSE TAB ══════════════════════════════════════════════ */}
              {activeTab === "license" && (
                licenseLoading ? (
                  <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
                  </div>
                ) : (
                  <div className="grid lg:grid-cols-2 gap-6">
                    {/* Current status */}
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                      <div className={`p-6 ${isOverLimit ? "bg-red-600" : isNearLimit ? "bg-yellow-500" : "bg-gradient-to-r from-blue-600 to-blue-700"}`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-white/80 text-sm font-medium mb-1">Huidig plan</p>
                            <h2 className="text-2xl font-bold text-white capitalize">{licenseInfo?.plan || "Gratis"}</h2>
                          </div>
                          {licenseInfo?.isValid ? <FaCheckCircle className="w-8 h-8 text-white" /> : <FaTimesCircle className="w-8 h-8 text-white" />}
                        </div>
                      </div>
                      <div className="p-6">
                        {/* Usage bar */}
                        <div className="mb-6">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <FaUsers className="w-5 h-5 text-gray-400" />
                              <span className="text-gray-700 font-medium">Gebruikers</span>
                            </div>
                            <span className="text-gray-700 font-semibold">
                              {licenseInfo?.currentUsers || 0} / {licenseInfo?.maxUsers || 10}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                            <div
                              className={`h-full transition-all duration-300 ${isOverLimit ? "bg-red-500" : isNearLimit ? "bg-yellow-500" : "bg-gradient-to-r from-blue-500 to-blue-600"}`}
                              style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                            />
                          </div>
                          {isOverLimit && licenseInfo?.message && (
                            <p className="text-red-500 text-sm mt-2 flex items-center gap-1"><FaExclamationTriangle className="w-4 h-4" />{licenseInfo.message}</p>
                          )}
                          {isNearLimit && !isOverLimit && (
                            <p className="text-yellow-600 text-sm mt-2 flex items-center gap-1"><FaExclamationTriangle className="w-4 h-4" />U nadert uw gebruikerslimiet.</p>
                          )}
                        </div>

                        {/* Status grid */}
                        <div className="grid grid-cols-2 gap-4 mb-6">
                          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <div className="flex items-center gap-2 mb-1">
                              <FaShieldAlt className="w-4 h-4 text-gray-400" />
                              <p className="text-gray-500 text-sm">Status</p>
                            </div>
                            <p className={`font-semibold ${licenseInfo?.isValid ? "text-green-600" : "text-red-600"}`}>{licenseInfo?.isValid ? "Actief" : "Inactief"}</p>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <div className="flex items-center gap-2 mb-1">
                              <FaAward className="w-4 h-4 text-gray-400" />
                              <p className="text-gray-500 text-sm">Mag toevoegen</p>
                            </div>
                            <p className={`font-semibold ${licenseInfo?.canAddUsers ? "text-green-600" : "text-red-600"}`}>{licenseInfo?.canAddUsers ? "Ja" : "Nee"}</p>
                          </div>
                        </div>

                        {licenseInfo?.expiresAt && (
                          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 mb-6">
                            <div className="flex items-center gap-2 mb-1">
                              <FaCalendarAlt className="w-4 h-4 text-gray-400" />
                              <p className="text-gray-500 text-sm">Verloopt op</p>
                            </div>
                            <p className="text-gray-700 font-medium">{new Date(licenseInfo.expiresAt).toLocaleDateString("nl-NL", { year: "numeric", month: "long", day: "numeric" })}</p>
                          </div>
                        )}

                        {licenseInfo?.features && licenseInfo.features.length > 0 && (
                          <div className="pt-6 border-t border-gray-200">
                            <p className="text-gray-500 text-sm mb-3">Actieve functies</p>
                            <div className="flex flex-wrap gap-2">
                              {licenseInfo.features.map((feature, idx) => (
                                <span key={idx} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">{feature}</span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Upload / activate */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                      <h2 className="text-xl font-bold text-gray-900 mb-6">Licentie activeren</h2>
                      <div className="flex gap-2 mb-6 bg-gray-100 p-2 rounded-lg">
                        <button className={`flex-1 p-2 rounded-lg ${uploadMode === "file" ? "bg-blue-600 text-white" : "text-gray-700"}`} onClick={() => setUploadMode("file")}>
                          <FaUpload className="inline mr-2" /> Bestand
                        </button>
                        <button className={`flex-1 p-2 rounded-lg ${uploadMode === "key" ? "bg-blue-600 text-white" : "text-gray-700"}`} onClick={() => setUploadMode("key")}>
                          <FaKey className="inline mr-2" /> Sleutel
                        </button>
                      </div>
                      {uploadMode === "file" ? (
                        <div className="flex flex-col gap-4">
                          <label htmlFor="licenseFile" className="cursor-pointer bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg p-4 text-center flex flex-col items-center justify-center gap-2">
                            <FaUpload className="w-6 h-6 text-gray-600" />
                            <span className="text-gray-700">Klik om een licentiebestand te selecteren</span>
                            {selectedFile && <span className="text-gray-500 text-sm">{selectedFile.name}</span>}
                          </label>
                          <input id="licenseFile" type="file" className="hidden" onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)} />
                          <button onClick={handleFileUpload} disabled={uploading || !selectedFile} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50">
                            {uploading ? "Uploaden..." : "Licentie uploaden"}
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-4">
                          <textarea value={licenseKey} onChange={(e) => setLicenseKey(e.target.value)} placeholder="Plak uw licentiesleutel hier" className="w-full border border-gray-300 rounded-lg p-2 resize-none" rows={4} />
                          <button onClick={handleKeyActivation} disabled={uploading || !licenseKey.trim()} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50">
                            {uploading ? "Activeren..." : "Licentie activeren"}
                          </button>
                        </div>
                      )}
                      {message && <p className={`mt-4 ${message.type === "success" ? "text-green-600" : "text-red-600"}`}>{message.text}</p>}
                    </div>
                  </div>
                )
              )}

              {/* ══ COMPANY TAB ══════════════════════════════════════════════ */}
              {activeTab === "company" && (
                companyLoading ? (
                  <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
                  </div>
                ) : (
                  <div className="max-w-3xl space-y-6">
                    <p className="text-gray-500 text-sm">Deze gegevens worden gebruikt op documenten, facturen en in communicatie met klanten.</p>

                    {/* Bedrijfsnaam */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Bedrijfsnaam <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <FaBuilding className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="text"
                          value={company.name}
                          onChange={(e) => updateCompany("name", e.target.value)}
                          placeholder="Uw bedrijfsnaam"
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        />
                      </div>
                    </div>

                    {/* Address row */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Adres</label>
                      <div className="relative">
                        <FaMapMarkerAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="text"
                          value={company.address}
                          onChange={(e) => updateCompany("address", e.target.value)}
                          placeholder="Straat en huisnummer"
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        />
                      </div>
                    </div>

                    {/* Postcode + City */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Postcode</label>
                        <input
                          type="text"
                          value={company.postalCode}
                          onChange={(e) => updateCompany("postalCode", e.target.value)}
                          placeholder="1234 AB"
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Stad</label>
                        <input
                          type="text"
                          value={company.city}
                          onChange={(e) => updateCompany("city", e.target.value)}
                          placeholder="Amsterdam"
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        />
                      </div>
                    </div>

                    {/* Country */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Land</label>
                      <select
                        value={company.country}
                        onChange={(e) => updateCompany("country", e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                      >
                        <option>Nederland</option>
                        <option>België</option>
                        <option>Duitsland</option>
                        <option>Luxemburg</option>
                        <option>Anders</option>
                      </select>
                    </div>

                    <div className="border-t border-gray-200 pt-6 grid grid-cols-2 gap-4">
                      {/* Phone */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Telefoonnummer</label>
                        <div className="relative">
                          <FaPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <input
                            type="tel"
                            value={company.phone}
                            onChange={(e) => updateCompany("phone", e.target.value)}
                            placeholder="+31 20 000 0000"
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                          />
                        </div>
                      </div>
                      {/* Email */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">E-mailadres</label>
                        <div className="relative">
                          <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <input
                            type="email"
                            value={company.email}
                            onChange={(e) => updateCompany("email", e.target.value)}
                            placeholder="info@bedrijf.nl"
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Website */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                      <div className="relative">
                        <FaGlobe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="url"
                          value={company.website}
                          onChange={(e) => updateCompany("website", e.target.value)}
                          placeholder="https://www.bedrijf.nl"
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        />
                      </div>
                    </div>

                    {/* KvK + BTW */}
                    <div className="border-t border-gray-200 pt-6 grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">KvK-nummer</label>
                        <input
                          type="text"
                          value={company.kvkNumber}
                          onChange={(e) => updateCompany("kvkNumber", e.target.value)}
                          placeholder="12345678"
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">BTW-nummer</label>
                        <input
                          type="text"
                          value={company.btwNumber}
                          onChange={(e) => updateCompany("btwNumber", e.target.value)}
                          placeholder="NL123456789B01"
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        />
                      </div>
                    </div>

                    {/* Save */}
                    <div className="flex items-center gap-4 pt-2">
                      <button
                        onClick={handleSaveCompany}
                        disabled={savingCompany || !company.name.trim()}
                        className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
                      >
                        <FaSave />
                        {savingCompany ? "Opslaan..." : "Instellingen opslaan"}
                      </button>
                      {message && (
                        <p className={`text-sm ${message.type === "success" ? "text-green-600" : "text-red-600"}`}>{message.text}</p>
                      )}
                    </div>
                  </div>
                )
              )}

              {/* ══ TERMS TAB ════════════════════════════════════════════════ */}
              {activeTab === "terms" && (
                companyLoading ? (
                  <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
                  </div>
                ) : (
                  <div className="max-w-3xl space-y-4">
                    <div>
                      <p className="text-gray-500 text-sm mb-1">
                        De tekst hieronder wordt getoond als de algemene voorwaarden van uw organisatie. U kunt gewone tekst of Markdown gebruiken.
                      </p>
                    </div>

                    <textarea
                      value={company.termsAndConditions}
                      onChange={(e) => updateCompany("termsAndConditions", e.target.value)}
                      placeholder={`Artikel 1 – Definities\n\nIn deze algemene voorwaarden wordt verstaan onder:\n\n1. Opdrachtnemer: ...\n2. Opdrachtgever: ...`}
                      rows={20}
                      className="w-full border border-gray-300 rounded-lg p-4 font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-y"
                    />

                    <div className="flex items-center gap-4 pt-2">
                      <button
                        onClick={handleSaveCompany}
                        disabled={savingCompany}
                        className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
                      >
                        <FaSave />
                        {savingCompany ? "Opslaan..." : "Voorwaarden opslaan"}
                      </button>
                      {message && (
                        <p className={`text-sm ${message.type === "success" ? "text-green-600" : "text-red-600"}`}>{message.text}</p>
                      )}
                    </div>
                  </div>
                )
              )}

            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default LicenseManagement;