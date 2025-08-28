import { useCallback } from "react";
import { useLocation } from "react-router-dom";
import apiClient from "../api/apiClient";

interface UseSaveAndNextProps<T> {
  formData: T;
  setFormData?: (data: T) => void;
  endpoint: string;
  id?: string;
  goNext: (currentPath: string) => void;
}

export function useSaveAndNext<T>({
  formData,
  endpoint,
  id,
  goNext,
}: UseSaveAndNextProps<T>) {
  const location = useLocation();

  const handleNext = useCallback(async () => {
    try {
      const url = id ? `${endpoint}/${id}` : endpoint;

      await apiClient(url, {
        method: id ? "PUT" : "POST",
        body: formData,
      });

      goNext(location.pathname);
    } catch (err) {
      console.error(err);
      const msg = err instanceof Error ? err.message : "Onbekende fout";
      alert(`Fout bij opslaan: ${msg}`);
    }
  }, [formData, endpoint, id, goNext, location.pathname]);

  return handleNext;
}
