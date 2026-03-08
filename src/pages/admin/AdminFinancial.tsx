import React, { useEffect, useMemo, useState } from 'react';
import { DashboardLayout } from '../../components';
import { Link } from 'react-router-dom';

import {
  FaArrowLeft,
  FaChartLine,
  FaSearch,
  FaFilter,
  FaFileExcel,
  FaFolderOpen,
  FaMoneyBillWave,
  FaPrint,
} from 'react-icons/fa';

import {
  getFinancialInvoices,
  getFinancialBloemen,
  getFinancialSteenhouwerij,
  getFinancialWerkbonnen,
  getFinancialUrnen,
  updateFinancialPayout,
  exportFinancialExcel,
} from '../../api/adminApi';

import { FinancialRowDto } from '../../types';
import AdminInvoiceModal from "../../modals/admin/InvoiceModal";

type FinancialTab = 'facturen' | 'bloemen' | 'steenhouwerij' | 'werkbonnen' | 'urnen';
type StatusFilter = 'all' | 'open' | 'paid' | 'unpaid';

const TAB_LABEL: Record<FinancialTab, string> = {
  facturen: 'Facturen',
  bloemen: 'Bloemen',
  steenhouwerij: 'Steenhouwerij',
  werkbonnen: 'Werkbonnen',
  urnen: 'Urnen & Gedenksieraden',
};

const fmtMoney = (n?: number) =>
  (n ?? 0).toLocaleString('nl-NL', { style: 'currency', currency: 'EUR' });

const fmtDate = (iso?: string) => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('nl-NL');
};

const AdminFinancial: React.FC = () => {
  const [activeTab, setActiveTab] = useState<FinancialTab>('facturen');

  const [rows, setRows] = useState<FinancialRowDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  // payout drawer
  const [payoutOpen, setPayoutOpen] = useState(false);
  const [payoutRow, setPayoutRow] = useState<FinancialRowDto | null>(null);
  const [payoutSaving, setPayoutSaving] = useState(false);

  // kostenbegroting/invoice modal (admin)
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [invoiceDeceasedId, setInvoiceDeceasedId] = useState<string | null>(null);

  const refresh = async () => {
    try {
      setLoadError(null);
      setLoading(true);

      const q = searchTerm.trim();
      const status = statusFilter;

      let data: FinancialRowDto[] = [];
      if (activeTab === 'facturen') data = await getFinancialInvoices({ q, status });
      if (activeTab === 'bloemen') data = await getFinancialBloemen({ q, status });
      if (activeTab === 'steenhouwerij') data = await getFinancialSteenhouwerij({ q, status });
      if (activeTab === 'werkbonnen') data = await getFinancialWerkbonnen({ q, status });
      if (activeTab === 'urnen') data = await getFinancialUrnen({ q, status });

      setRows(data ?? []);
    } catch (e) {
      setLoadError((e as Error)?.message ?? 'Kon financiële gegevens niet laden.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const filteredRows = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return rows;

    return rows.filter(r => {
      const u = (r.uitvaartNummer ?? '').toLowerCase();
      const l = (r.leverancier ?? '').toLowerCase();
      const w = (r.werknemer ?? '').toLowerCase();
      return u.includes(q) || l.includes(q) || w.includes(q);
    });
  }, [rows, searchTerm]);

  const openPayout = (r: FinancialRowDto) => {
    setPayoutRow({ ...r });
    setPayoutOpen(true);
  };

  const closePayout = () => {
    setPayoutOpen(false);
    setPayoutRow(null);
  };

  const savePayout = async () => {
    if (!payoutRow?.id) return;

    setPayoutSaving(true);
    try {
      await updateFinancialPayout(payoutRow.id, {
        provisie: payoutRow.provisie ?? 0,
        datumUitbetaald: payoutRow.datumUitbetaald ?? null,
        uitbetaald: !!payoutRow.uitbetaald,
      });
      await refresh();
      closePayout();
    } finally {
      setPayoutSaving(false);
    }
  };

  const exportExcel = async () => {
    await exportFinancialExcel(activeTab, { q: searchTerm.trim(), status: statusFilter });
  };

    const openKostenbegrotingModal = (row: FinancialRowDto) => {

    if (!row.dossierId) return;
    setInvoiceDeceasedId(row.dossierId);
    setInvoiceOpen(true);
    };

  const hasDossierId = (row: FinancialRowDto) => {
    const anyRow = row as any;
    return !!(anyRow.dossierId);
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-10">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-4 h-full">
                <Link
                  to="/admin"
                  className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Terug naar dashboard"
                >
                  {(() => {
                    const ArrowIcon =
                      FaArrowLeft as unknown as React.ComponentType<{ size?: number; className?: string }>;
                    return <ArrowIcon size={16} />;
                  })()}
                </Link>

                <div className="flex items-center gap-3 h-full">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                    {(() => {
                      const Icon =
                        FaChartLine as unknown as React.ComponentType<{ size?: number; className?: string }>;
                      return <Icon className="text-white" size={22} />;
                    })()}
                  </div>
                  <div className="flex flex-col justify-center">
                    <h1 className="text-2xl font-bold text-gray-900">Financiën</h1>
                    <p className="text-gray-600">Facturen, verkopen en uitbetalingen</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 h-full items-center">
                <button
                  onClick={() => void exportExcel()}
                  className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
                  title="Export naar Excel"
                >
                  {(() => {
                    const X =
                      FaFileExcel as unknown as React.ComponentType<{ size?: number; className?: string }>;
                    return <X size={16} />;
                  })()}
                  Export
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="mt-6 flex flex-wrap gap-2">
              {(Object.keys(TAB_LABEL) as FinancialTab[]).map(k => (
                <button
                  key={k}
                  onClick={() => setActiveTab(k)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    activeTab === k
                      ? 'bg-blue-100 text-blue-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {TAB_LABEL[k]}
                </button>
              ))}
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <div className="relative flex-1 max-w-md">
                  {(() => {
                    const SearchIcon =
                      FaSearch as unknown as React.ComponentType<{ size?: number; className?: string }>;
                    return (
                      <SearchIcon
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        size={16}
                      />
                    );
                  })()}

                  <input
                    type="text"
                    placeholder="Zoek op uitvaartnummer, leverancier of werknemer..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                </div>

                <select
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value as StatusFilter)}
                >
                  <option value="all">Alle statussen</option>
                  <option value="open">Open</option>
                  <option value="paid">Betaald</option>
                  <option value="unpaid">Niet betaald</option>
                </select>

                <button
                  onClick={() => void refresh()}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                  title="Filter toepassen"
                >
                  {(() => {
                    const Icon =
                      FaFilter as unknown as React.ComponentType<{ size?: number; className?: string }>;
                    return <Icon size={14} />;
                  })()}
                  Filter
                </button>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                {(() => {
                  const ChartIcon =
                    FaChartLine as unknown as React.ComponentType<{ size?: number; className?: string }>;
                  return <ChartIcon size={16} />;
                })()}
                {filteredRows.length} regels
              </div>
            </div>

            {loadError && <div className="mt-4 text-sm text-red-600">{loadError}</div>}
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Uitvaartnummer
                    </th>

                    {activeTab === 'facturen' ? (
                      <>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Kostenbegroting datum
                        </th>
                        <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Acties
                        </th>
                      </>
                    ) : (
                      <>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Leverancier
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Werknemer
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Bedrag
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Provisie
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Uitbetaald
                        </th>
                        <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Uitbetalen
                        </th>
                      </>
                    )}
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200">
                  {loading && (
                    <tr>
                      <td colSpan={activeTab === 'facturen' ? 3 : 6} className="px-6 py-8 text-gray-500">
                        Laden...
                      </td>
                    </tr>
                  )}

                  {!loading &&
                    filteredRows.map(r => (
                      <tr key={r.id ?? r.uitvaartNummer} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                          {r.uitvaartNummer ?? '—'}
                        </td>

                        {activeTab === 'facturen' ? (
                          <>
                            <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                              {fmtDate(r.kostenbegrotingDatum)}
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <div className="flex items-center justify-center gap-2">
                                {/* This opens the admin modal (kostenbegroting/invoice edit) */}
                                <button
                                  className="p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                  title="Kostenbegroting openen"
                                  disabled={!hasDossierId(r)}
                                  onClick={() => openKostenbegrotingModal(r)}
                                >
                                  <FaFolderOpen size={16} />
                                </button>

                                <button
                                  className="p-2 text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                                  title="Opdrachtgever factuur openen"
                                  disabled={!r.canOpenOpdrachtgeverInvoice}
                                  onClick={() => {
                                    // TODO: open opdrachtgever invoice
                                  }}
                                >
                                  <FaPrint size={16} />
                                </button>

                                <button
                                  className="p-2 text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                                  title="Herkomst factuur openen"
                                  disabled={!r.canOpenHerkomstInvoice}
                                  onClick={() => {
                                    // TODO: open herkomst invoice
                                  }}
                                >
                                  <FaPrint size={16} />
                                </button>
                              </div>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                              {r.leverancier ?? '—'}
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                              {r.werknemer ?? '—'}
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                              {fmtMoney(r.bedrag)}
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                              {fmtMoney(r.provisie)}
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap">
                              {r.uitbetaald ? (
                                <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  Ja ({fmtDate(r.datumUitbetaald)})
                                </span>
                              ) : (
                                <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                  Nee
                                </span>
                              )}
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <button
                                onClick={() => openPayout(r)}
                                className="px-3 py-2 rounded-lg text-sm bg-blue-600 text-white hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
                                title="Uitbetalen"
                              >
                                <FaMoneyBillWave size={14} />
                                Uitbetalen
                              </button>
                            </td>
                          </>
                        )}
                      </tr>
                    ))}

                  {!loading && !loadError && filteredRows.length === 0 && (
                    <tr>
                      <td colSpan={activeTab === 'facturen' ? 3 : 6} className="px-6 py-8 text-gray-500">
                        Geen resultaten.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Payout drawer */}
          {payoutOpen && payoutRow && (
            <div className="fixed inset-0 z-50">
              <div className="absolute inset-0 bg-black/30" onClick={closePayout} />
              <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl border-l border-gray-200 flex flex-col">
                <div className="p-5 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Uitbetalen</h3>
                  <button
                    onClick={closePayout}
                    className="px-3 py-1.5 rounded-lg border hover:bg-gray-50"
                  >
                    Sluiten
                  </button>
                </div>

                <div className="p-5 space-y-4 overflow-auto">
                  {/* readonly */}
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Uitvaartnummer</label>
                      <input
                        className="w-full px-3 py-2 rounded-lg border bg-gray-100 text-gray-700"
                        value={payoutRow.uitvaartNummer ?? ''}
                        readOnly
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Leverancier</label>
                      <input
                        className="w-full px-3 py-2 rounded-lg border bg-gray-100 text-gray-700"
                        value={payoutRow.leverancier ?? ''}
                        readOnly
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Bedrag</label>
                      <input
                        className="w-full px-3 py-2 rounded-lg border bg-gray-100 text-gray-700"
                        value={fmtMoney(payoutRow.bedrag)}
                        readOnly
                      />
                    </div>
                  </div>

                  {/* editable */}
                  <div className="pt-2 border-t border-gray-200 space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Provisie</label>
                      <input
                        type="number"
                        step="0.01"
                        className="w-full px-3 py-2 rounded-lg border"
                        value={payoutRow.provisie ?? 0}
                        onChange={e => setPayoutRow({ ...payoutRow, provisie: Number(e.target.value) })}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Datum uitbetaald</label>
                      <input
                        type="date"
                        className="w-full px-3 py-2 rounded-lg border"
                        value={(payoutRow.datumUitbetaald ?? '').slice(0, 10)}
                        onChange={e => setPayoutRow({ ...payoutRow, datumUitbetaald: e.target.value })}
                      />
                    </div>

                    <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-700 pt-1">
                      <input
                        type="checkbox"
                        checked={!!payoutRow.uitbetaald}
                        onChange={e => setPayoutRow({ ...payoutRow, uitbetaald: e.target.checked })}
                      />
                      Uitbetaald
                    </label>
                  </div>
                </div>

                <div className="p-5 border-t border-gray-200 flex justify-end gap-3">
                  <button
                    onClick={closePayout}
                    disabled={payoutSaving}
                    className="px-4 py-2 rounded-lg border hover:bg-gray-50"
                  >
                    Annuleren
                  </button>
                  <button
                    onClick={() => void savePayout()}
                    disabled={payoutSaving}
                    className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                  >
                    {payoutSaving ? 'Opslaan...' : 'Opslaan'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Kostenbegroting modal (admin) */}
          {invoiceOpen && invoiceDeceasedId && (
            <AdminInvoiceModal
              deceasedId={invoiceDeceasedId}
              onClose={() => {
                setInvoiceOpen(false);
                setInvoiceDeceasedId(null);
              }}
            />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminFinancial;
