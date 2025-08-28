export const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5027/api";


export const endpoints = {
    authentication: `${API_BASE}/Auth`,
    deceased: `${API_BASE}/Deceased`,
    additional: `${API_BASE}/additional`,
    funeralLeaders: `${API_BASE}/DossierUtils/funeral-leaders`,
    salutation: `${API_BASE}/DossierUtils/salutations`,
    bodyfindings: `${API_BASE}/DossierUtils/bodyfindings`,
    origins: `${API_BASE}/DossierUtils/origins`,
    maritalstatuses: `${API_BASE}/DossierUtils/maritalstatus`,
    insuranceCompanies: `${API_BASE}/Insurance/companies`,
    insuranceDeceased: `${API_BASE}/dummy`,
};