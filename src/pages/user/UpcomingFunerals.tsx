import { useEffect, useState } from "react";
import { DashboardLayout } from "../../components";
import { FaCalendarAlt, FaMapMarkerAlt, FaUserTie, FaFilter, FaSearch } from "react-icons/fa";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

interface Funeral {
  id: number;
  name: string;
  date: string; // ISO format date
  time: string;
  location: string;
  funeralLeader: string;
}

export default function UpcomingFunerals() {
  const [funerals, setFunerals] = useState<Funeral[]>([]);
  const [filteredFunerals, setFilteredFunerals] = useState<Funeral[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Example fetch simulation (replace with API later)
  useEffect(() => {
    setFunerals([
      {
        id: 1,
        name: "Jansen, Maria",
        date: "2025-11-02",
        time: "14:00",
        location: "Aula West, Tilburg",
        funeralLeader: "Dhr. P. de Vries",
      },
      {
        id: 2,
        name: "Van Dijk, Willem",
        date: "2025-11-03",
        time: "10:30",
        location: "Crematorium Den Haag",
        funeralLeader: "Mevr. S. Bakker",
      },
      {
        id: 3,
        name: "Pieters, Anna",
        date: "2025-11-04",
        time: "15:00",
        location: "Begraafplaats Rotterdam",
        funeralLeader: "Dhr. K. van Leeuwen",
      },
      {
        id: 4,
        name: "Koenen, Els",
        date: "2025-11-10",
        time: "13:00",
        location: "Aula Noord, Eindhoven",
        funeralLeader: "Dhr. J. Vermeer",
      },
    ]);
  }, []);

  // KPI logic
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const weekAhead = new Date(today);
  weekAhead.setDate(today.getDate() + 7);

  const funeralsToday = funerals.filter(
    (f) => new Date(f.date).toDateString() === today.toDateString()
  );
  const funeralsTomorrow = funerals.filter(
    (f) => new Date(f.date).toDateString() === tomorrow.toDateString()
  );
  const funeralsWeek = funerals.filter((f) => {
    const date = new Date(f.date);
    return date > tomorrow && date <= weekAhead;
  });

  // Filter logic
  useEffect(() => {
    const lower = search.toLowerCase();
    let filtered = funerals.filter(
      (f) =>
        f.name.toLowerCase().includes(lower) ||
        f.location.toLowerCase().includes(lower) ||
        f.funeralLeader.toLowerCase().includes(lower)
    );

    if (selectedDate) {
      const dateString = selectedDate.toISOString().split("T")[0];
      filtered = filtered.filter((f) => f.date === dateString);
    }

    setFilteredFunerals(filtered);
  }, [search, funerals, selectedDate]);

  // Highlight days with funerals
  const datesWithFunerals = funerals.map((f) => new Date(f.date));

  return (
    <DashboardLayout>
      <div className="px-8 pb-8 max-w-6xl mx-auto space-y-6">
        {/* Simplified Header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-2">Uitvaart Agenda</h2>
          <p className="text-gray-600">
            Overzicht van {filteredFunerals.length} komende uitvaarten
          </p>
        </div>

        {/* Compact KPI Cards */}
        <div className="flex flex-wrap justify-center gap-3">
          <div className="bg-red-50 border border-red-100 rounded-lg px-4 py-3 shadow-sm text-center min-w-[120px]">
            <p className="text-sm text-gray-600">Vandaag</p>
            <p className="text-xl font-bold text-red-700">
              {funeralsToday.length}
            </p>
          </div>
          <div className="bg-orange-50 border border-orange-100 rounded-lg px-4 py-3 shadow-sm text-center min-w-[120px]">
            <p className="text-sm text-gray-600">Morgen</p>
            <p className="text-xl font-bold text-orange-700">
              {funeralsTomorrow.length}
            </p>
          </div>
          <div className="bg-green-50 border border-green-100 rounded-lg px-4 py-3 shadow-sm text-center min-w-[120px]">
            <p className="text-sm text-gray-600">Deze week</p>
            <p className="text-xl font-bold text-green-700">
              {funeralsWeek.length}
            </p>
          </div>
        </div>

        {/* Search Bar with Filter Toggle */}
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
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
            >
              <FaFilter />
              Filters {showFilters ? "↑" : "↓"}
            </button>
            {(search || selectedDate) && (
              <button
                onClick={() => {
                  setSelectedDate(undefined);
                  setSearch("");
                }}
                className="px-4 py-2 text-red-600 hover:text-red-700 text-sm font-medium"
              >
                Wis alle filters
              </button>
            )}
          </div>

          {/* Expandable Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200 grid md:grid-cols-2 gap-6">
              {/* Calendar */}
              <div>
                <h3 className="text-sm font-semibold mb-3 text-gray-700">
                  Selecteer datum
                </h3>
                <DayPicker
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  modifiers={{
                    hasFuneral: (day) =>
                      datesWithFunerals.some(
                        (d) => d.toDateString() === day.toDateString()
                      ),
                  }}
                  modifiersClassNames={{
                    hasFuneral:
                      "bg-red-100 text-red-700 font-semibold rounded-full",
                  }}
                  className="mx-auto text-sm"
                />
              </div>

              {/* Selected Date Info */}
              <div className="flex items-center justify-center">
                {selectedDate ? (
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Geselecteerde datum:</p>
                    <p className="text-lg font-semibold text-gray-800">
                      {selectedDate.toLocaleDateString("nl-NL", {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {filteredFunerals.length} uitvaart{filteredFunerals.length !== 1 ? 'en' : ''} op deze datum
                    </p>
                  </div>
                ) : (
                  <div className="text-center text-gray-500">
                    <FaCalendarAlt className="mx-auto text-2xl mb-2" />
                    <p>Selecteer een datum om te filteren</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Main Content - Funeral List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-800">
              Komende uitvaarten ({filteredFunerals.length})
            </h3>
          </div>

          {filteredFunerals.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <FaCalendarAlt className="mx-auto text-4xl mb-3 text-gray-300" />
              <p className="text-lg">Geen uitvaarten gevonden</p>
              <p className="text-sm mt-1">
                Probeer een andere zoekterm of datum
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
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">
                          {f.name}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-gray-600">
                          <span className="flex items-center gap-2">
                            <FaCalendarAlt className="text-red-600 flex-shrink-0" />
                            <span>
                              {new Date(f.date).toLocaleDateString("nl-NL", {
                                weekday: 'short',
                                day: 'numeric',
                                month: 'long'
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
                        onClick={() => alert(`Open dossier van ${f.name}`)}
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