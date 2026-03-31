import { useState } from "react";
import { FaSearch, FaSpinner } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { searchDossiers } from "../../api/dossierApi";
import { DossierDto, OldDBResult } from "../../types";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect?: (dossier: DossierDto) => void;
}

type SearchState = "idle" | "loading" | "done" | "error";

export default function SearchModal({ isOpen, onClose, onSelect }: SearchModalProps) {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"name" | "number">("name");
  const [lastName, setLastName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [funeralNumber, setFuneralNumber] = useState("");
  const [archive, setArchive] = useState(false);
  const [oldDB, setOldDB] = useState(false);

  const [searchState, setSearchState] = useState<SearchState>("idle");
  const [results, setResults] = useState<DossierDto[]>([]);
  const [oldDBResults, setOldDBResults] = useState<OldDBResult[]>([]);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const handleSearch = async () => {
    if (tab === "name" && !lastName.trim()) return;
    if (tab === "number" && !funeralNumber.trim()) return;

    setSearchState("loading");
    setResults([]);
    setOldDBResults([]);
    setErrorMsg("");

    try {
      const data = await searchDossiers(
        tab === "name"
          ? { lastName: lastName.trim(), birthDate: birthDate || undefined, archive, oldDB }
          : { funeralNumber: funeralNumber.trim(), archive, oldDB }
      );

      setResults(data.results);
      setOldDBResults(data.oldDBResults ?? []);
      setSearchState("done");
    } catch (e: any) {
      setErrorMsg(e.message || "Onbekende fout");
      setSearchState("error");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  const handleSelect = (dossier: DossierDto) => {
    if (!dossier.id) return;

    onSelect?.(dossier);
    onClose();
    navigate(`/deceased/${dossier.id}`);
  };

  const handleClose = () => {
    setSearchState("idle");
    setResults([]);
    setOldDBResults([]);
    setErrorMsg("");
    setLastName("");
    setBirthDate("");
    setFuneralNumber("");
    onClose();
  };

  const formatDate = (val?: string) => {
    if (!val) return "—";
    return new Date(val).toLocaleDateString("nl-NL");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-xl p-6 relative flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex justify-between items-center border-b border-gray-200 pb-2 mb-4 shrink-0">
          <h2 className="text-xl font-semibold text-gray-800">Dossier opzoeken</h2>
          <button onClick={handleClose} className="text-gray-500 hover:text-gray-700 text-sm font-semibold">
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-4 shrink-0">
          <button
            onClick={() => { setTab("name"); setSearchState("idle"); setResults([]); }}
            className={`flex-1 py-2 text-sm font-medium border-b-2 transition ${
              tab === "name" ? "border-red-600 text-red-600" : "border-transparent text-gray-600 hover:text-red-600"
            }`}
          >
            Op naam &amp; geboortedatum
          </button>
          <button
            onClick={() => { setTab("number"); setSearchState("idle"); setResults([]); }}
            className={`flex-1 py-2 text-sm font-medium border-b-2 transition ${
              tab === "number" ? "border-red-600 text-red-600" : "border-transparent text-gray-600 hover:text-red-600"
            }`}
          >
            Op uitvaartnummer
          </button>
        </div>

        {/* Search Fields */}
        <div className="shrink-0">
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
                  onKeyDown={handleKeyDown}
                  className="w-full border-0 border-b border-gray-300 rounded-none focus:ring-0 focus:border-gray-900"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Geboortedatum</label>
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full border-0 border-b border-gray-300 rounded-none focus:ring-0 focus:border-gray-900"
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Uitvaartnummer <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={funeralNumber}
                onChange={(e) => setFuneralNumber(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full border-0 border-b border-gray-300 rounded-none focus:ring-0 focus:border-gray-900"
                autoFocus
              />
            </div>
          )}

          {/* Options */}
          <div className="mt-4 space-y-2">
            <label className="flex items-center text-sm text-gray-700 space-x-2 cursor-pointer">
              <input type="checkbox" checked={archive} onChange={(e) => setArchive(e.target.checked)} />
              <span>Zoek in archief folder</span>
            </label>
            <label className="flex items-center text-sm text-gray-700 space-x-2 cursor-pointer">
              <input type="checkbox" checked={oldDB} onChange={(e) => setOldDB(e.target.checked)} />
              <span>Zoek in oude databases</span>
            </label>
          </div>
        </div>

        {/* Results Area */}
        <div className="mt-4 flex-1 overflow-y-auto min-h-0">
          {searchState === "loading" && (
            <div className="flex items-center justify-center py-8 text-gray-500 gap-2">
              <FaSpinner className="animate-spin" />
              <span className="text-sm">Zoeken...</span>
            </div>
          )}

          {searchState === "error" && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
              {errorMsg}
            </div>
          )}

          {searchState === "done" && results.length === 0 && oldDBResults.length === 0 && (
            <div className="text-sm text-gray-500 text-center py-8">
              Geen dossiers gevonden.
            </div>
          )}

          {searchState === "done" && results.length > 0 && (
            <div>
              <p className="text-xs text-gray-400 mb-2">
                {results.length} resultaat{results.length !== 1 ? "en" : ""} gevonden
              </p>
              <ul className="divide-y divide-gray-100 border border-gray-200 rounded overflow-hidden">
                {results.map((d) => (
                  <li key={d.id}>
                    <button
                      onClick={() => handleSelect(d)}
                      className="w-full text-left px-4 py-3 hover:bg-red-50 transition flex justify-between items-center gap-4 group"
                    >
                      <div>
                        <p className="font-medium text-gray-800 group-hover:text-red-700">
                          {[d.deceased?.firstName, d.deceased?.lastName].filter(Boolean).join(" ") || "—"}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {d.deceased?.dob ? `geb. ${formatDate(d.deceased.dob)}` : ""}
                          {d.deceased?.city ? ` · ${d.deceased.city}` : ""}
                          {d.deathInfo?.dateOfDeath ? ` · overl. ${formatDate(d.deathInfo.dateOfDeath)}` : ""}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xs font-medium text-gray-500 bg-gray-100 group-hover:bg-red-100 group-hover:text-red-700 px-2 py-0.5 rounded">
                          {d.funeralNumber || "—"}
                        </span>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {searchState === "done" && oldDBResults.length > 0 && (
            <div className="mt-4">
              <p className="text-xs text-gray-400 mb-2">
                {oldDBResults.length} resultaat{oldDBResults.length !== 1 ? "en" : ""} gevonden in oude databases
              </p>
              <ul className="divide-y divide-amber-100 border border-amber-200 rounded overflow-hidden">
                {oldDBResults.map((r, i) => (
                  <li key={i} className="px-4 py-3 flex justify-between items-center gap-4">
                    <div>
                      <p className="font-medium text-gray-800">
                        {[r.firstName, r.lastName].filter(Boolean).join(" ") || "—"}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {r.birthDate ? `geb. ${formatDate(r.birthDate)}` : ""}
                        {r.funeralNumber ? ` · ${r.funeralNumber}` : ""}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                        {r.databaseName}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer Buttons */}
        <div className="flex justify-end space-x-3 mt-4 border-t border-gray-200 pt-4 shrink-0">
          <button
            onClick={handleClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm"
          >
            Sluiten
          </button>
          <button
            onClick={handleSearch}
            disabled={searchState === "loading"}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 flex items-center gap-2 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {searchState === "loading"
              ? <FaSpinner size={14} className="animate-spin" />
              : <FaSearch size={14} />
            }
            Zoeken
          </button>
        </div>
      </div>
    </div>
  );
}