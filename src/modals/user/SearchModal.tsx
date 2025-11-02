import { useState } from "react";
import { FaSearch } from "react-icons/fa";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch?: (criteria: any) => void;
}

export default function SearchModal({
  isOpen,
  onClose,
  onSearch,
}: SearchModalProps) {
  const [tab, setTab] = useState<"name" | "number">("name");
  const [lastName, setLastName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [funeralNumber, setFuneralNumber] = useState("");
  const [archive, setArchive] = useState(false);
  const [oldDB, setOldDB] = useState(false);

  if (!isOpen) return null;

  const handleSearch = () => {
    const payload =
      tab === "name"
        ? { lastName, birthDate, archive, oldDB }
        : { funeralNumber, archive, oldDB };
    onSearch?.(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-gray-200 pb-2 mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Dossier opzoeken
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-sm font-semibold"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-4">
          <button
            onClick={() => setTab("name")}
            className={`flex-1 py-2 text-sm font-medium border-b-2 transition ${
              tab === "name"
                ? "border-red-600 text-red-600"
                : "border-transparent text-gray-600 hover:text-red-600"
            }`}
          >
            Op naam & geboortedatum
          </button>
          <button
            onClick={() => setTab("number")}
            className={`flex-1 py-2 text-sm font-medium border-b-2 transition ${
              tab === "number"
                ? "border-red-600 text-red-600"
                : "border-transparent text-gray-600 hover:text-red-600"
            }`}
          >
            Op uitvaartnummer
          </button>
        </div>

        {/* Tab Panels */}
        {tab === "name" ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Achternaam <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full border-0 border-b border-gray-300 rounded-none focus:ring-0 focus:border-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Geboortedatum
              </label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full border-0 border-b border-gray-300 rounded-none focus:ring-0 focus:border-gray-900"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Uitvaartnummer <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={funeralNumber}
                onChange={(e) => setFuneralNumber(e.target.value)}
                className="w-full border-0 border-b border-gray-300 rounded-none focus:ring-0 focus:border-gray-900"
              />
            </div>
          </div>
        )}

        {/* Options */}
        <div className="mt-4 space-y-2">
          <label className="flex items-center text-sm text-gray-700 space-x-2">
            <input
              type="checkbox"
              checked={archive}
              onChange={(e) => setArchive(e.target.checked)}
            />
            <span>Zoek in archief folder</span>
          </label>
          <label className="flex items-center text-sm text-gray-700 space-x-2">
            <input
              type="checkbox"
              checked={oldDB}
              onChange={(e) => setOldDB(e.target.checked)}
            />
            <span>Zoek in oude databases</span>
          </label>
        </div>

        {/* Buttons */}
        <div className="flex justify-end space-x-3 mt-6 border-t border-gray-200 pt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
          >
            Sluiten
          </button>
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 flex items-center gap-2"
          >
            <FaSearch size={14} /> Zoeken
          </button>
        </div>
      </div>
    </div>
  );
}