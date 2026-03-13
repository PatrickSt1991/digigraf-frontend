import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../api/apiClient";

interface UseSaveAndNextProps<T, R = any, S = Record<string, any> | undefined> {
  formData: T;
  endpoint: string;
  id?: string;
  getNextPath?: (result: R, currentId?: string) => string;
  getClosePath?: (result: R, currentId?: string) => string;
  getCompletePath?: (result: R, currentId?: string) => string;
  getNextState?: (result: R, currentId?: string) => S;
  getCloseState?: (result: R, currentId?: string) => S;
  getCompleteState?: (result: R, currentId?: string) => S;
}

export function useSaveAndNext<T, R = any, S = Record<string, any> | undefined>({
  formData,
  endpoint,
  id,
  getNextPath,
  getClosePath,
  getCompletePath,
  getNextState,
  getCloseState,
  getCompleteState,
}: UseSaveAndNextProps<T, R, S>) {
  const navigate = useNavigate();

  const save = useCallback(async () => {
    return apiClient<R>(endpoint, {
      method: id ? "PUT" : "POST",
      body: formData,
    });
  }, [formData, endpoint, id]);

  const handleNext = useCallback(async () => {
    if (!getNextPath) return;

    try {
      const result = await save();
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
  }, [save, getNextPath, getNextState, id, navigate]);

  const handleSaveAndClose = useCallback(async () => {
    try {
      const result = await save();
      const closePath = getClosePath ? getClosePath(result, id) : "/dashboard";
      const closeState = getCloseState ? getCloseState(result, id) : undefined;

      navigate(closePath, {
        state: closeState,
      });
    } catch (err) {
      console.error(err);
      const msg = err instanceof Error ? err.message : "Onbekende fout";
      alert(`Fout bij opslaan: ${msg}`);
    }
  }, [save, getClosePath, getCloseState, id, navigate]);

  const handleComplete = useCallback(async () => {
    try {
      const result = await save();
      const completePath = getCompletePath
        ? getCompletePath(result, id)
        : "/success-deceased";
      const completeState = getCompleteState
        ? getCompleteState(result, id)
        : undefined;

      navigate(completePath, {
        state: completeState,
      });
    } catch (err) {
      console.error(err);
      const msg = err instanceof Error ? err.message : "Onbekende fout";
      alert(`Fout bij opslaan: ${msg}`);
    }
  }, [save, getCompletePath, getCompleteState, id, navigate]);

  return {
    handleNext,
    handleSaveAndClose,
    handleComplete,
  };
}