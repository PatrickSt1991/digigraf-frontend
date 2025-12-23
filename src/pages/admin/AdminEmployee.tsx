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
  createLogin,
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

  const toEmployeeDto = (emp: AdminEmployee): EmployeeDto => ({
    id: emp.id,
    isActive: emp.status === 'active',
    initials: emp.initials,
    firstName: emp.firstName,
    lastName: emp.lastName,
    tussenvoegsel: emp.tussenvoegsel,
    birthPlace: emp.birthPlace,
    birthDate: emp.birthDate ?? null,
    email: emp.email,
    mobile: emp.mobile,
    roleId: emp.roleId,
    startDate: emp.startDate ?? null,
  });

  const fromEmployeeDto = (
    dto: EmployeeDto,
    login?: { hasLogin: boolean; loginIsActive: boolean | null }
  ): AdminEmployee => ({
    id: dto.id,
    status: dto.isActive ? 'active' : 'inactive',

    initials: dto.initials,
    firstName: dto.firstName,
    lastName: dto.lastName,
    tussenvoegsel: dto.tussenvoegsel,
    fullName: `${dto.firstName} ${dto.tussenvoegsel ?? ''} ${dto.lastName}`
      .replace(/\s+/g, ' ')
      .trim(),

    birthPlace: dto.birthPlace,
    birthDate: dto.birthDate ?? undefined,

    email: dto.email,
    mobile: dto.mobile,
    roleId: dto.roleId,
    startDate: dto.startDate ?? undefined,

    hasLogin: login?.hasLogin ?? false,
    loginIsActive: login?.loginIsActive ?? null,
  });

  const getStatusBadge = (
    hasLogin: boolean,
    loginIsActive: boolean | null
  ) => {
    let label: 'Actief' | 'Geblokkeerd' | 'Geen login';
    let classes: string;

    if (!hasLogin) {
      label = 'Geen login';
      classes = 'bg-gray-100 text-gray-800';
    } else if (loginIsActive) {
      label = 'Actief';
      classes = 'bg-green-100 text-green-800';
    } else {
      label = 'Geblokkeerd';
      classes = 'bg-red-100 text-red-800';
    }

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${classes}`}>
        {label}
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

  const handleCreateLogin = async (emp: AdminEmployee) => {
    await createLogin(emp.id);
    updateEmployeeLocal(emp.id, (e) => ({
      ...e,
      hasLogin: true,
      loginIsActive: true,
    }));
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

          {/* -------------------------------- HEADER ------------------------------- */}
          <div className="bg-white rounded-xl border p-6 flex justify-between">
            <div className="flex items-center gap-4">
              <Link to="/admin" className="p-2 hover:bg-gray-100 rounded">
                <FaArrowLeft />
              </Link>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                  <FaUsers />
                </div>
                <div>
                  <h1 className="text-xl font-bold">Werknemers Beheer</h1>
                  <p className="text-sm text-gray-600">
                    Beheer alle werknemers
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('overview')}
                className="px-4 py-2 rounded hover:bg-gray-100"
              >
                Overzicht
              </button>
              <button
                onClick={() => setActiveTab('add')}
                className="px-4 py-2 bg-green-600 text-white rounded flex items-center gap-2"
              >
                <FaPlus />
                Nieuwe Werknemer
              </button>
            </div>
          </div>

          {/* ------------------------------- OVERVIEW ------------------------------ */}
          {activeTab === 'overview' && (
            <>
              {/* Filters */}
              <div className="bg-white rounded-xl border p-6 flex gap-4">
                <div className="relative flex-1">
                  <FaSearch className="absolute left-3 top-3 text-gray-400" />
                  <input
                    className="w-full pl-10 pr-4 py-2 border rounded"
                    placeholder="Zoek werknemers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <select
                  className="border rounded px-3 py-2"
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(e.target.value as StatusFilter)
                  }
                >
                  <option value="all">Alle statussen</option>
                  <option value="active">Actief</option>
                  <option value="inactive">Inactief</option>
                  <option value="deactivated">Gedeactiveerd</option>
                </select>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FaChartLine />
                  {filteredEmployees.length} werknemers
                </div>
              </div>

              {/* Table */}
              <div className="bg-white rounded-xl border overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="p-4 text-left">Werknemer</th>
                      <th className="p-4 text-left">Contact</th>
                      <th className="p-4 text-left">Functie</th>
                      <th className="p-4 text-center">Acties</th>
                      <th className="p-4 text-left">Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredEmployees.map((e) => (
                      <tr key={e.id} className="border-t hover:bg-gray-50">
                        <td className="p-4">
                          <div className="font-medium">{e.fullName}</div>
                          <div className="text-sm text-gray-500">
                            {e.birthPlace}
                          </div>
                        </td>

                        <td className="p-4 text-sm">
                          <div className="flex gap-2 items-center">
                            <FaEnvelope />
                            {e.email}
                          </div>
                          <div className="flex gap-2 items-center text-gray-500">
                            <FaPhone />
                            {e.mobile}
                          </div>
                        </td>

                        <td>
                          {roles.find(r => r.id === e.roleId)?.description ??
                          roles.find(r => r.id === e.roleId)?.name ??
                          '—'}
                        </td>

                        <td className="p-4 text-center">
                          <button
                            onClick={() => {
                              console.log('Editing employee:', e);
                              setSelectedEmployee(e);
                              setActiveTab('edit');
                            }}
                            className="p-2 text-blue-600"
                          >
                            <FaEdit />
                          </button>

                          {!e.hasLogin && (
                            <button
                              onClick={() => handleCreateLogin(e)}
                              className="p-2 text-green-600"
                            >
                              <FaUser />
                            </button>
                          )}

                          {e.hasLogin && e.loginIsActive && (
                            <button
                              onClick={() => handleBlockLogin(e)}
                              className="p-2 text-red-600"
                            >
                              <FaTrash />
                            </button>
                          )}

                          {e.hasLogin && !e.loginIsActive && (
                            <button
                              onClick={() => handleUnblockLogin(e)}
                              className="p-2 text-yellow-600"
                            >
                              <FaUser />
                            </button>
                          )}
                        </td>

                        <td className="p-4">
                          {getStatusBadge(e.hasLogin, e.loginIsActive)}
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
                if (activeTab === 'add') {
                  const dto = toEmployeeDto(emp);
                  const created = await createEmployee(dto);
                  setEmployees((prev) => [
                    ...prev,
                    fromEmployeeDto(created),
                  ]);
                } else {
                  const dto = toEmployeeDto(emp);
                  await updateEmployee(dto);
                  const refreshed = await getEmployees();
                  setEmployees(refreshed ?? []);
                }

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

      hasLogin: employee?.hasLogin ?? false,
      loginIsActive: employee?.loginIsActive ?? null,
    });
  };

  return (
    <div className="bg-white rounded-xl border p-6">
      <h2 className="text-xl font-semibold mb-6">
        {employee ? 'Werknemer Bewerken' : 'Nieuwe Werknemer'}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

        {/* Status */}
        <div>
          <label className="block text-sm font-medium mb-1">Status</label>
          <select
            className="w-full border p-2 rounded"
            value={form.status ?? 'active'}
            onChange={(e) =>
              setForm({ ...form, status: e.target.value as EmployeeStatus })
            }
          >
            <option value="active">Actief</option>
            <option value="inactive">Inactief</option>
            <option value="deactivated">Gedeactiveerd</option>
          </select>
        </div>

        {/* Initials */}
        <div>
          <label className="block text-sm font-medium mb-1">Initialen</label>
          <input
            className="w-full border p-2 rounded"
            value={form.initials ?? ''}
            onChange={(e) => setForm({ ...form, initials: e.target.value })}
          />
        </div>

        {/* First name */}
        <div>
          <label className="block text-sm font-medium mb-1">Voornaam *</label>
          <input
            className="w-full border p-2 rounded"
            value={form.firstName ?? ''}
            onChange={(e) => setForm({ ...form, firstName: e.target.value })}
            required
          />
        </div>

        {/* Tussenvoegsel */}
        <div>
          <label className="block text-sm font-medium mb-1">Tussenvoegsel</label>
          <input
            className="w-full border p-2 rounded"
            value={form.tussenvoegsel ?? ''}
            onChange={(e) =>
              setForm({ ...form, tussenvoegsel: e.target.value })
            }
          />
        </div>

        {/* Last name */}
        <div>
          <label className="block text-sm font-medium mb-1">Achternaam *</label>
          <input
            className="w-full border p-2 rounded"
            value={form.lastName ?? ''}
            onChange={(e) => setForm({ ...form, lastName: e.target.value })}
            required
          />
        </div>

        {/* Birth place */}
        <div>
          <label className="block text-sm font-medium mb-1">Geboorteplaats</label>
          <input
            className="w-full border p-2 rounded"
            value={form.birthPlace ?? ''}
            onChange={(e) => setForm({ ...form, birthPlace: e.target.value })}
          />
        </div>

        {/* Birth date */}
        <div>
          <label className="block text-sm font-medium mb-1">Geboortedatum</label>
          <input
            type="date"
            className="w-full border p-2 rounded"
            value={form.birthDate ?? ''}
            onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium mb-1">Email *</label>
          <input
            type="email"
            className="w-full border p-2 rounded"
            value={form.email ?? ''}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
        </div>

        {/* Mobile */}
        <div>
          <label className="block text-sm font-medium mb-1">Mobiel</label>
          <input
            className="w-full border p-2 rounded"
            value={form.mobile ?? ''}
            onChange={(e) => setForm({ ...form, mobile: e.target.value })}
          />
        </div>

        {/* Role */}
        <div>
          <label className="block text-sm font-medium mb-1">Rol</label>
          <select
            className="w-full border p-2 rounded"
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

        {/* Start date */}
        <div>
          <label className="block text-sm font-medium mb-1">Startdatum</label>
          <input
            type="date"
            className="w-full border p-2 rounded"
            value={form.startDate ?? ''}
            onChange={(e) => setForm({ ...form, startDate: e.target.value })}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-4 mt-6">
        <button
          onClick={onCancel}
          className="px-4 py-2 border rounded"
        >
          Annuleren
        </button>
        <button
          onClick={submit}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Opslaan
        </button>
      </div>
    </div>
  );
};