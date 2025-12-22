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
    insuranceCompanies: `${API_BASE}/Insurance/companies`,
    insuranceDeceased: `${API_BASE}/dummy`,
    invoiceDeceased: `${API_BASE}/invoice`,
    invoiceExcel: `${API_BASE}/invoice/generate-excel`,
    suppliers: `${API_BASE}/DossierUtils/suppliers`,
    suppliertypes: `${API_BASE}/DossierUtils/supplier-types`,
    employees: `${API_BASE}/Employee/employees`,
};

export const licenseEndpoints = {
    license: `${API_BASE}/license`,
    licenseInfo: `${API_BASE}/license/info`,
    licenseUpload: `${API_BASE}/license/upload`,
    licenseValidateKey: `${API_BASE}/license/validate-key`,
};

export const adminEndpoints = {
    deceased: `${API_BASE}/admin/deceased`,
    insuranceCompanies: `${API_BASE}/admin/insurance/companies`,
    employees: `${API_BASE}/employee/employeesadmin`,
};