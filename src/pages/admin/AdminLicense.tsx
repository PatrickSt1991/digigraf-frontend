import React, { useState, useEffect } from "react";
import { DashboardLayout } from "../../components";
import { Link } from "react-router-dom";
import { FaShieldAlt, FaCheckCircle, FaTimesCircle, FaUpload, FaKey, FaExclamationTriangle, FaCalendarAlt, FaArrowLeft, FaUsers, FaAward } from "react-icons/fa";
import { getLicenseInfo, uploadLicenseFile, activateLicenseKey } from "../../api/licenseApi";
import { LicenseInfo } from "../../types/license";

const LicenseManagement: React.FC = () => {
  const [licenseInfo, setLicenseInfo] = useState<LicenseInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadMode, setUploadMode] = useState<"file" | "key">("file");
  const [licenseKey, setLicenseKey] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Fetch license info
  useEffect(() => {
    fetchInfo();
  }, []);

  const fetchInfo = async () => {
    try {
      setLoading(true);
      const data = await getLicenseInfo();
      setLicenseInfo(data);
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Failed to fetch license info" });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) return setMessage({ type: "error", text: "Select a license file" });

    try {
      setUploading(true);
      const res = await uploadLicenseFile(selectedFile);
      if (res.message) {
        setMessage({ type: "success", text: res.message });
        setSelectedFile(null);
        await fetchInfo();
      }
    } catch {
      setMessage({ type: "error", text: "Upload failed" });
    } finally {
      setUploading(false);
    }
  };

  const handleKeyActivation = async () => {
    if (!licenseKey.trim()) return setMessage({ type: "error", text: "Enter a license key" });

    try {
      setUploading(true);
      const res = await activateLicenseKey(licenseKey.trim());
      setMessage({ type: "success", text: res.message });
      setLicenseKey("");
      await fetchInfo();
    } catch (err: any) {
      setMessage({ type: "error", text: err?.message || "Activation failed" });
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  const usagePercentage = licenseInfo ? (licenseInfo.currentUsers / licenseInfo.maxUsers) * 100 : 0;
  const isNearLimit = usagePercentage >= 80 && licenseInfo?.isValid;
  const isOverLimit = licenseInfo && !licenseInfo.isValid;

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8 mt-10 flex items-center gap-4">
            <Link to="/admin" className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
              <FaArrowLeft />
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <FaShieldAlt className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Licentiebeheer</h1>
                <p className="text-gray-600">Beheer uw licenties en gebruikerslimieten</p>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Current License Status */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className={`p-6 ${isOverLimit ? "bg-red-600" : isNearLimit ? "bg-yellow-500" : "bg-gradient-to-r from-blue-600 to-blue-700"}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/80 text-sm font-medium mb-1">Huidig ​​plan</p>
                    <h2 className="text-2xl font-bold text-white capitalize">{licenseInfo?.plan || "Gratis"}</h2>
                  </div>
                  {licenseInfo?.isValid ? <FaCheckCircle className="w-8 h-8 text-white" /> : <FaTimesCircle className="w-8 h-8 text-white" />}
                </div>
              </div>

              <div className="p-6">
                {/* User Usage */}
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
                    ></div>
                  </div>

                  {isOverLimit && licenseInfo?.message && (
                    <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                      <FaExclamationTriangle className="w-4 h-4" />
                      {licenseInfo.message}
                    </p>
                  )}
                  {isNearLimit && !isOverLimit && (
                    <p className="text-yellow-600 text-sm mt-2 flex items-center gap-1">
                      <FaExclamationTriangle className="w-4 h-4" />
                      You're approaching your user limit.
                    </p>
                  )}
                </div>

                {/* Status Grid */}
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

                {/* Expiration */}
                {licenseInfo?.expiresAt && (
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 mb-6">
                    <div className="flex items-center gap-2 mb-1">
                      <FaCalendarAlt className="w-4 h-4 text-gray-400" />
                      <p className="text-gray-500 text-sm">Expires</p>
                    </div>
                    <p className="text-gray-700 font-medium">{new Date(licenseInfo.expiresAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
                  </div>
                )}

                {/* Features */}
                {licenseInfo?.features && licenseInfo.features.length > 0 && (
                  <div className="pt-6 border-t border-gray-200">
                    <p className="text-gray-500 text-sm mb-3">Enabled Features</p>
                    <div className="flex flex-wrap gap-2">
                      {licenseInfo.features.map((feature, idx) => (
                        <span key={idx} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Upload/Activate License */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Licentie activeren</h2>

              {/* Mode Toggle */}
              <div className="flex gap-2 mb-6 bg-gray-100 p-2 rounded-lg">
                <button
                  className={`flex-1 p-2 rounded-lg ${uploadMode === "file" ? "bg-blue-600 text-white" : "text-gray-700"}`}
                  onClick={() => setUploadMode("file")}
                >
                  <FaUpload className="inline mr-2" /> Upload File
                </button>
                <button
                  className={`flex-1 p-2 rounded-lg ${uploadMode === "key" ? "bg-blue-600 text-white" : "text-gray-700"}`}
                  onClick={() => setUploadMode("key")}
                >
                  <FaKey className="inline mr-2" /> License Key
                </button>
              </div>

              {/* Upload Form */}
              {uploadMode === "file" ? (
                <div className="flex flex-col gap-4">
                  <label
                    htmlFor="licenseFile"
                    className="cursor-pointer bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg p-4 text-center flex flex-col items-center justify-center gap-2"
                  >
                    <FaUpload className="w-6 h-6 text-gray-600" />
                    <span className="text-gray-700">Click to select a license file</span>
                    {selectedFile && <span className="text-gray-500 text-sm">{selectedFile.name}</span>}
                  </label>
                  <input
                    id="licenseFile"
                    type="file"
                    className="hidden"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
                  />
                  <button
                    onClick={handleFileUpload}
                    disabled={uploading || !selectedFile}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {uploading ? "Uploading..." : "Upload License"}
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <textarea
                    value={licenseKey}
                    onChange={(e) => setLicenseKey(e.target.value)}
                    placeholder="Paste your license key here"
                    className="w-full border border-gray-300 rounded-lg p-2 resize-none"
                    rows={4}
                  />
                  <button
                    onClick={handleKeyActivation}
                    disabled={uploading || !licenseKey.trim()}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {uploading ? "Activating..." : "Activate License"}
                  </button>
                </div>
              )}

              {message && (
                <p className={`mt-4 ${message.type === "success" ? "text-green-600" : "text-red-600"}`}>{message.text}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default LicenseManagement;
