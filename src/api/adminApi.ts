import { adminEndpoints, endpoints } from "./apiConfig";
import apiClient from "./apiClient";
import { AdminEmployee,
  AsbestemmingDto,
  CoffinsDto,
  EmployeeDto,
  RouwbriefDto,
  RoleDto,
  InsurancePartyDto,
  InsurancePolicyDto,
  SupplierDto,
  SupplierTypeDto,
  InsurancePriceComponentDto,
  FinancialRowDto,
  InvoiceFormData,
  FinancialQuery,
  CompanySettings,
  AccessDbEntry
} from "../types";

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

export async function getFinancialInvoices(params: FinancialQuery): Promise<FinancialRowDto[]> {
  const qs = new URLSearchParams();
  if (params.q) qs.set("q", params.q);
  if (params.status) qs.set("status", params.status);
  return apiClient<FinancialRowDto[]>(`${adminEndpoints.financialFacturen}?${qs.toString()}`, { method: "GET" });
}

export async function getFinancialBloemen(params: FinancialQuery): Promise<FinancialRowDto[]> {
  const qs = new URLSearchParams();
  if (params.q) qs.set("q", params.q);
  if (params.status) qs.set("status", params.status);
  return apiClient<FinancialRowDto[]>(`${adminEndpoints.financialBloemen}?${qs.toString()}`, { method: "GET" });
}

export async function getFinancialSteenhouwerij(params: FinancialQuery): Promise<FinancialRowDto[]> {
  const qs = new URLSearchParams();
  if (params.q) qs.set("q", params.q);
  if (params.status) qs.set("status", params.status);
  return apiClient<FinancialRowDto[]>(`${adminEndpoints.financialSteenhouwerij}?${qs.toString()}`, { method: "GET" });
}

export async function getFinancialWerkbonnen(params: FinancialQuery): Promise<FinancialRowDto[]> {
  const qs = new URLSearchParams();
  if (params.q) qs.set("q", params.q);
  if (params.status) qs.set("status", params.status);
  return apiClient<FinancialRowDto[]>(`${adminEndpoints.financialWerkbonnen}?${qs.toString()}`, { method: "GET" });
}

export async function getFinancialUrnen(params: FinancialQuery): Promise<FinancialRowDto[]> {
  const qs = new URLSearchParams();
  if (params.q) qs.set("q", params.q);
  if (params.status) qs.set("status", params.status);
  return apiClient<FinancialRowDto[]>(`${adminEndpoints.financialUrnen}?${qs.toString()}`, { method: "GET" });
}

export async function updateFinancialPayout(
  id: string,
  body: { provisie: number; datumUitbetaald: string | null; uitbetaald: boolean }
): Promise<void> {
  await apiClient<void>(adminEndpoints.financialPayout(id), { method: "PATCH", body });
}

export async function exportFinancialExcel(
  tab: "facturen" | "bloemen" | "steenhouwerij" | "werkbonnen" | "urnen",
  params: FinancialQuery
): Promise<void> {
  const qs = new URLSearchParams();
  if (params.q) qs.set("q", params.q);
  if (params.status) qs.set("status", params.status);

  // Use fetch for blob download
  const res = await fetch(`${adminEndpoints.financialExport(tab)}?${qs.toString()}`);
  if (!res.ok) throw new Error("Export mislukt");

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Financial_${tab}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function getInvoiceByDossierId(dossierId: string): Promise<InvoiceFormData> {
  return apiClient<InvoiceFormData>(adminEndpoints.invoiceByDossier(dossierId), {
    method: "GET",
  });
}

export async function saveInvoiceForDossier(
  dossierId: string,
  data: InvoiceFormData
): Promise<void> {
  await apiClient<void>(adminEndpoints.invoiceUpdate(dossierId), {
    method: "PUT",
    body: { dossierId, ...data },
  });
}

export async function generateInvoiceExcelForDossier(
  dossierId: string,
  data: InvoiceFormData
): Promise<void> {
  const res = await fetch(adminEndpoints.invoiceExcel, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ dossierId, ...data }),
  });

  if (!res.ok) throw new Error("Excel export mislukt");

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);

  const contentDisposition = res.headers.get("Content-Disposition");
  const match = contentDisposition?.match(/filename="?([^"]+)"?/);
  const fileName = match?.[1] ?? `Kostenbegroting_${dossierId}.xls`;

  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();

  URL.revokeObjectURL(url);
}

export const getCompanySettings = async (): Promise<CompanySettings> => {
  const res = await fetch(adminEndpoints.company);
  if (!res.ok) throw new Error("Ophalen mislukt");
  return res.json();
};
 
export const saveCompanySettings = async (data: CompanySettings): Promise<void> => {
  const res = await fetch(adminEndpoints.company, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message ?? "Opslaan mislukt");
  }
};

async function downloadInvoiceFile(
  dossierId: string,
  type: 'opdrachtgever' | 'vereniging',
): Promise<void> {
  const invoiceRes = await fetch(adminEndpoints.invoiceByDossier(dossierId));
  if (!invoiceRes.ok) throw new Error('Kon factuurgegevens niet ophalen.');
  const invoiceDto = await invoiceRes.json();

  const endpoint =
    type === 'opdrachtgever'
      ? adminEndpoints.generateOpdrachtgeverInvoice
      : adminEndpoints.generateVerenigingInvoice;

  const fileRes = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(invoiceDto),
  });

  if (!fileRes.ok) throw new Error('Factuur kon niet worden gegenereerd.');

  const disposition = fileRes.headers.get('Content-Disposition') ?? '';
  const headerMatch = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
  
  let filename: string;
  if (headerMatch) {
    filename = headerMatch[1].replace(/['"]/g, '');
  } else {
    // Construct from invoiceDto data
    const funeralNumber = invoiceDto.funeralNumber ?? dossierId;
    const deceasedFullName: string = invoiceDto.personalInfo?.deceasedName ?? '';
    const lastName = deceasedFullName.trim().split(' ').pop() ?? '';
    const safeName = lastName.replace(/[/\\]/g, '-');
    filename = type === 'vereniging'
      ? `Factuur_${funeralNumber}A_${safeName}.xls`
      : `Factuur_${funeralNumber}_${safeName}.xls`;
  }

  const blob = await fileRes.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export const generateOpdrachtgeverInvoice = (dossierId: string) =>
  downloadInvoiceFile(dossierId, 'opdrachtgever');

export const generateVerenigingInvoice = (dossierId: string) =>
  downloadInvoiceFile(dossierId, 'vereniging');

export const getAccessDatabases = async (): Promise<AccessDbEntry[]> => {
  const res = await fetch(adminEndpoints.accessDatabases);
  if (!res.ok) throw new Error("Ophalen mislukt");
  return res.json();
};

export const saveAccessDatabases = async (data: AccessDbEntry[]): Promise<void> => {
  const res = await fetch(adminEndpoints.accessDatabases, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Opslaan mislukt");
};