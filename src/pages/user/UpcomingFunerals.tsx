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
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { endpoints } from "../../api/apiConfig";
import apiClient from "../../api/apiClient";

type AgendaItemDto = {
  dossierId: string;
  funeralNumber: string;
  deceasedName: string;
  date: string;
  time: string;
  location: string;
  funeralLeader: string;
};

type AgendaResponse = {
  results: AgendaItemDto[];
  highlightedDates: string[];
};

type Funeral = {
  id: string;
  dossierId: string;
  name: string;
  date: string;
  time: string;
  location: string;
  funeralLeader: string;
  funeralNumber: string;
};

const toMonthParam = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

const toDateParam = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;

export default function UpcomingFunerals() {
  const navigate = useNavigate();

  const [funerals, setFunerals] = useState<Funeral[]>([]);
  const [highlightedDates, setHighlightedDates] = useState<Date[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [visibleMonth, setVisibleMonth] = useState<Date>(new Date());
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearch(searchInput.trim());
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchInput]);

useEffect(() => {
  const loadAgenda = async () => {
    setLoading(true);
    setError("");

    try {
      const monthParam = toMonthParam(visibleMonth);

      // 1) Calendar highlights always depend on visible month
        const highlightsData = await apiClient<AgendaResponse>(
          `${endpoints.upcomingAgenda}?month=${monthParam}`
        );

      const mappedHighlightedDates = (highlightsData.highlightedDates ?? [])
        .map((d) => new Date(`${d}T00:00:00`))
        .filter((d) => !isNaN(d.getTime()));

      setHighlightedDates(mappedHighlightedDates);

      // 2) Results query depends on actual filters
      const params = new URLSearchParams();

      if (selectedDate) {
        params.set("date", toDateParam(selectedDate));
      } else if (!search.trim()) {
        // only use month as result filter when there is no search and no selected date
        params.set("month", monthParam);
      }

      if (search.trim()) {
        params.set("search", search.trim());
      }

        const resultsData = await apiClient<AgendaResponse>(
          `${endpoints.upcomingAgenda}?${params.toString()}`
        );

      const mappedResults: Funeral[] = (resultsData.results ?? [])
        .map((item) => ({
          id: item.dossierId,
          dossierId: item.dossierId,
          name: item.deceasedName || item.funeralNumber || "Onbekend dossier",
          date: item.date,
          time: item.time || "—",
          location: item.location || "—",
          funeralLeader: item.funeralLeader || "—",
          funeralNumber: item.funeralNumber || "—",
        }))
        .sort((a, b) => {
          const aKey = `${a.date} ${a.time}`;
          const bKey = `${b.date} ${b.time}`;
          return aKey.localeCompare(bKey);
        });

      setFunerals(mappedResults);
    } catch (err: any) {
      setError(err?.message || "Er ging iets mis bij het laden.");
      setFunerals([]);
      setHighlightedDates([]);
    } finally {
      setLoading(false);
    }
  };

  loadAgenda();
}, [visibleMonth, selectedDate, search]);

  const today = new Date();
  const todayString = toDateParam(today);

  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  const tomorrowString = toDateParam(tomorrow);

  const weekAhead = new Date();
  weekAhead.setDate(today.getDate() + 7);

  const funeralsToday = useMemo(
    () => funerals.filter((f) => f.date === todayString),
    [funerals, todayString]
  );

  const funeralsTomorrow = useMemo(
    () => funerals.filter((f) => f.date === tomorrowString),
    [funerals, tomorrowString]
  );

  const funeralsWeek = useMemo(
    () =>
      funerals.filter((f) => {
        const date = new Date(`${f.date}T00:00:00`);
        return date > tomorrow && date <= weekAhead;
      }),
    [funerals]
  );

  return (
    <DashboardLayout>
      <div className="px-8 pb-8 max-w-6xl mx-auto space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-2">Uitvaart Agenda</h2>
          <p className="text-gray-600">
            Overzicht van {funerals.length} komende uitvaarten
          </p>
        </div>

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

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
            >
              <FaFilter />
              Filters {showFilters ? "↑" : "↓"}
            </button>

            {(searchInput || selectedDate) && (
              <button
                onClick={() => {
                  setSelectedDate(undefined);
                  setSearch("");
                  setSearchInput("");
                }}
                className="px-4 py-2 text-red-600 hover:text-red-700 text-sm font-medium"
              >
                Wis alle filters
              </button>
            )}
          </div>

          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200 grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-semibold mb-3 text-gray-700">
                  Selecteer datum
                </h3>
                <DayPicker
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  month={visibleMonth}
                  onMonthChange={setVisibleMonth}
                  modifiers={{
                    hasFuneral: (day) =>
                      highlightedDates.some(
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

              <div className="flex items-center justify-center">
                {selectedDate ? (
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Geselecteerde datum:</p>
                    <p className="text-lg font-semibold text-gray-800">
                      {selectedDate.toLocaleDateString("nl-NL", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {funerals.length} uitvaart
                      {funerals.length !== 1 ? "en" : ""} op deze datum
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

        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-800">
              Komende uitvaarten ({funerals.length})
            </h3>
          </div>

          {loading ? (
            <div className="p-8 text-center text-gray-500">
              <p>Uitvaarten laden...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-600">
              <p className="text-lg">Kon agenda niet laden</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          ) : funerals.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <FaCalendarAlt className="mx-auto text-4xl mb-3 text-gray-300" />
              <p className="text-lg">Geen uitvaarten gevonden</p>
              <p className="text-sm mt-1">
                Probeer een andere zoekterm of datum
              </p>
            </div>
          ) : (
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
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">
                          {f.name}
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-gray-600">
                          <span className="flex items-center gap-2">
                            <FaCalendarAlt className="text-red-600 flex-shrink-0" />
                            <span>
                              {new Date(`${f.date}T00:00:00`).toLocaleDateString(
                                "nl-NL",
                                {
                                  weekday: "short",
                                  day: "numeric",
                                  month: "long",
                                }
                              )}{" "}
                              – {f.time}
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

                        <p className="mt-2 text-sm text-gray-500">
                          Uitvaartnummer: {f.funeralNumber}
                        </p>
                      </div>

                      <div className="text-sm font-medium text-red-600 lg:self-center">
                        Open dossier
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}