import { endpoints } from "./apiConfig";
import apiClient from "./apiClient";
import { Salutation, FuneralType } from "../types";


export async function getSalutations(): Promise<Salutation[]> {
    return apiClient<Salutation[]>(endpoints.salutation, {
        method: "GET",
    });
}

export async function getFuneralTypes(): Promise<FuneralType[]> {
    return apiClient<FuneralType[]>(endpoints.funeralTypes, {
        method: "GET",
    });
}