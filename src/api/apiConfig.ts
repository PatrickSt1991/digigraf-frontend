export const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5027/api";


export const endpoints = {
    authentication: `${API_BASE}/Auth`,
    deceased: `${API_BASE}/deceased`,
    additional: `${API_BASE}/additional`,
    funeral: `${API_BASE}/funeral`,
    documentsdeceased: `${API_BASE}/DocumentTemplates`,
    documentsdefault: `${API_BASE}/DocumentTemplates/defaults`,
    funeralLeaders: `${API_BASE}/DossierUtils/funeral-leaders`,
    caretakers: `${API_BASE}/DossierUtils/caretakers`,
    salutation: `${API_BASE}/DossierUtils/salutations`,
    bodyfindings: `${API_BASE}/DossierUtils/bodyfindings`,
    origins: `${API_BASE}/DossierUtils/origins`,
    maritalstatuses: `${API_BASE}/DossierUtils/maritalstatus`,
    coffins: `${API_BASE}/DossierUtils/coffins`,
    coffinlenghts: `${API_BASE}/DossierUtils/coffins-length`,
    insuranceCompanies: `${API_BASE}/Insurance/companies`,
    insuranceDeceased: `${API_BASE}/dummy`,
};