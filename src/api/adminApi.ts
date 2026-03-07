import { adminEndpoints, endpoints } from "./apiConfig";
import apiClient from "./apiClient";
import { AdminEmployee, AsbestemmingDto, CoffinsDto, EmployeeDto, RouwbriefDto } from "../types";
import { RoleDto, InsurancePartyDto, InsurancePolicyDto, SupplierDto, SupplierTypeDto } from "../types";
import { InsurancePriceComponentDto } from "../types/priceComponents";
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

/* ===================== SUPPLIERS ===================== */

export async function getSuppliers(): Promise<SupplierDto[]> {
  return apiClient<SupplierDto[]>(adminEndpoints.suppliers, {
    method: "GET",
  });
}

export async function getSupplierTypes(): Promise<SupplierTypeDto[]> {
  return apiClient<SupplierTypeDto[]>(adminEndpoints.supplierTypes, {
    method: "GET",
  });
}

export async function getSupplier(
  id: string
): Promise<SupplierDto> {
  return apiClient<SupplierDto>(
    adminEndpoints.supplier(id),
    {
      method: "GET",
    }
  );
}

export async function createSupplier(
  party: SupplierDto
): Promise<SupplierDto> {
  return apiClient<SupplierDto>(
    adminEndpoints.createSupplier,
    {
      method: "POST",
      body: party,
    }
  );
}

export async function updateSupplier(
  party: SupplierDto
): Promise<void> {
  if (!party.id) {
    throw new Error("Cannot update supplier without id");
  }

  await apiClient<void>(
    adminEndpoints.updateSupplier(party.id),
    {
      method: "PUT",
      body: party,
    }
  );
}

export async function deleteSupplier(
  id: string
): Promise<void> {
  await apiClient<void>(
    adminEndpoints.deleteSupplier(id),
    {
      method: "DELETE",
    }
  );
}

/* ===================== ASBESTEMMINGEN ===================== */

export async function getAsbestemmingen(): Promise<AsbestemmingDto[]> {
  return apiClient<AsbestemmingDto[]>(adminEndpoints.asbestemmingen, {
    method: "GET",
  });
}

export async function createAsbestemming(
  asbestemming: AsbestemmingDto
): Promise<AsbestemmingDto> {
  return apiClient<AsbestemmingDto>(
    adminEndpoints.createAsbestemming,
    {
      method: "POST",
      body: asbestemming,
    }
  );
}

export async function updateAsbestemming(
  asbestemming: AsbestemmingDto
): Promise<void> {
  if (!asbestemming.id) {
    throw new Error("Cannot update asbestemming without id");
  }

  await apiClient<void>(
    adminEndpoints.updateAsbestemming(asbestemming.id),
    {
      method: "PUT",
      body: asbestemming,
    }
  );
}

/* ===================== Rouwbrieven ===================== */
export async function getRouwbrieven(): Promise<RouwbriefDto[]> {
  return apiClient<RouwbriefDto[]>(adminEndpoints.rouwbrieven, {
    method: "GET",
  });
}

export async function createRouwbrief(rouwbrief: RouwbriefDto): Promise<RouwbriefDto> {
  return apiClient<RouwbriefDto>(
    adminEndpoints.createRouwbrief,
    {
      method: "POST",
      body: rouwbrief,
    }
  );
}

export async function updateRouwbrief(rouwbrief: RouwbriefDto): Promise<void> {
  if (!rouwbrief.id) {
    throw new Error("Cannot update rouwbrief without id");
  }

  await apiClient<void>(
    adminEndpoints.updateRouwbrief(rouwbrief.id),
    {
      method: "PUT",
      body: rouwbrief,
    }
  );
}

/* ===================== PRICECOMPONENTS ===================== */

export async function getInsurancePriceComponents(): Promise<InsurancePriceComponentDto[]> {
  return apiClient<InsurancePriceComponentDto[]>(adminEndpoints.insurancePriceComponents, {
    method: "GET",
  });
}

export async function createInsurancePriceComponent(
  dto: InsurancePriceComponentDto
): Promise<InsurancePriceComponentDto> {
  return apiClient<InsurancePriceComponentDto>(adminEndpoints.createInsurancePriceComponent, {
    method: "POST",
    body: dto,
  });
}

export async function updateInsurancePriceComponent(
  dto: InsurancePriceComponentDto
): Promise<void> {
  if (!dto.id) throw new Error("Cannot update without id");

  await apiClient<void>(adminEndpoints.updateInsurancePriceComponent(dto.id), {
    method: "PUT",
    body: dto,
  });
}

export async function getInsurancePartiesAll(): Promise<InsurancePartyDto[]> {
  return apiClient<InsurancePartyDto[]>(endpoints.insuranceCompanies, {
    method: "GET",
  });
}

/* ===================== COFFINS ===================== */

export async function getCoffins(): Promise<CoffinsDto[]> {
  return apiClient<CoffinsDto[]>(adminEndpoints.coffins, {
    method: "GET",
  });
}

export async function createCoffin(
  coffin: CoffinsDto
): Promise<CoffinsDto> {
  return apiClient<CoffinsDto>(
    adminEndpoints.createCoffin,
    {
      method: "POST",
      body: coffin,
    }
  );
}

export async function updateCoffin(
  coffin: CoffinsDto
): Promise<void> {
  if (!coffin.id) {
    throw new Error("Cannot update coffin without id");
  }

  await apiClient<void>(
    adminEndpoints.updateCoffin(coffin.id),
    {
      method: "PUT",
      body: coffin,
    }
  );
}

export async function deleteCoffin(
  id: string
): Promise<void> {
  await apiClient<void>(
    adminEndpoints.deleteCoffin(id),
    {
      method: "DELETE",
    }
  );
}
