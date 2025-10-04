import React, { useState } from 'react';
import { DashboardLayout } from "../../components";
import { Link } from 'react-router-dom';
import { FaUsers, FaPlus, FaEdit, FaTrash, FaSearch, FaEnvelope, FaPhone, FaUser, FaChartLine, FaArrowLeft, FaTachometerAlt } from 'react-icons/fa';
import { InsuranceCompany } from '../../types';

const EmployeeManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'add' | 'edit'>('overview');
  const [selectedInsurance, setSelectedInsurance] = useState<InsuranceCompany | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'deactivated'>('all');

  const [insuranceCompanies, setInsuranceCompanies] = useState<InsuranceCompany[]>([
    {
        id: '1',
        status: 'active',
        name: 'Zorgverzekeraar A',
        herkomst: true,
        insurance: true,
        membership: true,
        package: false,
        correspondanceType: 'address',
        address: 'Straatnaam 1',
        houseNumber: '1',
        postalCode: '1234 AB',
        city: 'Amsterdam',
        country: 'Nederland',
        phone: '020-1234567',
        billingAddress: true,
        billingType: 'Opdrachtgever'
    },
    {
        id: '2',
        status: 'inactive',
        name: 'Zorgverzekeraar B',
        herkomst: false,
        insurance: true,
        membership: false,
        package: true,
        correspondanceType: 'mailbox',
        mailboxname: 'Postbus 123',
        mailboxaddress: '1234 AB Amsterdam',
        country: 'Nederland',
        phone: '010-7654321',
        billingAddress: false,
        billingType: 'Vereniging'
    }
  ]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            Actief
          </span>
        );
      case 'inactive':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 flex items-center gap-1">
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            Inactief
          </span>
        );
      case 'deactivated':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 flex items-center gap-1">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            Gedeactiveerd
          </span>
        );
      default:
        return null;
    }
  };

  const filteredIsuranceCompanies = insuranceCompanies.filter(ico => {
    const matchesSearch = ico.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ico.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const InsuranceForm = ({ insuranceCompany, onSave, onCancel }: { 
    insuranceCompany?: InsuranceCompany;
    onSave: (emp: InsuranceCompany) => void; 
    onCancel: () => void; 
  }) => {
  const [formData, setFormData] = useState<Partial<InsuranceCompany>>(insuranceCompany || {
    status: 'active',
    name: '',
    herkomst: false,
    insurance: false,
    membership: false,
    package: false,
    correspondanceType: 'address', // default choice
    address: '',
    houseNumber: '',
    houseNumberSuffix: '',
    postalCode: '',
    city: '',
    country: '',
    phone: '',
    mailboxname: '',
    mailboxaddress: '',
    billingAddress: false,
    billingType: 'Opdrachtgever',
  });

    const handleSave = () => {
      const insuranceCompanyId = insuranceCompany?.id || Date.now().toString();
      
      const fullInsuranceCompany: InsuranceCompany = {
        id: insuranceCompanyId,
        name: formData.name || '',
        status: formData.status || 'active',
        herkomst: formData.herkomst || false,
        insurance: formData.insurance || false,
        membership: formData.membership || false,
        package: formData.package || false,
        correspondanceType: formData.correspondanceType || 'address',
        address: formData.address || '',
        houseNumber: formData.houseNumber || '',
        houseNumberSuffix: formData.houseNumberSuffix || '',
        postalCode: formData.postalCode || '',
        city: formData.city || '',
        country: formData.country || '',
        phone: formData.phone || '',
        mailboxname: formData.mailboxname || '',
        mailboxaddress: formData.mailboxaddress || '',
        billingAddress: formData.billingAddress || false,
        billingType: formData.billingType || 'Opdrachtgever',
      };
      onSave(fullInsuranceCompany);
    };

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200 h-16 flex items-center">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            {(() => {
              const UserIcon = FaUser as unknown as React.ComponentType<{ size?: number; className?: string }>;
              return <UserIcon size={20} className="text-blue-600" />;
            })()}
            {insuranceCompany ? 'Verzekeraar Bewerken' : 'Nieuwe Verzekeraar'}
          </h2>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="md:col-span-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4 pb-2 border-b border-gray-200 h-12 flex items-center">
                Persoonlijke Gegevens
              </h3>
            </div>
            
            {/* Status Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              >
                <option value="active">Actief</option>
                <option value="inactive">Inactief</option>
                <option value="deactivated">Gedeactiveerd</option>
              </select>
            </div>

            {/* Name Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Naam</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="J.D."
              />
            </div>

            {/* Herkomst Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Herkomst *</label>
                <input
                  type="checkbox"
                  id="herkomst"
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  checked={!!formData.herkomst}
                  onChange={(e) =>
                    setFormData({ ...formData, herkomst: e.target.checked })
                  }
                />
            </div>

            {/* Verzekeraar (Insurance) Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Verzekeraar</label>
              <input
                type="checkbox"
                id="insurance"
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                checked={!!formData.insurance}
                onChange={(e) =>
                  setFormData({ ...formData, insurance: e.target.checked })
                }
              />
            </div>

            {/* Lidmaatschap (Membership) Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lidmaatschap *</label>
              <input
                type="checkbox"
                id="membership"
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                checked={!!formData.membership}
                onChange={(e) =>
                  setFormData({ ...formData, membership: e.target.checked })
                }
              />
            </div>

            {/* Package Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pakket</label>
              <input
                type="checkbox"
                id="package"
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                checked={!!formData.package}
                onChange={(e) =>
                  setFormData({ ...formData, package: e.target.checked })
                }
              />
            </div>

            {/* CorrespondanceType Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Correspondentie</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.correspondanceType}
                onChange={(e) => setFormData({ ...formData, correspondanceType: e.target.value as any })}
              >
                <option value="mailbox">Postbus</option>
                <option value="address">Adres</option>
              </select>
            </div>

            {/* address Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Adres *</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                required
              />
            </div>

            {/* Huisnummer */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Huisnummer</label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.houseNumber}
                onChange={(e) => setFormData({ ...formData, houseNumber: e.target.value })}
              />
            </div>

            {/* Toevoeging Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Toevoeging</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.houseNumberSuffix}
                onChange={(e) => setFormData({ ...formData, houseNumberSuffix: e.target.value })}
              />
            </div>

            {/* PostalCode Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Postcode</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.postalCode}
                onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
              />
            </div>

            {/* City Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Plaats</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
            </div>

            {/* Country Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Land</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              />
            </div>

            {/* Phone Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telefoon</label>
              <input
                type="phone"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            {/* Mailbox Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Postbus naam</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.mailboxname}
                onChange={(e) => setFormData({ ...formData, mailboxname: e.target.value })}
              />
            </div>

            {/* Mailbox address Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Postbus adres</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.mailboxaddress}
                onChange={(e) => setFormData({ ...formData, mailboxaddress: e.target.value })}
              />
            </div>

            {/* Billing address Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Factuur address</label>
              <input
                type="checkbox"
                id="package"
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                checked={!!formData.billingAddress}
                onChange={(e) =>
                  setFormData({ ...formData, billingAddress: e.target.checked })
                }
              />
            </div>

            {/* BillingType Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rekening naar</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.billingType}
                onChange={(e) => setFormData({ ...formData, billingType: e.target.value as any })}
              >
                <option value="opdrachtgever">Opdrachtgever</option>
                <option value="opdracht-vereniging">Opdrachtgeven & Vereniging</option>
                <option value="vereniging">Vereniging</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annuleren
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all"
            >
              {insuranceCompany ? 'Bijwerken' : 'Toevoegen'}
            </button>
          </div>
        </div>
      </div>
    );
  };

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
                  const ArrowIcon = FaArrowLeft as unknown as React.ComponentType<{ size?: number; className?: string }>;
                  return <ArrowIcon size={16} />;
                })()}
                {(() => {
                  const DashIcon = FaTachometerAlt as unknown as React.ComponentType<{ size?: number; className?: string }>;
                  return <DashIcon size={16} />;
                })()}
              </Link>
              
              <div className="flex items-center gap-3 h-full">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  {(() => {
                    const UsersIcon = FaUsers as unknown as React.ComponentType<{ size?: number; className?: string }>;
                    return <UsersIcon className="text-white" size={24} />;
                  })()}
                </div>
                <div className="flex flex-col justify-center">
                  <h1 className="text-2xl font-bold text-gray-900">Werknemers Beheer</h1>
                  <p className="text-gray-600">Beheer alle werknemers en hun gegevens</p>
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
                onClick={() => setActiveTab('add')}
                className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
              >
                {(() => {
                  const PlusIcon = FaPlus as unknown as React.ComponentType<{ size?: number; className?: string }>;
                  return <PlusIcon size={16} />;
                })()}
                Nieuwe Werknemer
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'overview' && (
          <>
            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between h-16">
                <div className="flex flex-col sm:flex-row gap-4 flex-1">
                  <div className="relative flex-1 max-w-md">
                    {(() => {
                      const SearchIcon = FaSearch as unknown as React.ComponentType<{ size?: number; className?: string }>;
                      return <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />;
                    })()}
                    <input
                      type="text"
                      placeholder="Zoek werknemers..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <select
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                  >
                    <option value="all">Alle statussen</option>
                    <option value="active">Actief</option>
                    <option value="inactive">Inactief</option>
                    <option value="deactivated">Gedeactiveerd</option>
                  </select>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  {(() => {
                    const ChartIcon = FaChartLine as unknown as React.ComponentType<{ size?: number; className?: string }>;
                    return <ChartIcon size={16} />;
                  })()}
                  {filteredIsuranceCompanies.length} werknemers
                </div>
              </div>
            </div>

            {/* Employee Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Werknemer</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Functie</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Acties</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredIsuranceCompanies.map((company) => (
                      <tr key={company.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                              {company.name}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{company.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm text-gray-900">
                              {(() => {
                                const EmailIcon = FaEnvelope as unknown as React.ComponentType<{ size?: number; className?: string }>;
                                return <EmailIcon size={12} className="text-gray-400" />;
                              })()}
                              {company.email}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              {(() => {
                                const PhoneIcon = FaPhone as unknown as React.ComponentType<{ size?: number; className?: string }>;
                                return <PhoneIcon size={12} className="text-gray-400" />;
                              })()}
                              {company.phone}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(company.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => {
                                setSelectedInsurance(company);
                                setActiveTab('edit');
                              }}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Bewerken"
                            >
                              {(() => {
                                const EditIcon = FaEdit as unknown as React.ComponentType<{ size?: number; className?: string }>;
                                return <EditIcon size={16} />;
                              })()}
                            </button>
                            <button
                              onClick={() => {
                                setInsuranceCompanies(insuranceCompanies.filter(ic => ic.id !== company.id));
                              }}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Verwijderen"
                            >
                              {(() => {
                                const TrashIcon = FaTrash as unknown as React.ComponentType<{ size?: number; className?: string }>;
                                return <TrashIcon size={16} />;
                              })()}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {activeTab === 'add' && (
          <InsuranceForm
            onSave={(newInsuranceCompany) => {
              setInsuranceCompanies([...insuranceCompanies, newInsuranceCompany]);
              setActiveTab('overview');
            }}
            onCancel={() => setActiveTab('overview')}
          />
        )}

        {activeTab === 'edit' && selectedInsurance && (
          <InsuranceForm
            insuranceCompany={selectedInsurance}
            onSave={(updatedInsuranceCompany) => {
              setInsuranceCompanies(insuranceCompanies.map(ic => 
                ic.id === updatedInsuranceCompany.id ? updatedInsuranceCompany : ic
              ));
              setActiveTab('overview');
              setSelectedInsurance(null);
            }}
            onCancel={() => {
              setActiveTab('overview');
              setSelectedInsurance(null);
            }}
          />
        )}
      </div>
    </div>
    </DashboardLayout>
  );
};

export default EmployeeManagement;