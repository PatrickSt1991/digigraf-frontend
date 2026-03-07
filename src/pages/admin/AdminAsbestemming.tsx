import React, { useEffect, useMemo, useState } from 'react';
import { DashboardLayout } from '../../components';
import { Link } from 'react-router-dom';

import {
  FaArrowLeft,
  FaChartLine,
  FaEdit,
  FaTrash,
  FaPlus,
  FaSearch,
  FaExclamationTriangle,
  FaBox,
} from 'react-icons/fa';

import { getAsbestemmingen, createAsbestemming, updateAsbestemming } from '../../api/adminApi';
import { AsbestemmingDto } from '../../types';

type StatusFilter = 'all' | 'active' | 'inactive';

const AdminAsbestemming: React.FC = () => {
  const [activeTab, setActiveTab] =
    useState<'overview' | 'add' | 'edit'>('overview');

  const [selected, setSelected] = useState<AsbestemmingDto | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const [items, setItems] = useState<AsbestemmingDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const refresh = async () => {
    try {
      setLoadError(null);
      setLoading(true);
      const data = await getAsbestemmingen();
      setItems(data ?? []);
    } catch (e) {
      setLoadError((e as Error)?.message ?? 'Kon asbestemmingen niet laden.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const getStatusBadge = (isActive: boolean) => {
    if (isActive) {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 flex items-center gap-2 w-fit">
          <span className="w-2 h-2 bg-green-500 rounded-full" />
          Actief
        </span>
      );
    }
    return (
      <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 flex items-center gap-2 w-fit">
        <span className="w-2 h-2 bg-yellow-500 rounded-full" />
        Inactief
      </span>
    );
  };

  const filtered = useMemo(() => {
    return items.filter(x => {
      const matchesSearch = (x.description ?? '')
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && x.isActive) ||
        (statusFilter === 'inactive' && !x.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [items, searchTerm, statusFilter]);

  /* -------------------------------------------------------------------------- */
  /*                                   FORM                                     */
  /* -------------------------------------------------------------------------- */

  const AsbestemmingForm = ({
    item,
    onSave,
    onCancel,
  }: {
    item?: AsbestemmingDto;
    onSave: (dto: AsbestemmingDto) => void;
    onCancel: () => void;
  }) => {
    const [formData, setFormData] = useState<AsbestemmingDto>(
      item ?? {
        id: undefined,
        description: '',
        isActive: true,
      }
    );

    const handleSave = () => {
      if (!formData.description.trim()) return;

      const cleaned: AsbestemmingDto = {
        ...formData,
        description: formData.description.trim(),
      };

      onSave(cleaned);
    };

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200 h-16 flex items-center">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            {(() => {
              const Icon = FaBox as unknown as React.ComponentType<{
                size?: number;
                className?: string;
              }>;
              return <Icon size={20} className="text-blue-600" />;
            })()}
            {item ? 'Bewerken' : 'Nieuwe'} asbestemming
          </h2>
        </div>

        <div className="p-6 space-y-8">
          {/* ===================== BASIS ===================== */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Basisgegevens</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={formData.isActive ? 'active' : 'inactive'}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      isActive: e.target.value === 'active',
                    })
                  }
                >
                  <option value="active">Actief</option>
                  <option value="inactive">Inactief</option>
                </select>
              </div>

              {/* Omschrijving */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Omschrijving *
                </label>
                <input
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  value={formData.description}
                  onChange={e =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
                {!formData.description.trim() && (
                  <p className="text-xs text-gray-500 mt-1">Omschrijving is verplicht.</p>
                )}
              </div>
            </div>
          </div>

          {/* ===================== ACTIES ===================== */}
          <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Annuleren
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={!formData.description.trim()}
              className={`px-6 py-2 rounded-lg text-white ${
                formData.description.trim()
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-blue-300 cursor-not-allowed'
              }`}
            >
              Opslaan
            </button>
          </div>
        </div>
      </div>
    );
  };

  /* -------------------------------------------------------------------------- */
  /*                                    RENDER                                  */
  /* -------------------------------------------------------------------------- */

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-10">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-4 h-full">
                {/* Back Button */}
                <Link
                  to="/admin"
                  className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Terug naar dashboard"
                >
                  {(() => {
                    const ArrowIcon =
                      FaArrowLeft as unknown as React.ComponentType<{
                        size?: number;
                        className?: string;
                      }>;
                    return <ArrowIcon size={16} />;
                  })()}
                </Link>

                <div className="flex items-center gap-3 h-full">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                    {(() => {
                      const Icon =
                        FaBox as unknown as React.ComponentType<{
                          size?: number;
                          className?: string;
                        }>;
                      return <Icon className="text-white" size={22} />;
                    })()}
                  </div>
                  <div className="flex flex-col justify-center">
                    <h1 className="text-2xl font-bold text-gray-900">Asbestemming</h1>
                    <p className="text-gray-600">Beheer asbestemmingen</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 h-full items-center">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    activeTab === 'overview'
                      ? 'bg-blue-100 text-blue-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Overzicht
                </button>

                <button
                  onClick={() => {
                    setSelected(null);
                    setActiveTab('add');
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
                >
                  {(() => {
                    const PlusIcon =
                      FaPlus as unknown as React.ComponentType<{
                        size?: number;
                        className?: string;
                      }>;
                    return <PlusIcon size={16} />;
                  })()}
                  Nieuwe asbestemming
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          {activeTab === 'overview' && (
            <>
              {/* Filters */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                  <div className="flex flex-col sm:flex-row gap-4 flex-1">
                    <div className="relative flex-1 max-w-md">
                      {(() => {
                        const SearchIcon =
                          FaSearch as unknown as React.ComponentType<{
                            size?: number;
                            className?: string;
                          }>;
                        return (
                          <SearchIcon
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                            size={16}
                          />
                        );
                      })()}

                      <input
                        type="text"
                        placeholder="Zoek asbestemmingen..."
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
                      <option value="active">Actief</option>
                      <option value="inactive">Inactief</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    {(() => {
                      const ChartIcon =
                        FaChartLine as unknown as React.ComponentType<{
                          size?: number;
                          className?: string;
                        }>;
                      return <ChartIcon size={16} />;
                    })()}
                    {filtered.length} asbestemmingen
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
                          Asbestemming
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Acties
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-200">
                      {loading && (
                        <tr>
                          <td colSpan={3} className="px-6 py-8 text-gray-500">
                            Laden...
                          </td>
                        </tr>
                      )}

                      {!loading &&
                        filtered.map(a => (
                          <tr
                            key={a.id ?? a.description}
                            className="hover:bg-gray-50 transition-colors"
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="font-medium text-gray-900">
                                {a.description?.trim() ? a.description : '—'}
                              </div>
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap">
                              {getStatusBadge(!!a.isActive)}
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => {
                                    setSelected(a);
                                    setActiveTab('edit');
                                  }}
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="Bewerken"
                                >
                                  {(() => {
                                    const EditIcon =
                                      FaEdit as unknown as React.ComponentType<{
                                        size?: number;
                                        className?: string;
                                      }>;
                                    return <EditIcon size={16} />;
                                  })()}
                                </button>

                                <button
                                  onClick={async () => {
                                    if (!a.id) return;
                                    await updateAsbestemming({ ...a, isActive: !a.isActive });
                                    await refresh();
                                  }}
                                  className={`p-2 rounded-lg transition-colors ${
                                    a.isActive
                                      ? 'text-red-600 hover:bg-red-50'
                                      : 'text-green-700 hover:bg-green-50'
                                  }`}
                                  title={a.isActive ? 'Deactiveren' : 'Activeren'}
                                >
                                  {(() => {
                                    const Icon =
                                      (a.isActive ? FaTrash : FaPlus) as unknown as React.ComponentType<{
                                        size?: number;
                                        className?: string;
                                      }>;
                                    return <Icon size={16} />;
                                  })()}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}

                      {!loading && !loadError && filtered.length === 0 && (
                        <tr>
                          <td colSpan={3} className="px-6 py-8 text-gray-500">
                            Geen asbestemmingen gevonden.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* ADD */}
          {activeTab === 'add' && (
            <AsbestemmingForm
              onSave={async dto => {
                await createAsbestemming(dto);
                await refresh();
                setActiveTab('overview');
              }}
              onCancel={() => setActiveTab('overview')}
            />
          )}

          {/* EDIT */}
          {activeTab === 'edit' && selected && (
            <AsbestemmingForm
              item={selected}
              onSave={async dto => {
                await updateAsbestemming(dto);
                await refresh();
                setActiveTab('overview');
                setSelected(null);
              }}
              onCancel={() => {
                setActiveTab('overview');
                setSelected(null);
              }}
            />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminAsbestemming;
