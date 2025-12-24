import { adminEndpoints } from "./apiConfig";
import apiClient from "./apiClient";
import { AdminEmployee, EmployeeDto } from "../types";
import { RoleDto, InsurancePartyDto, InsurancePolicyDto } from "../types";
/* ===================== EMPLOYEES (existing) ===================== */

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

  return apiClient<EmployeeDto>(
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

/* ===================== INSURANCE PARTIES ===================== */

export async function getInsuranceParties(): Promise<InsurancePartyDto[]> {
  return apiClient<InsurancePartyDto[]>(adminEndpoints.insuranceParties, {
    method: "GET",
  });
}

export async function getInsuranceParty(
  id: string
): Promise<InsurancePartyDto> {
  return apiClient<InsurancePartyDto>(
    adminEndpoints.insuranceParty(id),
    {
      method: "GET",
    }
  );
}

export async function createInsuranceParty(
  party: InsurancePartyDto
): Promise<InsurancePartyDto> {
  return apiClient<InsurancePartyDto>(
    adminEndpoints.createInsuranceParty,
    {
      method: "POST",
      body: party,
    }
  );
}

export async function updateInsuranceParty(
  party: InsurancePartyDto
): Promise<void> {
  if (!party.id) {
    throw new Error("Cannot update insurance party without id");
  }

  await apiClient<void>(
    adminEndpoints.updateInsuranceParty(party.id),
    {
      method: "PUT",
      body: party,
    }
  );
}

export async function deleteInsuranceParty(
  id: string
): Promise<void> {
  await apiClient<void>(
    adminEndpoints.deleteInsuranceParty(id),
    {
      method: "DELETE",
    }
  );
}

/* ===================== INSURANCE POLICIES ===================== */

export async function getInsurancePolicies(
  overledeneId: string
): Promise<InsurancePolicyDto[]> {
  return apiClient<InsurancePolicyDto[]>(
    adminEndpoints.insurancePolicies(overledeneId),
    {
      method: "GET",
    }
  );
}

export async function addInsurancePolicies(
  overledeneId: string,
  policies: InsurancePolicyDto[]
): Promise<void> {
  await apiClient<void>(
    adminEndpoints.insurancePolicies(overledeneId),
    {
      method: "POST",
      body: policies,
    }
  );
}

export async function deleteInsurancePolicy(
  policyId: string
): Promise<void> {
  await apiClient<void>(
    adminEndpoints.deleteInsurancePolicy(policyId),
    {
      method: "DELETE",
    }
  );
}
