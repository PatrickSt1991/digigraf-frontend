import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../api/apiClient";

interface UseSaveAndNextProps<T, R = any, S = Record<string, any> | undefined> {
  formData: T;
  endpoint: string;
  id?: string;
  getNextPath: (result: R, currentId?: string) => string;
  getNextState?: (result: R, currentId?: string) => S;
}

export function useSaveAndNext<T, R = any, S = Record<string, any> | undefined>({
  formData,
  endpoint,
  id,
  getNextPath,
  getNextState,
}: UseSaveAndNextProps<T, R, S>) {
  const navigate = useNavigate();

  const handleNext = useCallback(async () => {
    try {
      const result = await apiClient<R>(endpoint, {
        method: id ? "PUT" : "POST",
        body: formData,
      });

      const nextPath = getNextPath(result, id);
      const nextState = getNextState ? getNextState(result, id) : undefined;

      navigate(nextPath, {
        state: nextState,
      });
    } catch (err) {
      console.error(err);
      const msg = err instanceof Error ? err.message : "Onbekende fout";
      alert(`Fout bij opslaan: ${msg}`);
    }
  }, [formData, endpoint, id, getNextPath, getNextState, navigate]);

  return handleNext;
}