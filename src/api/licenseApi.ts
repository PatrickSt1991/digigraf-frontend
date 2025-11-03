import apiClient from "./apiClient";
import { licenseEndpoints } from "./apiConfig";
import { LicenseInfo } from "../types/license";

export async function getLicenseInfo(): Promise<LicenseInfo> {
    return apiClient<LicenseInfo>(licenseEndpoints.licenseInfo, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
    });
}

export async function activateLicenseKey(licenseKey: string): Promise<{ message: string }> {
  return apiClient<{ message: string }>(licenseEndpoints.licenseValidateKey, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
      "Content-Type": "application/json",
    },
    body: { licenseKey },
  });
}

export async function uploadLicenseFile(file: File): Promise<{ message: string }> {
  const formData = new FormData();
  formData.append("licenseFile", file);

  const res = await fetch(licenseEndpoints.licenseUpload, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: formData,
  });

  const result = await res.json();
  if (!res.ok) {
    throw new Error(result.message || "Upload failed");
  }

  return result;
}