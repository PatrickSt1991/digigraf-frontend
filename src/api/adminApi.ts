import { adminEndpoints } from "./apiConfig";
import apiClient from "./apiClient";
import { AdminEmployee, EmployeeDto } from "../types";
import { RoleDto } from '../types';

export async function getEmployeeRoles(): Promise<RoleDto[]> {
  return apiClient<RoleDto[]>(adminEndpoints.employeesRoles, {
    method: 'GET',
  });
}

export async function getEmployees(): Promise<AdminEmployee[]> {
    return apiClient<AdminEmployee[]>(adminEndpoints.employees, {
        method: 'GET',
    });
}

export async function createLogin(employeeId: string): Promise<void> {
  await apiClient<void>(adminEndpoints.createLogin(employeeId), {
    method: "POST",
  });
}

export async function blockLogin(employeeId: string): Promise<void> {
  await apiClient<void>(adminEndpoints.blockLogin(employeeId), {
    method: "POST",
  });
}

export async function unblockLogin(employeeId: string): Promise<void> {
  await apiClient<void>(adminEndpoints.unblockLogin(employeeId), {
    method: "POST",
  });
}

export async function createEmployee(
  employee: EmployeeDto
): Promise<EmployeeDto> {
  return apiClient<EmployeeDto>(adminEndpoints.createEmployee, {
    method: "POST",
    body: employee,
  });
}

export async function updateEmployee(
  employee: EmployeeDto
): Promise<EmployeeDto> {
  if (!employee.id) {
    throw new Error("Cannot update employee without id");
  }
  return await apiClient<EmployeeDto>(
    adminEndpoints.updateEmployee(employee.id), 
    {
      method: "PUT",
      body: employee,
    }
  );
}

export async function getEmployee(
  employeeId: string
): Promise<EmployeeDto> {
  return apiClient<EmployeeDto>(adminEndpoints.getEmployee(employeeId), {
    method: "GET",
  });
}