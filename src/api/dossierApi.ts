import { endpoints } from "./apiConfig";
import apiClient from "./apiClient";
import { DossierDto, FuneralLeaderDto, SearchCriteria, SearchResult } from "../types";

// Search dossiers based on criteria
export async function searchDossiers(criteria: SearchCriteria): Promise<DossierDto[]> {
  const params = new URLSearchParams();
  if (criteria.lastName) params.set("lastName", criteria.lastName);
  if (criteria.birthDate) params.set("birthDate", criteria.birthDate);
  if (criteria.funeralNumber) params.set("funeralNumber", criteria.funeralNumber);
  params.set("archive", String(criteria.archive));
  params.set("oldDB", String(criteria.oldDB));

  const response = await apiClient<SearchResult>(`${endpoints.searchDossier}?${params.toString()}`, {
    method: "GET",
  });
  return response.results;
}

// Create new dossier
export async function createNewDossier(request: DossierDto): Promise<DossierDto> {
    return apiClient<DossierDto>(`${endpoints.deceased}/new`, {
        method: "POST",
        body: request,
    });
}

// Get dossier by Id
export async function getDossier(id: string): Promise<DossierDto> {
    return apiClient<DossierDto>(`${endpoints.deceased}/${id}`, {
        method: "GET",
    });
}

// Update dossier (partial update)
export async function updateDossier(id: string, request: Partial<DossierDto>): Promise<DossierDto> {
    return apiClient<DossierDto>(`${endpoints.deceased}/${id}`, {
        method: "PATCH",
        body: request,
    });
}

export async function getFuneralLeaders(): Promise<FuneralLeaderDto[]> {
    return apiClient<FuneralLeaderDto[]>(endpoints.funeralLeaders, {
        method: 'GET',
    });
}