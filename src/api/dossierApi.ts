import { endpoints } from "./apiConfig";
import apiClient from "./apiClient";

export interface DeceasedDto {
    id?: string; // Guid
    firstName?: string;
    lastName?: string;
    salutation?: string;
    dob?: string; // ISO date
    placeOfBirth?: string;
    postalCode?: string;
    street?: string;
    houseNumber?: string;
    houseNumberAddition?: string;
    city?: string;
    county?: string;
    homeDeceased?: boolean;
}

export interface DeathInfoDto {
    id?: string; // Guid
    dateOfDeath?: string; // ISO date
    timeOfDeath?: string; // ISO time
    locationOfDeath?: string;
    postalCodeOfDeath?: string;
    streetOfDeath?: string;
    houseNumberOfDeath?: string;
    houseNumberAdditionOfDeath?: string;
    cityOfDeath?: string;
    countyOfDeath?: string;
    bodyFinding?: string;
    origin?: string;
}

export interface DossierDto {
    id?: string; // Guid
    funeralLeader?: string;
    funeralNumber?: string;
    funeralType?: string;
    voorregeling?: boolean;
    dossierCompleted?: boolean;
    deceased?: DeceasedDto;
    deathInfo?: DeathInfoDto;
}

// Create new dossier
export async function createNewDossier(request: DossierDto): Promise<DossierDto> {
    return apiClient<DossierDto>(`${endpoints.dossier}/new`, {
        method: "POST",
        body: request,
    });
}

// Get dossier by Id
export async function getDossier(id: string): Promise<DossierDto> {
    return apiClient<DossierDto>(`${endpoints.dossier}/${id}`, {
        method: "GET",
    });
}

// Update dossier (partial update)
export async function updateDossier(id: string, request: Partial<DossierDto>): Promise<DossierDto> {
    return apiClient<DossierDto>(`${endpoints.dossier}/${id}`, {
        method: "PATCH",
        body: request,
    });
}