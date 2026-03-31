export type EmployeeStatus = 'active' | 'inactive';

export interface AdminEmployee {
  id: string;
  hasLogin: boolean;
  loginIsActive: boolean | null;
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
  roleId: string | null;
  startDate?: string;
}

export interface EmployeeDto {
  id: string | null;
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