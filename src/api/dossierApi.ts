import { endpoints } from "./apiConfig";
import apiClient from "./apiClient";
import { DossierDto, FuneralLeaderDto } from "../DTOs";

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