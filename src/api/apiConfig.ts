export const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5027/api";


export const endpoints = {
    dossier: `${API_BASE}/dossier`,
    deceased: `${API_BASE}/deceased`,
    deathInfo: `${API_BASE}/deathinfo`
};
