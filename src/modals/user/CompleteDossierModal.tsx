import React, { useEffect, useState } from "react";
import { FaSpinner, FaUpload } from "react-icons/fa";

interface CompleteDossierModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: {
    customerScore: string;
    isNotificationEnabled: boolean;
    file: File;
  }) => Promise<void> | void;
  initialCustomerScore?: string;
  initialNotificationEnabled?: boolean;
}

export default function CompleteDossierModal({
  isOpen,
  onClose,
  onConfirm,
  initialCustomerScore = "",
  initialNotificationEnabled = false,
}: CompleteDossierModalProps) {
  const [customerScore, setCustomerScore] = useState(initialCustomerScore);
  const [isNotificationEnabled, setIsNotificationEnabled] = useState(
    initialNotificationEnabled
  );
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) return;

    setCustomerScore(initialCustomerScore);
    setIsNotificationEnabled(initialNotificationEnabled);
    setFile(null);
    setError("");
    setSubmitting(false);
  }, [isOpen, initialCustomerScore, initialNotificationEnabled]);

  if (!isOpen) return null;

  const handleClose = () => {
    if (submitting) return;
    onClose();
  };

  const handleSubmit = async () => {
    if (!customerScore.trim()) {
      setError("Klant cijfer is verplicht.");
      return;
    }

    if (!file) {
      setError("Upload een PDF bestand om het dossier af te ronden.");
      return;
    }

    if (file.type !== "application/pdf") {
      setError("Alleen PDF bestanden zijn toegestaan.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      await onConfirm({
        customerScore,
        isNotificationEnabled,
        file,
      });
    } catch (err: any) {
      setError(err?.message || "Afronden mislukt.");
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 relative flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center border-b border-gray-200 pb-2 mb-4 shrink-0">
          <h2 className="text-xl font-semibold text-gray-800">Dossier Afronden</h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 text-sm font-semibold"
          >
            ✕
          </button>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-[220px_1fr] items-center gap-4">
            <label className="text-gray-800">Klant Cijfer:</label>
            <input
              type="number"
              min="1"
              max="10"
              value={customerScore}
              onChange={(e) => setCustomerScore(e.target.value)}
              className="w-24 border border-gray-300 rounded px-3 py-2 text-center focus:outline-none focus:ring-2 focus:ring-red-200"
            />
          </div>

          <div className="grid grid-cols-[220px_1fr] items-center gap-4">
            <label className="text-gray-800">Dossier Uploaden:</label>
            <label className="inline-flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 cursor-pointer w-fit">
              <FaUpload size={14} />
              <span>Dossier Uploaden</span>
              <input
                type="file"
                accept="application/pdf,.pdf"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </label>
          </div>

          {file && (
            <div className="text-sm text-gray-600 ml-[220px] -mt-2">
              Geselecteerd bestand: <span className="font-medium">{file.name}</span>
            </div>
          )}

          <label className="flex items-center gap-2 text-gray-800 cursor-pointer">
            <input
              type="checkbox"
              checked={isNotificationEnabled}
              onChange={(e) => setIsNotificationEnabled(e.target.checked)}
            />
            <span>Notificatie na 1 jaar overlijden?</span>
          </label>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
              {error}
            </div>
          )}
        </div>

        <div className="flex justify-center gap-4 mt-8 border-t border-gray-200 pt-4 shrink-0">
          <button
            onClick={handleClose}
            disabled={submitting}
            className="min-w-[130px] px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-60"
          >
            Sluiten
          </button>

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="min-w-[130px] px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {submitting ? (
              <>
                <FaSpinner className="animate-spin" size={14} />
                Bezig...
              </>
            ) : (
              "Afronden"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}