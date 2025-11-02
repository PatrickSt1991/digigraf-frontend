import React, { useState, useEffect } from 'react';
import { DashboardLayout } from "../../components";
import { Link } from 'react-router-dom';

// Import icons individually to avoid type issues
import { FaShieldAlt } from 'react-icons/fa';
import { FaCheckCircle } from 'react-icons/fa';
import { FaTimesCircle } from 'react-icons/fa';
import { FaUpload } from 'react-icons/fa';
import { FaKey } from 'react-icons/fa';
import { FaExclamationTriangle } from 'react-icons/fa';
import { FaCalendarAlt } from 'react-icons/fa';
import { FaArrowLeft } from 'react-icons/fa';
import { FaUsers } from 'react-icons/fa';
import { FaAward } from 'react-icons/fa';

interface LicenseInfo {
  plan: string;
  isValid: boolean;
  currentUsers: number;
  maxUsers: number;
  canAddUsers: boolean;
  expiresAt?: string;
  features?: string[];
  message?: string;
}

const LicenseManagement: React.FC = () => {
  const [licenseInfo, setLicenseInfo] = useState<LicenseInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadMode, setUploadMode] = useState<'file' | 'key'>('file');
  const [licenseKey, setLicenseKey] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchLicenseInfo();
  }, []);

  const fetchLicenseInfo = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/license/info', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setLicenseInfo(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      setMessage({ type: 'error', text: 'Select a license file' });
      return;
    }

    const formData = new FormData();
    formData.append('licenseFile', selectedFile);

    try {
      setUploading(true);
      const response = await fetch('/api/license/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: formData
      });
      const result = await response.json();
      if (response.ok) {
        setMessage({ type: 'success', text: 'License activated successfully!' });
        setSelectedFile(null);
        await fetchLicenseInfo();
      } else {
        setMessage({ type: 'error', text: result.message || 'Upload failed' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Upload failed' });
    } finally {
      setUploading(false);
    }
  };

  const handleKeyActivation = async () => {
    if (!licenseKey.trim()) {
      setMessage({ type: 'error', text: 'Enter a license key' });
      return;
    }

    try {
      setUploading(true);
      const response = await fetch('/api/license/validate-key', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ licenseKey: licenseKey.trim() })
      });
      const result = await response.json();
      if (response.ok) {
        setMessage({ type: 'success', text: 'License activated successfully!' });
        setLicenseKey('');
        await fetchLicenseInfo();
      } else {
        setMessage({ type: 'error', text: result.message || 'Activation failed' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Activation failed' });
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
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8 mt-10">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-4 h-full">
                {/* Back Button */}
                <Link
                  to="/admin"
                  className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Back to dashboard"
                >
                  {(() => {
                    const ArrowIcon = FaArrowLeft as unknown as React.ComponentType<{ size?: number; className?: string }>;
                    return <ArrowIcon size={16} />;
                  })()}
                </Link>
                
                <div className="flex items-center gap-3 h-full">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                    {(() => {
                      const ShieldIcon = FaShieldAlt as unknown as React.ComponentType<{ size?: number; className?: string }>;
                      return <ShieldIcon className="text-white" size={24} />;
                    })()}
                  </div>
                  <div className="flex flex-col justify-center">
                    <h1 className="text-2xl font-bold text-gray-900">Licentiebeheer</h1>
                    <p className="text-gray-600">Beheer uw licenties en gebruikerslimieten</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Current License Status */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className={`p-6 ${isOverLimit ? 'bg-red-600' : isNearLimit ? 'bg-yellow-500' : 'bg-gradient-to-r from-blue-600 to-blue-700'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/80 text-sm font-medium mb-1">Huidig ​​plan</p>
                    <h2 className="text-2xl font-bold text-white capitalize">
                      {licenseInfo?.plan || 'Gratis'}
                    </h2>
                  </div>
                  {licenseInfo?.isValid ? (
                    (() => {
                      const CheckIcon = FaCheckCircle as unknown as React.ComponentType<{ size?: number; className?: string }>;
                      return <CheckIcon className="w-8 h-8 text-white" />;
                    })()
                  ) : (
                    (() => {
                      const TimesIcon = FaTimesCircle as unknown as React.ComponentType<{ size?: number; className?: string }>;
                      return <TimesIcon className="w-8 h-8 text-white" />;
                    })()
                  )}
                </div>
              </div>

              <div className="p-6">
                {/* User Usage */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {(() => {
                        const UsersIcon = FaUsers as unknown as React.ComponentType<{ size?: number; className?: string }>;
                        return <UsersIcon className="w-5 h-5 text-gray-400" />;
                      })()}
                      <span className="text-gray-700 font-medium">Gebruikers</span>
                    </div>
                    <span className="text-gray-700 font-semibold">
                      {licenseInfo?.currentUsers || 0} / {licenseInfo?.maxUsers || 10}
                    </span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${
                        isOverLimit ? 'bg-red-500' : 
                        isNearLimit ? 'bg-yellow-500' : 
                        'bg-gradient-to-r from-blue-500 to-blue-600'
                      }`}
                      style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                    ></div>
                  </div>

                  {isOverLimit && licenseInfo?.message && (
                    <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                      {(() => {
                        const AlertIcon = FaExclamationTriangle as unknown as React.ComponentType<{ size?: number; className?: string }>;
                        return <AlertIcon className="w-4 h-4" />;
                      })()}
                      {licenseInfo.message}
                    </p>
                  )}
                  
                  {isNearLimit && !isOverLimit && (
                    <p className="text-yellow-600 text-sm mt-2 flex items-center gap-1">
                      {(() => {
                        const AlertIcon = FaExclamationTriangle as unknown as React.ComponentType<{ size?: number; className?: string }>;
                        return <AlertIcon className="w-4 h-4" />;
                      })()}
                      You're approaching your user limit.
                    </p>
                  )}
                </div>

                {/* Status Grid */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center gap-2 mb-1">
                      {(() => {
                        const ShieldIcon = FaShieldAlt as unknown as React.ComponentType<{ size?: number; className?: string }>;
                        return <ShieldIcon className="w-4 h-4 text-gray-400" />;
                      })()}
                      <p className="text-gray-500 text-sm">Status</p>
                    </div>
                    <p className={`font-semibold ${licenseInfo?.isValid ? 'text-green-600' : 'text-red-600'}`}>
                      {licenseInfo?.isValid ? 'Actief' : 'Inactief'}
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center gap-2 mb-1">
                      {(() => {
                        const AwardIcon = FaAward as unknown as React.ComponentType<{ size?: number; className?: string }>;
                        return <AwardIcon className="w-4 h-4 text-gray-400" />;
                      })()}
                      <p className="text-gray-500 text-sm">Mag toevoegen</p>
                    </div>
                    <p className={`font-semibold ${licenseInfo?.canAddUsers ? 'text-green-600' : 'text-red-600'}`}>
                      {licenseInfo?.canAddUsers ? 'Ja' : 'Nee'}
                    </p>
                  </div>
                </div>

                {/* Expiration */}
                {licenseInfo?.expiresAt && (
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 mb-6">
                    <div className="flex items-center gap-2 mb-1">
                      {(() => {
                        const CalendarIcon = FaCalendarAlt as unknown as React.ComponentType<{ size?: number; className?: string }>;
                        return <CalendarIcon className="w-4 h-4 text-gray-400" />;
                      })()}
                      <p className="text-gray-500 text-sm">Expires</p>
                    </div>
                    <p className="text-gray-700 font-medium">
                      {new Date(licenseInfo.expiresAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
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
              <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-lg">
                <button
                  onClick={() => setUploadMode('file')}
                  className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
                    uploadMode === 'file' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    {(() => {
                      const UploadIcon = FaUpload as unknown as React.ComponentType<{ size?: number; className?: string }>;
                      return <UploadIcon className="w-4 h-4" />;
                    })()}
                    Licentie uploaden
                  </div>
                </button>
                <button
                  onClick={() => setUploadMode('key')}
                  className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
                    uploadMode === 'key' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    {(() => {
                      const KeyIcon = FaKey as unknown as React.ComponentType<{ size?: number; className?: string }>;
                      return <KeyIcon className="w-4 h-4" />;
                    })()}
                    Licentie invoeren
                  </div>
                </button>
              </div>

              {/* Message Display */}
              {message && (
                <div className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${
                  message.type === 'success' 
                    ? 'bg-green-50 border border-green-200' 
                    : 'bg-red-50 border border-red-200'
                }`}>
                  {message.type === 'success' ? (
                    (() => {
                      const CheckIcon = FaCheckCircle as unknown as React.ComponentType<{ size?: number; className?: string }>;
                      return <CheckIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />;
                    })()
                  ) : (
                    (() => {
                      const AlertIcon = FaExclamationTriangle as unknown as React.ComponentType<{ size?: number; className?: string }>;
                      return <AlertIcon className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />;
                    })()
                  )}
                  <p className={message.type === 'success' ? 'text-green-700' : 'text-red-700'}>
                    {message.text}
                  </p>
                </div>
              )}

              {/* File Upload Mode */}
              {uploadMode === 'file' && (
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-3">
                    Selecteer licentie bestand (.lic)
                  </label>
                  
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
                    {(() => {
                      const UploadIcon = FaUpload as unknown as React.ComponentType<{ size?: number; className?: string }>;
                      return <UploadIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />;
                    })()}
                    
                    <input
                      type="file"
                      accept=".lic"
                      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                      className="hidden"
                      id="license-file"
                    />
                    
                    <label
                      htmlFor="license-file"
                      className="cursor-pointer inline-block bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-lg transition-colors"
                    >
                      Kies bestand
                    </label>
                    
                    {selectedFile && (
                      <p className="text-gray-500 mt-3 text-sm">
                        Selected: {selectedFile.name}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={handleFileUpload}
                    disabled={!selectedFile || uploading}
                    className="w-full mt-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-sm"
                  >
                    {uploading ? 'Uploaden...' : 'Activeer Licentie'}
                  </button>
                </div>
              )}

              {/* Key Entry Mode */}
              {uploadMode === 'key' && (
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-3">
                    Licentie activeren
                  </label>
                  
                  <textarea
                    value={licenseKey}
                    onChange={(e) => setLicenseKey(e.target.value)}
                    placeholder="Plak hier uw licentiesleutel..."
                    className="w-full bg-white text-gray-700 border border-gray-300 rounded-lg p-4 font-mono text-sm min-h-[150px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />

                  <button
                    onClick={handleKeyActivation}
                    disabled={!licenseKey.trim() || uploading}
                    className="w-full mt-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-sm"
                  >
                    {uploading ? 'Activeren...' : 'Licentie activeren'}
                  </button>
                </div>
              )}

              {/* Instructions */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-gray-700 font-semibold mb-3">Hoe te activeren:</h3>
                <ol className="text-gray-500 text-sm space-y-2 list-decimal list-inside">
                  <li>Ontvang licentiebestand (.lic) of sleutel van leverancier</li>
                  <li>Upload bestand of plak sleutel hierboven</li>
                  <li>Licentie wordt gevalideerd en geactiveerd</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Contact Support */}
          <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
            <p className="text-gray-600">
              Moet u upgraden of ondervindt u problemen? Neem contact op{' '}
              <a href="mailto:digi-graf@madebypatrick.nl" className="text-blue-600 hover:text-blue-700 font-medium">
                digi-graf@madebypatrick.nl
              </a>
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default LicenseManagement;