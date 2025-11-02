import { useEffect, useState } from "react";
import { DashboardLayout } from "../../components";
import { FaCalendarAlt, FaMapMarkerAlt, FaUserTie, FaFilter, FaSearch, FaSort } from "react-icons/fa";

interface Funeral {
  id: number;
  firstName: string;
  lastName: string;
  date: string;
  time: string;
  location: string;
  funeralLeader: string;
  type: "begrafenis" | "crematie";
}

export default function AllFunerals() {
  const [funerals, setFunerals] = useState<Funeral[]>([]);
  const [filteredFunerals, setFilteredFunerals] = useState<Funeral[]>([]);
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("");
  const [sortBy, setSortBy] = useState<"date" | "name">("date");

  // Example data - replace with API call
  useEffect(() => {
    setFunerals([
      {
        id: 1,
        firstName: "Maria",
        lastName: "Jansen",
        date: "2024-12-14",
        time: "12:30",
        location: "Aula West, Tilburg",
        funeralLeader: "Dhr. P. de Vries",
        type: "crematie"
      },
      {
        id: 2,
        firstName: "Willem",
        lastName: "Van Dijk",
        date: "2024-11-03",
        time: "10:30",
        location: "Crematorium Den Haag",
        funeralLeader: "Mevr. S. Bakker",
        type: "crematie"
      },
      {
        id: 3,
        firstName: "Anna",
        lastName: "Pieters",
        date: "2024-11-15",
        time: "15:00",
        location: "Begraafplaats Rotterdam",
        funeralLeader: "Dhr. K. van Leeuwen",
        type: "begrafenis"
      },
      {
        id: 4,
        firstName: "Els",
        lastName: "Koenen",
        date: "2024-12-20",
        time: "13:00",
        location: "Aula Noord, Eindhoven",
        funeralLeader: "Dhr. J. Vermeer",
        type: "begrafenis"
      },
      {
        id: 5,
        firstName: "Peter",
        lastName: "de Vries",
        date: "2024-11-22",
        time: "11:00",
        location: "Crematorium Amsterdam",
        funeralLeader: "Mevr. T. Jansen",
        type: "crematie"
      },
      {
        id: 6,
        firstName: "Jan",
        lastName: "Vermeulen",
        date: "2023-10-15",
        time: "14:00",
        location: "Aula Centrum, Utrecht",
        funeralLeader: "Dhr. R. Bakker",
        type: "begrafenis"
      },
    ]);
  }, []);

  // Filter and sort logic
  useEffect(() => {
    let filtered = funerals.filter(f =>
      f.firstName.toLowerCase().includes(search.toLowerCase()) ||
      f.lastName.toLowerCase().includes(search.toLowerCase()) ||
      f.location.toLowerCase().includes(search.toLowerCase()) ||
      f.funeralLeader.toLowerCase().includes(search.toLowerCase())
    );

    if (selectedYear) {
      filtered = filtered.filter(f => {
        const date = new Date(f.date);
        return date.getFullYear().toString() === selectedYear;
      });
    }

    if (selectedMonth) {
      filtered = filtered.filter(f => {
        const date = new Date(f.date);
        return (date.getMonth() + 1).toString() === selectedMonth;
      });
    }

    if (selectedType) {
      filtered = filtered.filter(f => f.type === selectedType);
    }

    // Sort
    filtered = [...filtered].sort((a, b) => {
      if (sortBy === "date") {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      } else {
        return a.lastName.localeCompare(b.lastName);
      }
    });

    setFilteredFunerals(filtered);
  }, [search, funerals, selectedYear, selectedMonth, selectedType, sortBy]);

  // Get unique years and months for filters
  const years = Array.from(new Set(funerals.map(f => new Date(f.date).getFullYear().toString()))).sort((a, b) => parseInt(b) - parseInt(a));
    const months = Array.from({ length: 12 }, (_, i) => ({
    value: (i + 1).toString(),
    label: new Date(2024, i, 1).toLocaleDateString('nl-NL', { month: 'long' })
    }));

  // Reset month when year changes and no funerals in that year-month combination
  useEffect(() => {
    if (selectedYear && selectedMonth) {
      const hasFuneralsInMonth = funerals.some(f => {
        const date = new Date(f.date);
        return date.getFullYear().toString() === selectedYear && 
               (date.getMonth() + 1).toString() === selectedMonth;
      });
      
      if (!hasFuneralsInMonth) {
        setSelectedMonth("");
      }
    }
  }, [selectedYear, funerals]);

  return (
    <DashboardLayout>
      <div className="px-8 pb-8 max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-2">Alle Uitvaarten</h2>
          <p className="text-gray-600">
            Overzicht van alle {filteredFunerals.length} uitvaarten
          </p>
        </div>

        {/* Search and Filters Bar */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Zoek op naam, locatie of uitvaartleider..."
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

          {/* Expandable Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200 grid md:grid-cols-3 gap-6">
              {/* Year Filter */}
              <div>
                <label className="block text-sm font-semibold mb-3 text-gray-700">
                  Jaar
                </label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  <option value="">Alle jaren</option>
                  {years.map(year => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              {/* Month Filter */}
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
                  {months.map(month => (
                    <option key={month.value} value={month.value}>
                      {month.label}
                    </option>
                  ))}
                </select>
                {!selectedYear && (
                  <p className="text-xs text-gray-500 mt-1">Selecteer eerst een jaar</p>
                )}
              </div>

              {/* Type Filter */}
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
                </select>
              </div>
            </div>
          )}

          {/* Active filters */}
          {(search || selectedYear || selectedMonth || selectedType) && (
            <div className="mt-3 flex flex-wrap gap-2">
              {search && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-red-100 text-red-800">
                  Zoek: "{search}"
                  <button onClick={() => setSearch("")} className="ml-2 hover:text-red-900">
                    ×
                  </button>
                </span>
              )}
              {selectedYear && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                  Jaar: {selectedYear}
                  <button onClick={() => {
                    setSelectedYear("");
                    setSelectedMonth("");
                  }} className="ml-2 hover:text-blue-900">
                    ×
                  </button>
                </span>
              )}
              {selectedMonth && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                  Maand: {months.find(m => m.value === selectedMonth)?.label}
                  <button onClick={() => setSelectedMonth("")} className="ml-2 hover:text-purple-900">
                    ×
                  </button>
                </span>
              )}
              {selectedType && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-green-100 text-green-800">
                  Type: {selectedType}
                  <button onClick={() => setSelectedType("")} className="ml-2 hover:text-green-900">
                    ×
                  </button>
                </span>
              )}
              <button
                onClick={() => {
                  setSearch("");
                  setSelectedYear("");
                  setSelectedMonth("");
                  setSelectedType("");
                }}
                className="text-sm text-gray-600 hover:text-gray-800 ml-2"
              >
                Wis alle filters
              </button>
            </div>
          )}
        </div>

        {/* Main Content - Funeral List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-800">
              Uitvaarten ({filteredFunerals.length})
            </h3>
          </div>

          {filteredFunerals.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <FaCalendarAlt className="mx-auto text-4xl mb-3 text-gray-300" />
              <p className="text-lg">Geen uitvaarten gevonden</p>
              <p className="text-sm mt-1">
                Probeer een andere zoekterm of filter
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {filteredFunerals.map((f) => (
                <li
                  key={f.id}
                  className="hover:bg-gray-50 transition duration-150"
                >
                  <div className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-semibold text-gray-800">
                            {f.lastName}, {f.firstName}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            f.type === 'begrafenis' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-orange-100 text-orange-800'
                          }`}>
                            {f.type}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-gray-600">
                          <span className="flex items-center gap-2">
                            <FaCalendarAlt className="text-red-600 flex-shrink-0" />
                            <span>
                              {new Date(f.date).toLocaleDateString("nl-NL", {
                                weekday: 'long',
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                              })} – {f.time}
                            </span>
                          </span>
                          <span className="flex items-center gap-2">
                            <FaMapMarkerAlt className="text-red-600 flex-shrink-0" />
                            {f.location}
                          </span>
                          <span className="flex items-center gap-2">
                            <FaUserTie className="text-red-600 flex-shrink-0" />
                            {f.funeralLeader}
                          </span>
                        </div>
                      </div>

                      <button
                        className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition font-medium"
                        onClick={() => alert(`Open dossier van ${f.firstName} ${f.lastName}`)}
                      >
                        Bekijk dossier
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}