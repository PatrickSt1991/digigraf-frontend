import { endpoints } from "./apiConfig";
import apiClient from "./apiClient";
import { Salutation } from "../types";


export async function getSalutations(): Promise<Salutation[]> {
    return apiClient<Salutation[]>(endpoints.salutation, {
        method: "GET",
    });
}