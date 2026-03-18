import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "../../components";
import {
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaUserTie,
  FaFilter,
  FaSearch,
} from "react-icons/fa";
import { endpoints } from "../../api/apiConfig";
import apiClient from "../../api/apiClient";

interface Funeral {
  id: string;
  dossierId: string;
  firstName: string;
  lastName: string;
  date: string;
  time: string;
  location: string;
  funeralLeader: string;
  type: "begrafenis" | "crematie" | "";
  voorregeling: boolean;
}

interface AllFuneralsResponse {
  items: Funeral[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  availableYears: number[];
  defaultStartMonth: string;
  defaultEndMonth: string;
}

export default function AllFunerals() {
  const navigate = useNavigate();

  const [funerals, setFunerals] = useState<Funeral[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("");
  const [sortBy, setSortBy] = useState<"date" | "name">("date");

  const [page, setPage] = useState(1);
  const [pageSize] = useState(12);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [years, setYears] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [defaultRangeLabel, setDefaultRangeLabel] = useState("");

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
  }, [selectedYear, selectedMonth, selectedType, sortBy]);

  useEffect(() => {
    const loadFunerals = async () => {
      setLoading(true);
      setError("");

      try {
        const params = new URLSearchParams();
        params.set("page", page.toString());
        params.set("pageSize", pageSize.toString());
        params.set("sortBy", sortBy);

        if (search) params.set("search", search);
        if (selectedYear) params.set("year", selectedYear);
        if (selectedMonth) params.set("month", selectedMonth);
        if (selectedType) params.set("type", selectedType);

        const data = await apiClient<AllFuneralsResponse>(
          `${endpoints.allPaged}?${params.toString()}`
        );

        setFunerals(data.items ?? []);
        setTotalPages(data.totalPages ?? 1);
        setTotalCount(data.totalCount ?? 0);
        setYears(data.availableYears ?? []);

        if (!selectedYear && !selectedMonth && data.defaultStartMonth && data.defaultEndMonth) {
          const formatMonth = (value: string) => {
            const [year, month] = value.split("-");
            return new Date(Number(year), Number(month) - 1, 1).toLocaleDateString("nl-NL", {
              month: "long",
              year: "numeric",
            });
          };

          setDefaultRangeLabel(
            `${formatMonth(data.defaultStartMonth)} t/m ${formatMonth(data.defaultEndMonth)}`
          );
        } else {
          setDefaultRangeLabel("");
        }
      } catch (err: any) {
        setError(err?.message || "Er ging iets mis bij het laden.");
        setFunerals([]);
      } finally {
        setLoading(false);
      }
    };

    loadFunerals();
  }, [page, pageSize, search, selectedYear, selectedMonth, selectedType, sortBy]);

  const months = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => ({
        value: (i + 1).toString(),
        label: new Date(2024, i, 1).toLocaleDateString("nl-NL", {
          month: "long",
        }),
      })),
    []
  );

  const visibleCountText =
    totalCount === 1 ? "1 uitvaart" : `${totalCount} uitvaarten`;

  return (
    <DashboardLayout>
      <div className="px-8 pb-8 max-w-6xl mx-auto space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-2">Alle Uitvaarten</h2>
          <p className="text-gray-600">Overzicht van {visibleCountText}</p>
          {!selectedYear && !selectedMonth && defaultRangeLabel && (
            <p className="text-sm text-gray-500 mt-1">
              Standaard wordt getoond: {defaultRangeLabel}
            </p>
          )}
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Zoek op naam, locatie, uitvaartleider of uitvaartnummer..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
              >
                <FaFilter />
                Filters {showFilters ? "↑" : "↓"}
              </button>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "date" | "name")}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="date">Sorteer op datum</option>
                <option value="name">Sorteer op naam</option>
              </select>
            </div>
          </div>

          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200 grid md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-3 text-gray-700">
                  Jaar
                </label>
                <select
                  value={selectedYear}
                  onChange={(e) => {
                    setSelectedYear(e.target.value);
                    if (!e.target.value) setSelectedMonth("");
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  <option value="">Laatste 3 maanden</option>
                  {years.map((year) => (
                    <option key={year} value={year.toString()}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-3 text-gray-700">
                  Maand
                </label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  disabled={!selectedYear}
                >
                  <option value="">Alle maanden</option>
                  {months.map((month) => (
                    <option key={month.value} value={month.value}>
                      {month.label}
                    </option>
                  ))}
                </select>
                {!selectedYear && (
                  <p className="text-xs text-gray-500 mt-1">Selecteer eerst een jaar</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold mb-3 text-gray-700">
                  Type uitvaart
                </label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  <option value="">Alle types</option>
                  <option value="begrafenis">Begrafenis</option>
                  <option value="crematie">Crematie</option>
                  <option value="voorregeling">Voorregeling</option>
                </select>
              </div>
            </div>
          )}

          {(searchInput || selectedYear || selectedMonth || selectedType) && (
            <div className="mt-3 flex flex-wrap gap-2">
              {searchInput && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-red-100 text-red-800">
                  Zoek: "{searchInput}"
                  <button onClick={() => setSearchInput("")} className="ml-2 hover:text-red-900">
                    ×
                  </button>
                </span>
              )}
              {selectedYear && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                  Jaar: {selectedYear}
                  <button
                    onClick={() => {
                      setSelectedYear("");
                      setSelectedMonth("");
                    }}
                    className="ml-2 hover:text-blue-900"
                  >
                    ×
                  </button>
                </span>
              )}
              {selectedMonth && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                  Maand: {months.find((m) => m.value === selectedMonth)?.label}
                  <button onClick={() => setSelectedMonth("")} className="ml-2 hover:text-purple-900">
                    ×
                  </button>
                </span>
              )}
              {selectedType && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-green-100 text-green-800">
                  Type: {selectedType === "voorregeling" ? "Voorregeling" : selectedType}
                  <button onClick={() => setSelectedType("")} className="ml-2 hover:text-green-900">
                    ×
                  </button>
                </span>
              )}

              <button
                onClick={() => {
                  setSearchInput("");
                  setSearch("");
                  setSelectedYear("");
                  setSelectedMonth("");
                  setSelectedType("");
                  setPage(1);
                }}
                className="text-sm text-gray-600 hover:text-gray-800 ml-2"
              >
                Wis alle filters
              </button>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-800">
              Uitvaarten ({totalCount})
            </h3>
          </div>

          {loading ? (
            <div className="p-8 text-center text-gray-500">
              <p>Uitvaarten laden...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-600">
              <p className="text-lg">Kon uitvaarten niet laden</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          ) : funerals.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <FaCalendarAlt className="mx-auto text-4xl mb-3 text-gray-300" />
              <p className="text-lg">Geen uitvaarten gevonden</p>
              <p className="text-sm mt-1">Probeer een andere zoekterm of filter</p>
            </div>
          ) : (
            <>
              <ul className="divide-y divide-gray-100">
                {funerals.map((f) => (
                  <li key={f.id}>
                    <button
                      type="button"
                      onClick={() => navigate(`/deceased/${f.dossierId}`)}
                      className="w-full text-left p-6 transition duration-150 hover:bg-red-50 hover:border-l-4 hover:border-red-500 focus:outline-none focus:bg-red-50 cursor-pointer"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <h3 className="text-xl font-semibold text-gray-800">
                              {f.lastName}, {f.firstName}
                            </h3>

                            {f.voorregeling && (
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                Voorregeling
                              </span>
                            )}

                            {!!f.type && (
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  f.type === "begrafenis"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-orange-100 text-orange-800"
                                }`}
                              >
                                {f.type}
                              </span>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-gray-600">
                            <span className="flex items-center gap-2">
                              <FaCalendarAlt className="text-red-600 flex-shrink-0" />
                              <span>
                              {f.date
                                ? `${new Date(`${f.date}T00:00:00`).toLocaleDateString("nl-NL", {
                                    weekday: "long",
                                    day: "numeric",
                                    month: "long",
                                    year: "numeric",
                                  })} – ${f.time || "—"}`
                                : f.voorregeling
                                  ? "Nog geen datum gepland (Voorregeling)"
                                  : "Nog geen datum gepland"}
                              </span>

                            </span>
                            <span className="flex items-center gap-2">
                              <FaMapMarkerAlt className="text-red-600 flex-shrink-0" />
                              {f.location || "—"}
                            </span>
                            <span className="flex items-center gap-2">
                              <FaUserTie className="text-red-600 flex-shrink-0" />
                              {f.funeralLeader || "—"}
                            </span>
                          </div>
                        </div>

                        <div className="text-sm font-medium text-red-600 lg:self-center">
                          Open dossier
                        </div>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>

              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50">
                <p className="text-sm text-gray-600">
                  Pagina {page} van {totalPages}
                </p>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="px-4 py-2 rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Vorige
                  </button>
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="px-4 py-2 rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Volgende
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}