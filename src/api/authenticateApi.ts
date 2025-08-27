import { endpoints } from "./apiConfig";
import apiClient from "./apiClient";
import { AuthResponseDto } from "../DTOs";


export async function loginUser(email: string, password: string): Promise<AuthResponseDto> {
  return apiClient<AuthResponseDto>(`${endpoints.authentication}/login`, {
    method: "POST",
    body: { email, password },
  });
}