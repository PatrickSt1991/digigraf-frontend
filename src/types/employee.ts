export type EmployeeStatus = 'active' | 'inactive' | 'deactivated';

export interface AdminEmployee {
  id: string;

  status: EmployeeStatus;

  initials: string;
  firstName: string;
  lastName: string;
  tussenvoegsel?: string;
  fullName: string;

  birthPlace?: string;
  birthDate?: string;

  email: string;
  mobile?: string;
  roleId: string;
  startDate?: string;

  hasLogin: boolean;
  loginIsActive: boolean | null;
}

export interface EmployeeDto {
  id: string;
  isActive: boolean;
  initials: string;
  firstName: string;
  lastName: string;
  tussenvoegsel?: string;
  birthPlace?: string;
  birthDate?: string | null;
  email: string;
  mobile?: string;
  roleId: string;
  startDate?: string | null;
}

export interface RoleDto {
  id: string;
  name: string;
  description?: string;
}