import React, { useEffect, useMemo, useState } from 'react';
import { DashboardLayout, Toggle } from '../../components';
import { Link } from 'react-router-dom';

import {
  FaArrowLeft,
  FaChartLine,
  FaEdit,
  FaTrash,
  FaMapMarkerAlt,
  FaPlus,
  FaSearch,
  FaTruck,
} from 'react-icons/fa';

import { getSuppliers, createSupplier, updateSupplier } from '../../api/adminApi';
import { SupplierTypeDto, SupplierDto } from '../../types';
type StatusFilter = 'all' | 'active' | 'inactive';

// Keep these in sync with backend enum names
const SUPPLIER_TYPE_OPTIONS: SupplierTypeDto[] = [
  { code: 'Kisten', label: 'Kisten' },
  { code: 'UrnAndGedenksieraden', label: 'Urn & Gedenksieraden' },
  { code: 'Bloemen', label: 'Bloemen' },
  { code: 'Steenhouwer', label: 'Steenhouwer' },
  { code: 'Overig', label: 'Overig' },
];

const AdminSuppliers: React.FC = () => {
  const [activeTab, setActiveTab] =
    useState<'overview' | 'add' | 'edit'>('overview');

  const [selectedSupplier, setSelectedSupplier] =
    useState<SupplierDto | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const [suppliers, setSuppliers] = useState<SupplierDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const refresh = async () => {
    try {
      setLoadError(null);
      setLoading(true);
      const data = await getSuppliers();
      setSuppliers(data ?? []);
    } catch (e) {
      setLoadError((e as Error)?.message ?? 'Kon leveranciers niet laden.');
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

  const avatarText = (name: string) => {
    const clean = (name ?? '').trim();
    if (!clean) return '—';
    const parts = clean.split(/\s+/).filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  const secondaryLine = (s: SupplierDto) => {
    if (s.address) {
      const street = (s.address.street ?? '').trim();
      const nr = (s.address.houseNumber ?? '').trim();
      const suf = (s.address.suffix ?? '').trim();
      const pc = (s.address.zipCode ?? '').trim();
      const city = (s.address.city ?? '').trim();

      const nrPart = [nr, suf].filter(Boolean).join('');
      const left = [street, nrPart].filter(Boolean).join(' ');
      const right = [pc, city].filter(Boolean).join(' ');
      return [left, right].filter(Boolean).join(' • ') || 'Adres';
    }

    if (s.postbox) {
      const a = (s.postbox.address ?? '').trim();
      const pc = (s.postbox.zipCode ?? '').trim();
      const city = (s.postbox.city ?? '').trim();
      const right = [pc, city].filter(Boolean).join(' ');
      return [a || 'Postbus', right].filter(Boolean).join(' • ');
    }

    return '—';
  };

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter(s => {
      const matchesSearch = (s.name ?? '')
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && s.isActive) ||
        (statusFilter === 'inactive' && !s.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [suppliers, searchTerm, statusFilter]);

  /* -------------------------------------------------------------------------- */
  /*                                   FORM                                     */
  /* -------------------------------------------------------------------------- */

  const SupplierForm = ({
    supplier,
    onSave,
    onCancel,
  }: {
    supplier?: SupplierDto;
    onSave: (dto: SupplierDto) => void;
    onCancel: () => void;
  }) => {
    const [formData, setFormData] = useState<SupplierDto>(
      supplier ?? {
        id: undefined,
        name: '',
        description: '',
        type: SUPPLIER_TYPE_OPTIONS[0],
        address: null,
        postbox: null,
        isActive: true,
      }
    );

    const hasAddress = !!formData.address;
    const hasPostbox = !!formData.postbox;

    const setTypeCode = (code: string) => {
      const option =
        SUPPLIER_TYPE_OPTIONS.find(o => o.code === code) ??
        SUPPLIER_TYPE_OPTIONS[0];
      setFormData(prev => ({
        ...prev,
        type: { code: option.code, label: option.label },
      }));
    };

    const handleSave = () => {
      if (!formData.name.trim()) return;
      if (!formData.type?.code) return;

      const cleaned: SupplierDto = {
        ...formData,
        description: (formData.description ?? '').trim() || null,
        address:
          formData.address &&
          [
            formData.address.street,
            formData.address.houseNumber,
            formData.address.zipCode,
            formData.address.city,
          ].some(v => (v ?? '').toString().trim())
            ? {
                street: (formData.address.street ?? '').trim(),
                houseNumber: (formData.address.houseNumber ?? '').trim(),
                suffix: (formData.address.suffix ?? '').trim() || null,
                zipCode: (formData.address.zipCode ?? '').trim(),
                city: (formData.address.city ?? '').trim(),
              }
            : null,
        postbox:
          formData.postbox &&
          [
            formData.postbox.address,
            formData.postbox.zipCode,
            formData.postbox.city,
          ].some(v => (v ?? '').toString().trim())
            ? {
                address: (formData.postbox.address ?? '').trim(),
                zipCode: (formData.postbox.zipCode ?? '').trim(),
                city: (formData.postbox.city ?? '').trim(),
              }
            : null,
      };

      onSave(cleaned);
    };

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200 h-16 flex items-center">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            {(() => {
              const TruckIcon = FaTruck as unknown as React.ComponentType<{
                size?: number;
                className?: string;
              }>;
              return <TruckIcon size={20} className="text-blue-600" />;
            })()}
            {supplier ? 'Bewerken' : 'Nieuwe'} leverancier
          </h2>
        </div>

        <div className="p-6 space-y-8">
          {/* ===================== BASIS ===================== */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Basisgegevens
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

              {/* Naam */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Naam *
                </label>
                <input
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  value={formData.name}
                  onChange={e =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
                {!formData.name.trim() && (
                  <p className="text-xs text-gray-500 mt-1">Naam is verplicht.</p>
                )}
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type *
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={formData.type?.code ?? SUPPLIER_TYPE_OPTIONS[0].code}
                  onChange={e => setTypeCode(e.target.value)}
                >
                  {SUPPLIER_TYPE_OPTIONS.map(o => (
                    <option key={o.code} value={o.code}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Omschrijving
              </label>
              <input
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                value={formData.description ?? ''}
                onChange={e =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>
          </div>

          {/* ===================== CONTACT ===================== */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Contactgegevens
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-xl">
              <Toggle
                label="Adres"
                checked={hasAddress}
                onChange={v =>
                  setFormData(prev => ({
                    ...prev,
                    address: v
                      ? prev.address ?? {
                          street: '',
                          houseNumber: '',
                          suffix: null,
                          zipCode: '',
                          city: '',
                        }
                      : null,
                  }))
                }
              />

              <Toggle
                label="Postbus"
                checked={hasPostbox}
                onChange={v =>
                  setFormData(prev => ({
                    ...prev,
                    postbox: v
                      ? prev.postbox ?? { address: '', zipCode: '', city: '' }
                      : null,
                  }))
                }
              />
            </div>
          </div>

          {/* ===================== ADRES ===================== */}
          {hasAddress && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Adres</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <input
                    placeholder="Straat"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    value={formData.address?.street ?? ''}
                    onChange={e =>
                      setFormData(prev => ({
                        ...prev,
                        address: {
                          ...(prev.address ?? {
                            street: '',
                            houseNumber: '',
                            suffix: null,
                            zipCode: '',
                            city: '',
                          }),
                          street: e.target.value,
                        },
                      }))
                    }
                  />
                </div>

                <div className="flex gap-2">
                  <input
                    placeholder="Nr"
                    className="w-2/3 px-3 py-2 border border-gray-300 rounded-lg"
                    value={formData.address?.houseNumber ?? ''}
                    onChange={e =>
                      setFormData(prev => ({
                        ...prev,
                        address: {
                          ...(prev.address ?? {
                            street: '',
                            houseNumber: '',
                            suffix: null,
                            zipCode: '',
                            city: '',
                          }),
                          houseNumber: e.target.value,
                        },
                      }))
                    }
                  />
                  <input
                    placeholder="Toevoeging"
                    className="w-1/3 px-3 py-2 border border-gray-300 rounded-lg"
                    value={formData.address?.suffix ?? ''}
                    onChange={e =>
                      setFormData(prev => ({
                        ...prev,
                        address: {
                          ...(prev.address ?? {
                            street: '',
                            houseNumber: '',
                            suffix: null,
                            zipCode: '',
                            city: '',
                          }),
                          suffix: e.target.value,
                        },
                      }))
                    }
                  />
                </div>

                <input
                  placeholder="Postcode"
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                  value={formData.address?.zipCode ?? ''}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      address: {
                        ...(prev.address ?? {
                          street: '',
                          houseNumber: '',
                          suffix: null,
                          zipCode: '',
                          city: '',
                        }),
                        zipCode: e.target.value,
                      },
                    }))
                  }
                />

                <input
                  placeholder="Plaats"
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                  value={formData.address?.city ?? ''}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      address: {
                        ...(prev.address ?? {
                          street: '',
                          houseNumber: '',
                          suffix: null,
                          zipCode: '',
                          city: '',
                        }),
                        city: e.target.value,
                      },
                    }))
                  }
                />
              </div>
            </div>
          )}

          {/* ===================== POSTBUS ===================== */}
          {hasPostbox && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Postbus</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl">
                <input
                  placeholder="Postbus adres"
                  className="px-3 py-2 border border-gray-300 rounded-lg md:col-span-2"
                  value={formData.postbox?.address ?? ''}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      postbox: {
                        ...(prev.postbox ?? { address: '', zipCode: '', city: '' }),
                        address: e.target.value,
                      },
                    }))
                  }
                />

                <input
                  placeholder="Postcode"
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                  value={formData.postbox?.zipCode ?? ''}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      postbox: {
                        ...(prev.postbox ?? { address: '', zipCode: '', city: '' }),
                        zipCode: e.target.value,
                      },
                    }))
                  }
                />

                <input
                  placeholder="Plaats"
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                  value={formData.postbox?.city ?? ''}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      postbox: {
                        ...(prev.postbox ?? { address: '', zipCode: '', city: '' }),
                        city: e.target.value,
                      },
                    }))
                  }
                />
              </div>
            </div>
          )}

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
              disabled={!formData.name.trim()}
              className={`px-6 py-2 rounded-lg text-white ${
                formData.name.trim()
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
                      const TruckIcon =
                        FaTruck as unknown as React.ComponentType<{
                          size?: number;
                          className?: string;
                        }>;
                      return <TruckIcon className="text-white" size={24} />;
                    })()}
                  </div>
                  <div className="flex flex-col justify-center">
                    <h1 className="text-2xl font-bold text-gray-900">
                      Leveranciers
                    </h1>
                    <p className="text-gray-600">
                      Beheer alle leveranciers en hun gegevens
                    </p>
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
                    setSelectedSupplier(null);
                    setActiveTab('add');
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
                >
                  {(() => {
                    const PlusIcon =
                      FaPlus as unknown as React.ComponentType<{
                        size?: number;
                        className?: string;
                      }>;
                    return <PlusIcon size={16} />;
                  })()}
                  Nieuwe leverancier
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
                        placeholder="Zoek leveranciers..."
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
                    {filteredSuppliers.length} leveranciers
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
                          Leverancier
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Locatie
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
                          <td colSpan={5} className="px-6 py-8 text-gray-500">
                            Laden...
                          </td>
                        </tr>
                      )}

                      {!loading &&
                        filteredSuppliers.map(s => (
                          <tr
                            key={s.id ?? s.name}
                            className="hover:bg-gray-50 transition-colors"
                          >
                            {/* Name cell */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                                  {avatarText(s.name)}
                                </div>
                                <div>
                                  <div className="font-medium text-gray-900">{s.name}</div>
                                  <div className="text-sm text-gray-500">
                                    {s.description?.trim() ? s.description : '—'}
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Type */}
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                              {s.type?.label ?? s.type?.code ?? '—'}
                            </td>

                            {/* Location */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2 text-sm text-gray-700">
                                {(() => {
                                  const PinIcon =
                                    FaMapMarkerAlt as unknown as React.ComponentType<{
                                      size?: number;
                                      className?: string;
                                    }>;
                                  return <PinIcon size={12} className="text-gray-400" />;
                                })()}
                                {secondaryLine(s)}
                              </div>
                            </td>

                            {/* Status */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              {getStatusBadge(!!s.isActive)}
                            </td>

                            {/* Actions */}
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => {
                                    setSelectedSupplier(s);
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
                                    if (!s.id) return;
                                    await updateSupplier({ ...s, isActive: !s.isActive });
                                    await refresh();
                                  }}
                                  className={`p-2 rounded-lg transition-colors ${
                                    s.isActive
                                      ? 'text-red-600 hover:bg-red-50'
                                      : 'text-blue-700 hover:bg-blue-50'
                                  }`}
                                  title={s.isActive ? 'Deactiveren' : 'Activeren'}
                                >
                                  {(() => {
                                    const Icon =
                                      (s.isActive ? FaTrash : FaPlus) as unknown as React.ComponentType<{
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

                      {!loading && !loadError && filteredSuppliers.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-6 py-8 text-gray-500">
                            Geen leveranciers gevonden.
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
            <SupplierForm
              onSave={async dto => {
                await createSupplier(dto);
                await refresh();
                setActiveTab('overview');
              }}
              onCancel={() => setActiveTab('overview')}
            />
          )}

          {/* EDIT */}
          {activeTab === 'edit' && selectedSupplier && (
            <SupplierForm
              supplier={selectedSupplier}
              onSave={async dto => {
                await updateSupplier(dto);
                await refresh();
                setActiveTab('overview');
                setSelectedSupplier(null);
              }}
              onCancel={() => {
                setActiveTab('overview');
                setSelectedSupplier(null);
              }}
            />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminSuppliers;
