import { endpoints } from "./apiConfig";
import apiClient from "./apiClient";
import { SalutationDto } from "../DTOs";


export async function getSalutations(): Promise<SalutationDto[]> {
    return apiClient<SalutationDto[]>(endpoints.salutation, {
        method: "GET",
    });
}