import apiClient from "./apiClient";
import { licenseEndpoints } from "./apiConfig";
import { LicenseInfo } from "../types";

export async function getLicenseInfo(): Promise<LicenseInfo> {
  return apiClient<LicenseInfo>(licenseEndpoints.licenseInfo, {
    method: "GET",
    credentials: "include",
  });
}

export async function activateLicenseKey(
  licenseKey: string
): Promise<{ message: string }> {
  return apiClient<{ message: string }>(licenseEndpoints.licenseValidateKey, {
    method: "POST",
    credentials: "include",
    body: { licenseKey },
  });
}

export async function uploadLicenseFile(
  file: File
): Promise<{ message: string }> {
  const formData = new FormData();
  formData.append("licenseFile", file);

  const res = await fetch(licenseEndpoints.licenseUpload, {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  const result = await res.json();

  if (!res.ok) {
    throw new Error(result.message || "Upload failed");
  }

  return result;
}