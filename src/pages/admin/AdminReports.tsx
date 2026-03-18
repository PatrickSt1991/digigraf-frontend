import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FaArrowLeft,
  FaChartBar,
  FaChartLine,
  FaChartPie,
  FaFilter,
  FaListUl,
  FaSearch,
  FaTable,
} from 'react-icons/fa';

import { DashboardLayout } from '../../components';
import {
  getAverageScoreDetails,
  getAverageScoresReport,
  getCoffinReport,
  getFollowCarsReport,
  getFuneralLeaderReport,
  getOriginCityReport,
  getOriginReport,
  getPeriodListReport,
} from '../../api/reportApi';
import {
  AverageScoreDetailItem,
  AverageScoreReportItem,
  CoffinReportItem,
  FollowCarsReportItem,
  FuneralLeaderReportItem,
  OriginCityReportItem,
  OriginReportItem,
  PeriodListItem,
  ReportFilter,
  ReportTab,
  ReportViewMode,
} from '../../types';

type MessageState = { type: 'error' | 'success'; text: string } | null;

type ChartRow = {
  label: string;
  value: number;
};

const tabs: { id: ReportTab; label: string; defaultView: ReportViewMode }[] = [
  { id: 'coffins', label: 'Kisten', defaultView: 'chart' },
  { id: 'funeralLeaders', label: 'Uitvaartleiders', defaultView: 'chart' },
  { id: 'origins', label: 'Herkomsten', defaultView: 'chart' },
  { id: 'originCity', label: 'Herkomst + Woonplaats', defaultView: 'chart' },
  { id: 'followCars', label: 'Volgauto\'s', defaultView: 'chart' },
  { id: 'periodList', label: 'Periode lijst', defaultView: 'table' },
  { id: 'averageScores', label: 'Gemiddeld cijfer', defaultView: 'table' },
];

const initialFilter: ReportFilter = {
  funeralNumberFrom: '',
  funeralNumberTo: '',
  dateFrom: '',
  dateTo: '',
};

const AdminReports: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ReportTab>('coffins');
  const [viewMode, setViewMode] = useState<ReportViewMode>('chart');
  const [filters, setFilters] = useState<ReportFilter>(initialFilter);
  const [appliedFilters, setAppliedFilters] = useState<ReportFilter>(initialFilter);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<MessageState>(null);

  const [coffins, setCoffins] = useState<CoffinReportItem[]>([]);
  const [funeralLeaders, setFuneralLeaders] = useState<FuneralLeaderReportItem[]>([]);
  const [origins, setOrigins] = useState<OriginReportItem[]>([]);
  const [originCities, setOriginCities] = useState<OriginCityReportItem[]>([]);
  const [followCars, setFollowCars] = useState<FollowCarsReportItem[]>([]);
  const [periodList, setPeriodList] = useState<PeriodListItem[]>([]);
  const [averageScores, setAverageScores] = useState<AverageScoreReportItem[]>([]);
  const [detailLeader, setDetailLeader] = useState<string>('');
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailItems, setDetailItems] = useState<AverageScoreDetailItem[]>([]);

  useEffect(() => {
    const current = tabs.find((tab) => tab.id === activeTab);
    setViewMode(current?.defaultView ?? 'chart');
  }, [activeTab]);

  useEffect(() => {
    void fetchReport(activeTab, appliedFilters);
  }, [activeTab, appliedFilters]);

  const fetchReport = async (tab: ReportTab, filter: ReportFilter) => {
    try {
      setLoading(true);
      setMessage(null);

      switch (tab) {
        case 'coffins':
          setCoffins(await getCoffinReport(filter));
          break;
        case 'funeralLeaders':
          setFuneralLeaders(await getFuneralLeaderReport(filter));
          break;
        case 'origins':
          setOrigins(await getOriginReport(filter));
          break;
        case 'originCity':
          setOriginCities(await getOriginCityReport(filter));
          break;
        case 'followCars':
          setFollowCars(await getFollowCarsReport(filter));
          break;
        case 'periodList':
          setPeriodList(await getPeriodListReport(filter));
          break;
        case 'averageScores':
          setAverageScores(await getAverageScoresReport(filter));
          break;
      }
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error?.message || 'Rapportage ophalen mislukt.',
      });
    } finally {
      setLoading(false);
    }
  };

  const openSpecification = async (funeralLeader: string) => {
    try {
      setDetailLeader(funeralLeader);
      setDetailLoading(true);
      setDetailItems(await getAverageScoreDetails(funeralLeader, appliedFilters));
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error?.message || 'Specificatie ophalen mislukt.',
      });
    } finally {
      setDetailLoading(false);
    }
  };

  const closeSpecification = () => {
    setDetailLeader('');
    setDetailItems([]);
  };

  const currentChartData = useMemo<ChartRow[]>(() => {
    switch (activeTab) {
      case 'coffins':
        return coffins.map((item) => ({ label: item.code || item.description || 'Onbekend', value: item.count }));
      case 'funeralLeaders':
        return funeralLeaders.map((item) => ({ label: item.funeralLeader, value: item.count }));
      case 'origins':
        return origins.map((item) => ({ label: item.origin, value: item.count }));
      case 'originCity':
        return originCities.map((item) => ({ label: item.label, value: item.count }));
      case 'followCars':
        return followCars.map((item) => ({ label: item.followCars, value: item.count }));
      case 'averageScores':
        return averageScores.map((item) => ({ label: item.funeralLeader, value: item.averageScore }));
      default:
        return [];
    }
  }, [activeTab, averageScores, coffins, followCars, funeralLeaders, originCities, origins]);

  const currentTitle = tabs.find((tab) => tab.id === activeTab)?.label ?? 'Rapportages';

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-10">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between min-h-16">
              <div className="flex items-center gap-4 h-full">
                <Link
                  to="/admin"
                  className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors self-start xl:self-auto"
                  title="Terug naar dashboard"
                >
                  <FaArrowLeft size={16} />
                </Link>

                <div className="flex items-center gap-3 h-full">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                    <FaChartPie className="text-white" size={24} />
                  </div>
                  <div className="flex flex-col justify-center">
                    <h1 className="text-2xl font-bold text-gray-900">Rapportages Beheer</h1>
                    <p className="text-gray-600">Bekijk statistieken, gemiddelden en specificaties</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 items-center">
                <button
                  onClick={() => setAppliedFilters(filters)}
                  className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
                >
                  <FaFilter size={14} />
                  Filter toepassen
                </button>

                <button
                  onClick={() => {
                    setFilters(initialFilter);
                    setAppliedFilters(initialFilter);
                  }}
                  className="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Reset
                </button>

                {activeTab !== 'periodList' && (
                  <button
                    onClick={() => setViewMode((prev) => (prev === 'chart' ? 'table' : 'chart'))}
                    className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                      viewMode === 'chart'
                        ? 'bg-green-100 text-green-700 font-medium'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {viewMode === 'chart' ? <FaTable size={14} /> : <FaChartBar size={14} />}
                    {viewMode === 'chart' ? 'Tabel weergave' : 'Grafiek weergave'}
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col xl:flex-row gap-4 items-start xl:items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4 flex-1 w-full">
                <div className="relative flex-1 max-w-md">
                  <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    placeholder="Uitvaartnummer van"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    value={filters.funeralNumberFrom || ''}
                    onChange={(e) => setFilters((prev) => ({ ...prev, funeralNumberFrom: e.target.value }))}
                  />
                </div>

                <input
                  type="text"
                  placeholder="Uitvaartnummer t/m"
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  value={filters.funeralNumberTo || ''}
                  onChange={(e) => setFilters((prev) => ({ ...prev, funeralNumberTo: e.target.value }))}
                />

                <input
                  type="date"
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  value={filters.dateFrom || ''}
                  onChange={(e) => setFilters((prev) => ({ ...prev, dateFrom: e.target.value }))}
                />

                <input
                  type="date"
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  value={filters.dateTo || ''}
                  onChange={(e) => setFilters((prev) => ({ ...prev, dateTo: e.target.value }))}
                />
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600 whitespace-nowrap">
                <FaChartLine size={16} />
                {currentTitle}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="flex flex-wrap border-b border-gray-200">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-5 py-4 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'border-b-2 border-green-600 text-green-700 bg-green-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="p-6 space-y-4">
              {message && (
                <div className={`rounded-lg px-4 py-3 text-sm ${message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                  {message.text}
                </div>
              )}

              {loading ? (
                <div className="py-16 text-center text-gray-500">Rapportage laden...</div>
              ) : (
                <>
                  {activeTab !== 'periodList' && viewMode === 'chart' && (
                    <SimpleChart
                      title={currentTitle}
                      data={currentChartData}
                      variant={activeTab === 'coffins' ? 'pie' : 'bar'}
                      onSelect={activeTab === 'averageScores' ? openSpecification : undefined}
                    />
                  )}

                  {(activeTab === 'periodList' || viewMode === 'table') && (
                    <div className="overflow-x-auto">
                      {activeTab === 'coffins' && <CoffinsTable items={coffins} />}
                      {activeTab === 'funeralLeaders' && <FuneralLeadersTable items={funeralLeaders} />}
                      {activeTab === 'origins' && <OriginsTable items={origins} />}
                      {activeTab === 'originCity' && <OriginCitiesTable items={originCities} />}
                      {activeTab === 'followCars' && <FollowCarsTable items={followCars} />}
                      {activeTab === 'periodList' && <PeriodListTable items={periodList} />}
                      {activeTab === 'averageScores' && <AverageScoresTable items={averageScores} onSpecification={openSpecification} />}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {detailLeader && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[85vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Specificatie</h2>
                <p className="text-gray-600 text-sm mt-1">{detailLeader}</p>
              </div>
              <button onClick={closeSpecification} className="text-gray-500 hover:text-gray-900">Sluiten</button>
            </div>
            <div className="p-6 overflow-auto max-h-[70vh]">
              {detailLoading ? (
                <div className="py-10 text-center text-gray-500">Specificatie laden...</div>
              ) : (
                <AverageScoreDetailsTable items={detailItems} />
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

const tableClass = 'w-full';
const headClass = 'px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 border-b border-gray-200';
const cellClass = 'px-6 py-4 whitespace-nowrap text-sm text-gray-700';

const EmptyState = ({ text = 'Geen gegevens gevonden.' }: { text?: string }) => (
  <div className="p-8 text-center text-gray-500 flex items-center justify-center gap-2">
    <FaListUl size={16} />
    {text}
  </div>
);

const CoffinsTable = ({ items }: { items: CoffinReportItem[] }) => (
  <table className={tableClass}>
    <thead>
      <tr>
        <th className={headClass}>Code</th>
        <th className={headClass}>Omschrijving</th>
        <th className={headClass}>Aantal</th>
        <th className={headClass}>Percentage</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-gray-200">
      {items.map((item, index) => (
        <tr key={`${item.code}-${index}`} className="hover:bg-gray-50 transition-colors">
          <td className={cellClass}>{item.code}</td>
          <td className={cellClass}>{item.description}</td>
          <td className={cellClass}>{item.count}</td>
          <td className={cellClass}>{item.percentage}%</td>
        </tr>
      ))}
      {items.length === 0 && (
        <tr><td colSpan={4}><EmptyState /></td></tr>
      )}
    </tbody>
  </table>
);

const FuneralLeadersTable = ({ items }: { items: FuneralLeaderReportItem[] }) => (
  <table className={tableClass}>
    <thead>
      <tr>
        <th className={headClass}>Uitvaartleider</th>
        <th className={headClass}>Aantal uitvaarten</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-gray-200">
      {items.map((item) => (
        <tr key={item.funeralLeader} className="hover:bg-gray-50 transition-colors">
          <td className={cellClass}>{item.funeralLeader}</td>
          <td className={cellClass}>{item.count}</td>
        </tr>
      ))}
      {items.length === 0 && (
        <tr><td colSpan={2}><EmptyState /></td></tr>
      )}
    </tbody>
  </table>
);

const OriginsTable = ({ items }: { items: OriginReportItem[] }) => (
  <table className={tableClass}>
    <thead>
      <tr>
        <th className={headClass}>Herkomst</th>
        <th className={headClass}>Aantal</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-gray-200">
      {items.map((item) => (
        <tr key={item.origin} className="hover:bg-gray-50 transition-colors">
          <td className={cellClass}>{item.origin}</td>
          <td className={cellClass}>{item.count}</td>
        </tr>
      ))}
      {items.length === 0 && (
        <tr><td colSpan={2}><EmptyState /></td></tr>
      )}
    </tbody>
  </table>
);

const OriginCitiesTable = ({ items }: { items: OriginCityReportItem[] }) => (
  <table className={tableClass}>
    <thead>
      <tr>
        <th className={headClass}>Herkomst</th>
        <th className={headClass}>Woonplaats overledene</th>
        <th className={headClass}>Aantal</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-gray-200">
      {items.map((item, index) => (
        <tr key={`${item.label}-${index}`} className="hover:bg-gray-50 transition-colors">
          <td className={cellClass}>{item.origin}</td>
          <td className={cellClass}>{item.city}</td>
          <td className={cellClass}>{item.count}</td>
        </tr>
      ))}
      {items.length === 0 && (
        <tr><td colSpan={3}><EmptyState /></td></tr>
      )}
    </tbody>
  </table>
);

const FollowCarsTable = ({ items }: { items: FollowCarsReportItem[] }) => (
  <table className={tableClass}>
    <thead>
      <tr>
        <th className={headClass}>Aantal volgauto's</th>
        <th className={headClass}>Aantal uitvaarten</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-gray-200">
      {items.map((item) => (
        <tr key={item.followCars} className="hover:bg-gray-50 transition-colors">
          <td className={cellClass}>{item.followCars}</td>
          <td className={cellClass}>{item.count}</td>
        </tr>
      ))}
      {items.length === 0 && (
        <tr><td colSpan={2}><EmptyState /></td></tr>
      )}
    </tbody>
  </table>
);

const PeriodListTable = ({ items }: { items: PeriodListItem[] }) => (
  <table className={tableClass}>
    <thead>
      <tr>
        <th className={headClass}>Uitvaartnummer</th>
        <th className={headClass}>Datum</th>
        <th className={headClass}>Overledene</th>
        <th className={headClass}>Uitvaartleider</th>
        <th className={headClass}>Herkomst</th>
        <th className={headClass}>Kist</th>
        <th className={headClass}>Volgauto's</th>
        <th className={headClass}>Score</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-gray-200">
      {items.map((item) => (
        <tr key={item.dossierId} className="hover:bg-gray-50 transition-colors">
          <td className={cellClass}>{item.funeralNumber}</td>
          <td className={cellClass}>{item.funeralDate}</td>
          <td className={cellClass}>{item.deceasedName}</td>
          <td className={cellClass}>{item.funeralLeader}</td>
          <td className={cellClass}>{item.origin}</td>
          <td className={cellClass}>{item.coffin}</td>
          <td className={cellClass}>{item.followCars}</td>
          <td className={cellClass}>{item.customerScore}</td>
        </tr>
      ))}
      {items.length === 0 && (
        <tr><td colSpan={8}><EmptyState /></td></tr>
      )}
    </tbody>
  </table>
);

const AverageScoresTable = ({
  items,
  onSpecification,
}: {
  items: AverageScoreReportItem[];
  onSpecification: (funeralLeader: string) => void;
}) => (
  <table className={tableClass}>
    <thead>
      <tr>
        <th className={headClass}>Uitvaartleider</th>
        <th className={headClass}>Aantal beoordelingen</th>
        <th className={headClass}>Gemiddeld cijfer</th>
        <th className={headClass}>Actie</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-gray-200">
      {items.map((item) => (
        <tr key={item.funeralLeader} className="hover:bg-gray-50 transition-colors">
          <td className={cellClass}>{item.funeralLeader}</td>
          <td className={cellClass}>{item.reviewCount}</td>
          <td className={cellClass}>{item.averageScore}</td>
          <td className={cellClass}>
            <button
              onClick={() => onSpecification(item.funeralLeader)}
              className="px-3 py-1.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:shadow-md transition-all"
            >
              Specificatie
            </button>
          </td>
        </tr>
      ))}
      {items.length === 0 && (
        <tr><td colSpan={4}><EmptyState /></td></tr>
      )}
    </tbody>
  </table>
);

const AverageScoreDetailsTable = ({ items }: { items: AverageScoreDetailItem[] }) => (
  <table className={tableClass}>
    <thead>
      <tr>
        <th className={headClass}>Uitvaartnummer</th>
        <th className={headClass}>Datum</th>
        <th className={headClass}>Overledene</th>
        <th className={headClass}>Score</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-gray-200">
      {items.map((item) => (
        <tr key={item.dossierId} className="hover:bg-gray-50 transition-colors">
          <td className={cellClass}>{item.funeralNumber}</td>
          <td className={cellClass}>{item.funeralDate}</td>
          <td className={cellClass}>{item.deceasedName}</td>
          <td className={cellClass}>{item.customerScore}</td>
        </tr>
      ))}
      {items.length === 0 && (
        <tr><td colSpan={4}><EmptyState text="Geen specificaties gevonden." /></td></tr>
      )}
    </tbody>
  </table>
);

const SimpleChart = ({
  title,
  data,
  variant,
  onSelect,
}: {
  title: string;
  data: ChartRow[];
  variant: 'pie' | 'bar';
  onSelect?: (label: string) => void;
}) => {
  if (data.length === 0) {
    return <EmptyState text="Geen gegevens gevonden voor de gekozen filters." />;
  }

  const total = data.reduce((sum, item) => sum + item.value, 0);
  const maxValue = Math.max(...data.map((item) => item.value), 1);

  return (
    <div className="grid xl:grid-cols-2 gap-8 items-start">
      <div>
        <div className="flex items-center gap-2 mb-6">
          {variant === 'pie' ? <FaChartPie className="text-green-600" /> : <FaChartBar className="text-green-600" />}
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        </div>

        {variant === 'pie' ? (
          <div className="w-80 h-80 mx-auto rounded-full border-[18px] border-green-100 flex items-center justify-center bg-gradient-to-br from-green-50 to-white text-center p-8">
            <div>
              <div className="text-3xl font-bold text-green-700">{total}</div>
              <div className="text-sm text-gray-600 mt-2">Totaal geselecteerde records</div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {data.map((item) => {
              const width = Math.max((item.value / maxValue) * 100, 6);
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => onSelect?.(item.label)}
                  disabled={!onSelect}
                  className={`w-full text-left ${onSelect ? 'cursor-pointer' : 'cursor-default'}`}
                >
                  <div className="flex items-center justify-between mb-1 text-sm text-gray-700 gap-3">
                    <span className="truncate">{item.label}</span>
                    <span className="font-medium text-gray-900">{item.value}</span>
                  </div>
                  <div className="h-8 bg-gray-100 rounded-lg overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-lg" style={{ width: `${width}%` }} />
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="bg-gray-50 rounded-xl border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">Legenda</h3>
        <div className="space-y-3">
          {data.map((item) => (
            <div key={item.label} className="flex items-center justify-between gap-4 text-sm text-gray-700">
              <span className="truncate">{item.label}</span>
              <span className="font-medium text-gray-900">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminReports;
