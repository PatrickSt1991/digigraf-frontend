import React, { useEffect, useMemo, useState } from 'react';
import { DashboardLayout, Toggle } from '../../components';
import { Link } from 'react-router-dom';
import {
  FaUsers,
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaPhone,
  FaChartLine,
  FaArrowLeft,
  FaUser,
} from 'react-icons/fa';

import {
  InsurancePartyDto,
  CorrespondenceType,
  BillingType,
} from '../../types';

import {
  getInsuranceParties,
  createInsuranceParty,
  updateInsuranceParty,
  deleteInsuranceParty,
} from '../../api/adminApi';

type StatusFilter = 'all' | 'active' | 'inactive';

const AdminInsurance: React.FC = () => {
  const [activeTab, setActiveTab] =
    useState<'overview' | 'add' | 'edit'>('overview');

  const [selectedParty, setSelectedParty] =
    useState<InsurancePartyDto | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const [insuranceParties, setInsuranceParties] = useState<InsurancePartyDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const refresh = async () => {
    try {
      setLoadError(null);
      setLoading(true);
      const data = await getInsuranceParties();
      setInsuranceParties(data ?? []);
    } catch (e) {
      setLoadError((e as Error)?.message ?? 'Kon verzekeraars niet laden.');
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

  const partyTypeLabel = (p: InsurancePartyDto) => {
    // allow both flags, but show something nice
    if (p.isInsurance && p.isAssociation) return 'Verzekeraar + Vereniging';
    if (p.isInsurance) return 'Verzekeraar';
    if (p.isAssociation) return 'Vereniging';
    return '—';
  };

  const avatarText = (name: string) => {
    const clean = (name ?? '').trim();
    if (!clean) return '—';
    const parts = clean.split(/\s+/).filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  const secondaryLine = (p: InsurancePartyDto) => {
    // a nice, human line under the name
    if (p.correspondenceType === 'mailbox') {
      const a = (p.mailboxaddress ?? '').trim();
      const n = (p.mailboxname ?? '').trim();
      if (n && a) return `${n} • ${a}`;
      if (n) return n;
      if (a) return a;
      return 'Postbus';
    }

    // address line
    const street = (p.address ?? '').trim();
    const nr = (p.houseNumber ?? '').trim();
    const suf = (p.houseNumberSuffix ?? '').trim();
    const pc = (p.postalCode ?? '').trim();
    const city = (p.city ?? '').trim();

    const nrPart = [nr, suf].filter(Boolean).join('');
    const left = [street, nrPart].filter(Boolean).join(' ');
    const right = [pc, city].filter(Boolean).join(' ');
    return [left, right].filter(Boolean).join(' • ') || 'Adres';
  };

  const filteredParties = useMemo(() => {
    return insuranceParties.filter(p => {
      const matchesSearch = (p.name ?? '')
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && p.isActive) ||
        (statusFilter === 'inactive' && !p.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [insuranceParties, searchTerm, statusFilter]);

  /* -------------------------------------------------------------------------- */
  /*                                   FORM                                     */
  /* -------------------------------------------------------------------------- */

  const InsuranceForm = ({
    insuranceParty,
    onSave,
    onCancel,
  }: {
    insuranceParty?: InsurancePartyDto;
    onSave: (dto: InsurancePartyDto) => void;
    onCancel: () => void;
  }) => {
    const [formData, setFormData] = useState<InsurancePartyDto>(
      insuranceParty ?? {
        id: undefined,
        name: '',
        isActive: true,

        isInsurance: false,
        isAssociation: false,
        hasMembership: false,
        hasPackage: false,
        isHerkomst: false,

        correspondenceType: 'address',

        address: '',
        houseNumber: '',
        houseNumberSuffix: '',
        postalCode: '',
        city: '',
        country: '',
        phone: '',

        mailboxname: '',
        mailboxaddress: '',

        billingType: 'Opdrachtgever',
      }
    );

    // label changes based on whether this party is an insurance or association
    const thirdPartyLabel = formData.isInsurance ? 'verzekeraar' : 'vereniging';

    // keep it sane: if user turns on "Verzekeraar", likely turn off "Vereniging" (optional)
    const setInsuranceFlag = (v: boolean) => {
      setFormData(prev => ({
        ...prev,
        isInsurance: v,
        // you can choose to auto-toggle association off, comment out if you want both
        ...(v ? { isAssociation: false } : {}),
      }));
    };
    const setAssociationFlag = (v: boolean) => {
      setFormData(prev => ({
        ...prev,
        isAssociation: v,
        ...(v ? { isInsurance: false } : {}),
      }));
    };

    const handleSave = () => {
      // minimal FE validation (you can expand later)
      if (!formData.name.trim()) return;

      onSave(formData);
    };

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200 h-16 flex items-center">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            {(() => {
              const UserIcon = FaUser as unknown as React.ComponentType<{
                size?: number;
                className?: string;
              }>;
              return <UserIcon size={20} className="text-blue-600" />;
            })()}
            {insuranceParty ? 'Bewerken' : 'Nieuwe'} partij
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
                  <p className="text-xs text-gray-500 mt-1">
                    Naam is verplicht.
                  </p>
                )}
              </div>

              {/* Telefoon */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefoon
                </label>
                <input
                  type="tel"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  value={formData.phone}
                  onChange={e =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          {/* ===================== KENMERKEN ===================== */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Kenmerken
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-xl">
              <Toggle
                label="Herkomst"
                checked={!!formData.isHerkomst}
                onChange={v => setFormData({ ...formData, isHerkomst: v })}
              />

              <Toggle
                label="Verzekeraar"
                checked={!!formData.isInsurance}
                onChange={setInsuranceFlag}
              />

              <Toggle
                label="Vereniging"
                checked={!!formData.isAssociation}
                onChange={setAssociationFlag}
              />

              <Toggle
                label="Lidmaatschap"
                checked={!!formData.hasMembership}
                onChange={v => setFormData({ ...formData, hasMembership: v })}
              />

              <Toggle
                label="Pakket"
                checked={!!formData.hasPackage}
                onChange={v => setFormData({ ...formData, hasPackage: v })}
              />
            </div>

            <p className="text-sm text-gray-500 mt-3">
              Tip: kies of dit een <span className="font-medium">verzekeraar</span> of{' '}
              <span className="font-medium">vereniging</span> is. Dat beïnvloedt de facturatie-tekst.
            </p>
          </div>

          {/* ===================== CORRESPONDENTIE ===================== */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Correspondentie
            </h3>

            <div className="max-w-sm">
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={formData.correspondenceType}
                onChange={e =>
                  setFormData({
                    ...formData,
                    correspondenceType: e.target.value as CorrespondenceType,
                  })
                }
              >
                <option value="address">Adres</option>
                <option value="mailbox">Postbus</option>
              </select>
            </div>
          </div>

          {/* ===================== ADRES ===================== */}
          {formData.correspondenceType === 'address' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Adres
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <input
                    placeholder="Straat"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    value={formData.address}
                    onChange={e =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                  />
                </div>

                <div className="flex gap-2">
                  <input
                    placeholder="Nr"
                    className="w-2/3 px-3 py-2 border border-gray-300 rounded-lg"
                    value={formData.houseNumber}
                    onChange={e =>
                      setFormData({ ...formData, houseNumber: e.target.value })
                    }
                  />
                  <input
                    placeholder="Toevoeging"
                    className="w-1/3 px-3 py-2 border border-gray-300 rounded-lg"
                    value={formData.houseNumberSuffix}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        houseNumberSuffix: e.target.value,
                      })
                    }
                  />
                </div>

                <input
                  placeholder="Postcode"
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                  value={formData.postalCode}
                  onChange={e =>
                    setFormData({ ...formData, postalCode: e.target.value })
                  }
                />

                <input
                  placeholder="Plaats"
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                  value={formData.city}
                  onChange={e =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                />

                <input
                  placeholder="Land"
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                  value={formData.country}
                  onChange={e =>
                    setFormData({ ...formData, country: e.target.value })
                  }
                />
              </div>
            </div>
          )}

          {/* ===================== POSTBUS ===================== */}
          {formData.correspondenceType === 'mailbox' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Postbus
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-xl">
                <input
                  placeholder="Postbus naam"
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                  value={formData.mailboxname}
                  onChange={e =>
                    setFormData({ ...formData, mailboxname: e.target.value })
                  }
                />

                <input
                  placeholder="Postbus adres"
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                  value={formData.mailboxaddress}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      mailboxaddress: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          )}

          {/* ===================== FACTURATIE ===================== */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Facturatie
            </h3>

            <div className="max-w-md">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Factureren aan
              </label>

              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={formData.billingType}
                onChange={e =>
                  setFormData({
                    ...formData,
                    billingType: e.target.value as BillingType,
                  })
                }
              >
                <option value="Opdrachtgever">Opdrachtgever</option>

                <option value="Opdrachtgever & Derde partij">
                  Opdrachtgever & {thirdPartyLabel}
                </option>

                <option value="Derde partij">
                  {thirdPartyLabel.charAt(0).toUpperCase() +
                    thirdPartyLabel.slice(1)}
                </option>
              </select>

              <p className="text-sm text-gray-500 mt-1">
                Facturatie aan {thirdPartyLabel} wanneer van toepassing.
              </p>
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
                      const UsersIcon =
                        FaUsers as unknown as React.ComponentType<{
                          size?: number;
                          className?: string;
                        }>;
                      return <UsersIcon className="text-white" size={24} />;
                    })()}
                  </div>
                  <div className="flex flex-col justify-center">
                    <h1 className="text-2xl font-bold text-gray-900">
                      Verzekeraars & Verenigingen
                    </h1>
                    <p className="text-gray-600">
                      Beheer alle partijen en hun gegevens
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
                    setSelectedParty(null);
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
                  Nieuwe partij
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
                        placeholder="Zoek partijen..."
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
                    {filteredParties.length} partijen
                  </div>
                </div>

                {loadError && (
                  <div className="mt-4 text-sm text-red-600">
                    {loadError}
                  </div>
                )}
              </div>

              {/* Table */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Partij
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Contact
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
                        filteredParties.map(party => (
                          <tr
                            key={party.id ?? party.name}
                            className="hover:bg-gray-50 transition-colors"
                          >
                            {/* Name cell */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                                  {avatarText(party.name)}
                                </div>
                                <div>
                                  <div className="font-medium text-gray-900">
                                    {party.name}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {secondaryLine(party)}
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Type */}
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                              {partyTypeLabel(party)}
                            </td>

                            {/* Contact */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2 text-sm text-gray-900">
                                  {(() => {
                                    const PhoneIcon =
                                      FaPhone as unknown as React.ComponentType<{
                                        size?: number;
                                        className?: string;
                                      }>;
                                    return (
                                      <PhoneIcon size={12} className="text-gray-400" />
                                    );
                                  })()}
                                  {party.phone || '—'}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {party.city || party.country ? (
                                    <>
                                      {[party.city, party.country].filter(Boolean).join(', ')}
                                    </>
                                  ) : (
                                    '—'
                                  )}
                                </div>
                              </div>
                            </td>

                            {/* Status */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              {getStatusBadge(!!party.isActive)}
                            </td>

                            {/* Actions */}
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => {
                                    setSelectedParty(party);
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
                                    if (!party.id) return;
                                    await deleteInsuranceParty(party.id);
                                    await refresh();
                                  }}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Verwijderen"
                                >
                                  {(() => {
                                    const TrashIcon =
                                      FaTrash as unknown as React.ComponentType<{
                                        size?: number;
                                        className?: string;
                                      }>;
                                    return <TrashIcon size={16} />;
                                  })()}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}

                      {!loading && !loadError && filteredParties.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-6 py-8 text-gray-500">
                            Geen partijen gevonden.
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
            <InsuranceForm
              onSave={async dto => {
                // create
                await createInsuranceParty(dto);
                await refresh();
                setActiveTab('overview');
              }}
              onCancel={() => setActiveTab('overview')}
            />
          )}

          {/* EDIT */}
          {activeTab === 'edit' && selectedParty && (
            <InsuranceForm
              insuranceParty={selectedParty}
              onSave={async dto => {
                // update
                await updateInsuranceParty(dto);
                await refresh();
                setActiveTab('overview');
                setSelectedParty(null);
              }}
              onCancel={() => {
                setActiveTab('overview');
                setSelectedParty(null);
              }}
            />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminInsurance;
