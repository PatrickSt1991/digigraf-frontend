export const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5027/api";

export const endpoints = {
    authentication: `${API_BASE}/Auth`,
    upcoming: `${API_BASE}/upcoming-funerals`,
    deceased: `${API_BASE}/deceased`,
    additional: `${API_BASE}/additional`,
    funeral: `${API_BASE}/funeral`,
    documentsdeceased: `${API_BASE}/DocumentTemplates`,
    documentsdefault: `${API_BASE}/DocumentTemplates/defaults`,
    funeralLeaders: `${API_BASE}/DossierUtils/funeral-leaders`,
    caretakers: `${API_BASE}/DossierUtils/caretakers`,
    salutation: `${API_BASE}/DossierUtils/salutations`,
    funeralTypes: `${API_BASE}/funeral/types`,
    bodyfindings: `${API_BASE}/DossierUtils/bodyfindings`,
    origins: `${API_BASE}/DossierUtils/origins`,
    maritalstatuses: `${API_BASE}/DossierUtils/maritalstatus`,
    coffins: `${API_BASE}/DossierUtils/coffins`,
    coffinlenghts: `${API_BASE}/DossierUtils/coffins-length`,
    insuranceCompanies: `${API_BASE}/Insurance/parties`,
    insuranceDeceased: `${API_BASE}/Insurance/policies`,
    invoiceDeceased: `${API_BASE}/invoice`,
    invoiceExcel: `${API_BASE}/invoice/generate-excel`,
    suppliers: `${API_BASE}/DossierUtils/suppliers`,
    suppliertypes: `${API_BASE}/DossierUtils/supplier-types`,
    employees: `${API_BASE}/Employee/employees`,
    employeesOverview: `${API_BASE}/Employee/overview`,
};

export const licenseEndpoints = {
    license: `${API_BASE}/license`,
    licenseInfo: `${API_BASE}/license/info`,
    licenseUpload: `${API_BASE}/license/upload`,
    licenseValidateKey: `${API_BASE}/license/validate-key`,
};

export const adminEndpoints = {
  // -------------------- DECEASED --------------------
  deceased: `${API_BASE}/admin/deceased`,

  // -------------------- INSURANCE --------------------
  insuranceParties: `${API_BASE}/insurance/parties`,
  insuranceParty: (id: string) => `${API_BASE}/insurance/parties/${id}`,

  createInsuranceParty: `${API_BASE}/insurance/parties`,
  updateInsuranceParty: (id: string) => `${API_BASE}/insurance/parties/${id}`,
  deleteInsuranceParty: (id: string) => `${API_BASE}/insurance/parties/${id}`,

  insurancePolicies: (overledeneId: string) =>
    `${API_BASE}/insurance/policies?overledeneId=${overledeneId}`,

  deleteInsurancePolicy: (id: string) =>
    `${API_BASE}/insurance/policies/${id}`,

  // -------------------- EMPLOYEES --------------------
  employees: `${API_BASE}/employee/employeesadmin`,
  employeesRoles: `${API_BASE}/employee/employeeRoles`,

  createEmployee: `${API_BASE}/employee/createEmployee`,
  updateEmployee: (id: string) =>
    `${API_BASE}/employee/updateEmployee/${id}`,
  getEmployee: (id: string) =>
    `${API_BASE}/employee/getEmployee/${id}`,

  createLogin: (id: string) =>
    `${API_BASE}/employee/createLogin/${id}`,
  blockLogin: (id: string) =>
    `${API_BASE}/employee/blockLogin/${id}`,
  unblockLogin: (id: string) =>
    `${API_BASE}/employee/unblockLogin/${id}`,
};
