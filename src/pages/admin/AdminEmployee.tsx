import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FaUsers,
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaEnvelope,
  FaPhone,
  FaUser,
  FaChartLine,
  FaArrowLeft,
} from 'react-icons/fa';

import { DashboardLayout } from '../../components';
import {
  AdminEmployee,
  EmployeeDto,
  EmployeeStatus,
  RoleDto,
} from '../../types';
import {
  blockLogin,
  createEmployee,
  getEmployeeRoles,
  getEmployees,
  unblockLogin,
  updateEmployee,
} from '../../api/adminApi';

type StatusFilter = 'all' | EmployeeStatus;

/* -------------------------------------------------------------------------- */
/*                               MAIN COMPONENT                               */
/* -------------------------------------------------------------------------- */

const EmployeeManagement: React.FC = () => {
  const [activeTab, setActiveTab] =
    useState<'overview' | 'add' | 'edit'>('overview');
  const [selectedEmployee, setSelectedEmployee] =
    useState<AdminEmployee | null>(null);
  const [roles, setRoles] = useState<RoleDto[]>([]);


  const [employees, setEmployees] = useState<AdminEmployee[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [employeesError, setEmployeesError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>('all');

  /* -------------------------------------------------------------------------- */
  /*                                DATA LOADING                                */
  /* -------------------------------------------------------------------------- */
  useEffect(() => {
    getEmployeeRoles()
      .then(setRoles)
      .catch(err => console.error('Failed to load roles', err));
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadEmployees = async () => {
      try {
        setLoadingEmployees(true);
        const data = await getEmployees();
        if (!cancelled) setEmployees(data ?? []);
      } catch (err) {
        if (!cancelled) {
          setEmployeesError(
            (err as Error).message ?? 'Kon werknemers niet laden.'
          );
        }
      } finally {
        if (!cancelled) setLoadingEmployees(false);
      }
    };

    loadEmployees();
    return () => {
      cancelled = true;
    };
  }, []);

  /* -------------------------------------------------------------------------- */
  /*                                   HELPERS                                  */
  /* -------------------------------------------------------------------------- */

  const toEmployeeDto = (
    employee: AdminEmployee,
    mode: 'create' | 'update'
  ): EmployeeDto => ({
    id: mode === 'create' ? null : employee.id,
    isActive: employee.status === 'active',
    initials: employee.initials,
    firstName: employee.firstName,
    lastName: employee.lastName,
    tussenvoegsel: employee.tussenvoegsel,

    birthPlace: employee.birthPlace,
    birthDate: employee.birthDate ?? null,

    email: employee.email,
    mobile: employee.mobile,
    roleId: employee.roleId,
    startDate: employee.startDate ?? null,
  });

const getStatusBadge = (loginIsActive: boolean | null) => {
  const isActive = loginIsActive === true;

  return (
    <span
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium
        ${isActive
          ? 'bg-green-100 text-green-800'
          : 'bg-red-100 text-red-800'
        }`}
    >
      <span
        className={`w-2 h-2 rounded-full
          ${isActive ? 'bg-green-500' : 'bg-red-500'}
        `}
      />
      {isActive ? 'Actief' : 'Inactief'}
    </span>
  );
};


  /* -------------------------------------------------------------------------- */
  /*                                  FILTERING                                 */
  /* -------------------------------------------------------------------------- */

  const filteredEmployees = useMemo(() => {
    return employees.filter((e) => {
      const matchesSearch =
        e.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.email.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === 'all' || e.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [employees, searchTerm, statusFilter]);

  /* -------------------------------------------------------------------------- */
  /*                               LOGIN ACTIONS                                */
  /* -------------------------------------------------------------------------- */

  const updateEmployeeLocal = (
    id: string,
    updater: (e: AdminEmployee) => AdminEmployee
  ) => {
    setEmployees((prev) =>
      prev.map((e) => (e.id === id ? updater(e) : e))
    );
  };

  const handleBlockLogin = async (emp: AdminEmployee) => {
    await blockLogin(emp.id);
    updateEmployeeLocal(emp.id, (e) => ({
      ...e,
      loginIsActive: false,
    }));
  };

  const handleUnblockLogin = async (emp: AdminEmployee) => {
    await unblockLogin(emp.id);
    updateEmployeeLocal(emp.id, (e) => ({
      ...e,
      loginIsActive: true,
    }));
  };

  /* -------------------------------------------------------------------------- */
  /*                                    RENDER                                  */
  /* -------------------------------------------------------------------------- */

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto space-y-6">
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

          {/* ------------------------------- OVERVIEW ------------------------------ */}
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
                      placeholder="Zoek verzekeraars..."
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

              {/* Table */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Werknemer</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Functie</th>
                      <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Acties</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-200">
                    {filteredEmployees.map((e) => (
                      <tr key={e.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3 group">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white text-sm font-semibold flex items-center justify-center">
                            {e.initials}
                          </div>

                          <div className="flex flex-col">
                            <span className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                              {e.fullName}
                            </span>
                            {e.birthPlace && (
                              <span className="text-sm text-gray-500">
                                {e.birthPlace}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm text-gray-900">
                              <FaEnvelope size={12} className="text-gray-400"/>
                              {e.email}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <FaPhone size={12} className="text-gray-400" />
                              {e.mobile}
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          {(() => {
                            const role = roles.find(r => r.id === e.roleId);

                            if (!role) {
                              return (
                                <span className="text-sm text-gray-400 italic">
                                  —
                                </span>
                              );
                            }

                            return (
                              <div className="flex flex-col">
                                <span className="text-sm font-medium text-gray-900">
                                  {role.description ?? role.name}
                                </span>
                                {role.description && role.name && (
                                  <span className="text-xs text-gray-500">
                                    {role.name}
                                  </span>
                                )}
                              </div>
                            );
                          })()}
                        </td>


                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => {
                                setSelectedEmployee(e);
                                setActiveTab('edit');
                              }}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <FaEdit size={16} />
                            </button>

                            {e.loginIsActive && (
                              <button
                                onClick={() => handleBlockLogin(e)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <FaTrash />
                              </button>
                            )}

                            {!e.loginIsActive && (
                              <button
                                onClick={() => handleUnblockLogin(e)}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              >
                                <FaUser size={16} />
                              </button>
                            )}
                          </div>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">  
                          {getStatusBadge(e.loginIsActive)}
                        </td>

                      </tr>
                    ))}

                    {!loadingEmployees &&
                      !employeesError &&
                      filteredEmployees.length === 0 && (
                        <tr>
                          <td colSpan={6} className="p-6 text-gray-500">
                            Geen werknemers gevonden.
                          </td>
                        </tr>
                      )}
                  </tbody>
                </table>
                </div>
              </div>
            </>
          )}

          {/* ------------------------------- ADD / EDIT ----------------------------- */}
          {(activeTab === 'add' ||
            (activeTab === 'edit' && selectedEmployee)) && (
            <EmployeeForm
              employee={selectedEmployee ?? undefined}
              roles={roles}
              onCancel={() => {
                setActiveTab('overview');
                setSelectedEmployee(null);
              }}
              onSave={async (emp) => {
                const isActive = emp.status === 'active';

                if (activeTab === 'add') {
                  console.log('Creating employee', emp);
                  const dto = toEmployeeDto(emp, 'create');
                  await createEmployee(dto);

                  if (!isActive) {
                    await blockLogin(emp.id);
                  }
                } else {
                  const dto = toEmployeeDto(emp, 'update');
                  await updateEmployee(dto);

                  if (isActive) {
                    await unblockLogin(emp.id);
                  } else {
                    await blockLogin(emp.id);
                  }
                }

                const refreshed = await getEmployees();
                setEmployees(refreshed ?? []);

                setActiveTab('overview');
                setSelectedEmployee(null);
              }}
            />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EmployeeManagement;

/* -------------------------------------------------------------------------- */
/*                                EMPLOYEE FORM                               */
/* -------------------------------------------------------------------------- */

const EmployeeForm = ({
  employee,
  roles,
  onSave,
  onCancel,
}: {
  employee?: AdminEmployee;
  roles: RoleDto[];
  onSave: (e: AdminEmployee) => void;
  onCancel: () => void;
}) => {
  const [form, setForm] = useState<Partial<AdminEmployee>>(employee ?? {});

  useEffect(() => {
    if (!employee) return;

    setForm(prev => ({
      ...prev,
      ...employee,
      roleId: employee.roleId ?? '',
    }));
  }, [employee, roles]);

  const submit = () => {
    onSave({
      id: employee?.id ?? '',
      status: form.status ?? 'active',

      initials: form.initials ?? '',
      firstName: form.firstName ?? '',
      lastName: form.lastName ?? '',
      tussenvoegsel: form.tussenvoegsel || undefined,
      fullName: `${form.firstName ?? ''} ${form.tussenvoegsel ?? ''} ${form.lastName ?? ''}`
        .replace(/\s+/g, ' ')
        .trim(),

      birthPlace: form.birthPlace || undefined,
      birthDate: form.birthDate || undefined,

      email: form.email ?? '',
      mobile: form.mobile || undefined,
      roleId: form.roleId ?? '',
      startDate: form.startDate || undefined,

      loginIsActive: employee?.loginIsActive ?? null,
    });
  };

  return (
    <div className="bg-white rounded-xl border p-6 space-y-8">

      {/* ===================== HEADER ===================== */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900">
          {employee ? 'Werknemer bewerken' : 'Nieuwe werknemer'}
        </h2>
        <p className="text-sm text-gray-500">
          Persoonlijke en werkgerelateerde gegevens
        </p>
      </div>

      {/* ===================== ACCOUNT ===================== */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Account
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Account status
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={form.status ?? 'active'}
              onChange={(e) =>
                setForm({ ...form, status: e.target.value as EmployeeStatus })
              }
            >
              <option value="active">Actief</option>
              <option value="inactive">Inactief</option>
            </select>
          </div>
        </div>
      </div>

      {/* ===================== NAAM ===================== */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Naam
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Initialen
            </label>
            <input
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              value={form.initials ?? ''}
              onChange={(e) =>
                setForm({ ...form, initials: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Voornaam *
            </label>
            <input
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              value={form.firstName ?? ''}
              onChange={(e) =>
                setForm({ ...form, firstName: e.target.value })
              }
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tussenvoegsel
            </label>
            <input
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              value={form.tussenvoegsel ?? ''}
              onChange={(e) =>
                setForm({ ...form, tussenvoegsel: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Achternaam *
            </label>
            <input
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              value={form.lastName ?? ''}
              onChange={(e) =>
                setForm({ ...form, lastName: e.target.value })
              }
              required
            />
          </div>
        </div>
      </div>

      {/* ===================== CONTACT ===================== */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Contact
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Geboorteplaats
            </label>
            <input
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              value={form.birthPlace ?? ''}
              onChange={(e) =>
                setForm({ ...form, birthPlace: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Geboortedatum
            </label>
            <input
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              value={form.birthDate ?? ''}
              onChange={(e) =>
                setForm({ ...form, birthDate: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              value={form.email ?? ''}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mobiel
            </label>
            <input
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              value={form.mobile ?? ''}
              onChange={(e) =>
                setForm({ ...form, mobile: e.target.value })
              }
            />
          </div>
        </div>
      </div>

      {/* ===================== WERK ===================== */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Werk
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rol *
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={form.roleId ?? ''}
              disabled={roles.length === 0}
              onChange={(e) =>
                setForm({ ...form, roleId: e.target.value })
              }
              required
            >
              <option value="">Selecteer rol</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.description ?? role.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Startdatum
            </label>
            <input
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              value={form.startDate ?? ''}
              onChange={(e) =>
                setForm({ ...form, startDate: e.target.value })
              }
            />
          </div>
        </div>
      </div>

      {/* ===================== ACTIES ===================== */}
      <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
        <button
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Annuleren
        </button>
        <button
          onClick={submit}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Opslaan
        </button>
      </div>
    </div>
  );
};