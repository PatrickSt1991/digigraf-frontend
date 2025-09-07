import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaUsers, FaPlus, FaEdit, FaTrash, FaSearch, FaEnvelope, FaPhone, FaUser, FaChartLine, FaArrowLeft, FaTachometerAlt } from 'react-icons/fa';

interface Employee {
  id: string;
  status: 'active' | 'inactive' | 'deactivated';
  initials: string;
  firstName: string;
  lastName: string;
  tussenvoegsel: string;
  fullName: string;
  birthPlace: string;
  birthDate: string;
  email: string;
  mobile: string;
  role: string;
  department: string;
  startDate: string;
  avatar?: string;
}

const EmployeeManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'add' | 'edit'>('overview');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'deactivated'>('all');

  const [employees, setEmployees] = useState<Employee[]>([
    {
      id: '1',
      status: 'active',
      initials: 'J.D.',
      firstName: 'Jan',
      lastName: 'Doe',
      tussenvoegsel: 'de',
      fullName: 'Jan de Doe',
      birthPlace: 'Amsterdam',
      birthDate: '1985-05-15',
      email: 'j.doe@company.nl',
      mobile: '06-12345678',
      role: 'Uitvaartbegeleider',
      department: 'Begeleiding',
      startDate: '2020-01-15'
    },
    {
      id: '2',
      status: 'inactive',
      initials: 'M.S.',
      firstName: 'Maria',
      lastName: 'Smith',
      tussenvoegsel: 'van',
      fullName: 'Maria van Smith',
      birthPlace: 'Rotterdam',
      birthDate: '1982-08-22',
      email: 'm.smith@company.nl',
      mobile: '06-87654321',
      role: 'Administratief',
      department: 'Administratie',
      startDate: '2019-03-01'
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

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         emp.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || emp.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const EmployeeForm = ({ employee, onSave, onCancel }: { 
    employee?: Employee; 
    onSave: (emp: Employee) => void; 
    onCancel: () => void; 
  }) => {
    const [formData, setFormData] = useState<Partial<Employee>>(employee || {
      status: 'active',
      initials: '',
      firstName: '',
      lastName: '',
      tussenvoegsel: '',
      birthPlace: '',
      birthDate: '',
      email: '',
      mobile: '',
      role: '',
      department: '',
      startDate: new Date().toISOString().split('T')[0]
    });

    const handleSave = () => {
      const employeeId = employee?.id || Date.now().toString();
      const employeeFullName = `${formData.firstName} ${formData.tussenvoegsel || ''} ${formData.lastName}`.trim();
      
      const fullEmployee: Employee = {
        id: employeeId,
        fullName: employeeFullName,
        status: formData.status || 'active',
        initials: formData.initials || '',
        firstName: formData.firstName || '',
        lastName: formData.lastName || '',
        tussenvoegsel: formData.tussenvoegsel || '',
        birthPlace: formData.birthPlace || '',
        birthDate: formData.birthDate || '',
        email: formData.email || '',
        mobile: formData.mobile || '',
        role: formData.role || '',
        department: formData.department || '',
        startDate: formData.startDate || ''
      };
      onSave(fullEmployee);
    };

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200 h-16 flex items-center">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            {(() => {
              const UserIcon = FaUser as unknown as React.ComponentType<{ size?: number; className?: string }>;
              return <UserIcon size={20} className="text-blue-600" />;
            })()}
            {employee ? 'Werknemer Bewerken' : 'Nieuwe Werknemer'}
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

            {/* Initials Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Initialen</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.initials}
                onChange={(e) => setFormData({ ...formData, initials: e.target.value })}
                placeholder="J.D."
              />
            </div>

            {/* First Name Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Voornaam *</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                placeholder="Jan"
                required
              />
            </div>

            {/* Tussenvoegsel Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tussenvoegsel</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.tussenvoegsel}
                onChange={(e) => setFormData({ ...formData, tussenvoegsel: e.target.value })}
                placeholder="de, van, van der"
              />
            </div>

            {/* Last Name Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Achternaam *</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                placeholder="Doe"
                required
              />
            </div>

            {/* Birth Place Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Geboorteplaats</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.birthPlace}
                onChange={(e) => setFormData({ ...formData, birthPlace: e.target.value })}
                placeholder="Amsterdam"
              />
            </div>

            {/* Birth Date Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Geboortedatum</label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.birthDate}
                onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
              />
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input
                type="email"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="j.doe@company.nl"
                required
              />
            </div>

            {/* Mobile Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mobiel</label>
              <input
                type="tel"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                placeholder="06-12345678"
              />
            </div>

            {/* Role Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                placeholder="Uitvaartbegeleider"
              />
            </div>

            {/* Department Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Afdeling</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                placeholder="Begeleiding"
              />
            </div>

            {/* Start Date Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Startdatum</label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
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
              {employee ? 'Bijwerken' : 'Toevoegen'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
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
                  {filteredEmployees.length} werknemers
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
                    {filteredEmployees.map((employee) => (
                      <tr key={employee.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                              {employee.initials}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{employee.fullName}</div>
                              <div className="text-sm text-gray-500">{employee.birthPlace}</div>
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
                              {employee.email}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              {(() => {
                                const PhoneIcon = FaPhone as unknown as React.ComponentType<{ size?: number; className?: string }>;
                                return <PhoneIcon size={12} className="text-gray-400" />;
                              })()}
                              {employee.mobile}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{employee.role}</div>
                            <div className="text-sm text-gray-500">{employee.department}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(employee.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => {
                                setSelectedEmployee(employee);
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
                                setEmployees(employees.filter(emp => emp.id !== employee.id));
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
          <EmployeeForm
            onSave={(newEmployee) => {
              setEmployees([...employees, newEmployee]);
              setActiveTab('overview');
            }}
            onCancel={() => setActiveTab('overview')}
          />
        )}

        {activeTab === 'edit' && selectedEmployee && (
          <EmployeeForm
            employee={selectedEmployee}
            onSave={(updatedEmployee) => {
              setEmployees(employees.map(emp => 
                emp.id === updatedEmployee.id ? updatedEmployee : emp
              ));
              setActiveTab('overview');
              setSelectedEmployee(null);
            }}
            onCancel={() => {
              setActiveTab('overview');
              setSelectedEmployee(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default EmployeeManagement;