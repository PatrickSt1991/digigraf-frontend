import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { InvoiceFormData } from "../types/invoiceTypes";
import apiClient from "../api/apiClient";

interface UseFormHandlerProps<T extends Record<string, any> & { age?: string }> {
  initialData: T;
  steps: string[];
  dateFieldName?: string;
  calculateAge?: (birthDate: string, deathDate?: string) => number;
  deathDateFieldName?: string;
  fetchUrl?: string;
  allow404AsEmpty?: boolean;
}

type ChangeEventLike =
  | React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  | { target: { name: string; value: any } }
  | Partial<InvoiceFormData>;

export const useFormHandler = <
  T extends Record<string, any> & { age?: string }
>({
  initialData,
  steps,
  dateFieldName,
  calculateAge,
  deathDateFieldName,
  fetchUrl,
  allow404AsEmpty = false,
}: UseFormHandlerProps<T>) => {
  const [formData, setFormData] = useState<T>(initialData);
  const [result, setResult] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(!!fetchUrl);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    if (!fetchUrl) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setError(null);

        const data = await apiClient<T>(fetchUrl, {
          method: "GET",
        });

        setFormData((prev) => ({
          ...prev,
          ...data,
        }));
      } catch (err: any) {
        const message = err?.message || "Unknown error";

        if (allow404AsEmpty && message.includes("404")) {
          setFormData((prev) => ({
            ...initialData,
            ...prev,
          }));
          return;
        }

        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [fetchUrl, allow404AsEmpty]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, type, value } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    const finalValue = type === "checkbox" ? checked : value;

    setFormData((prev: any) => {
      const keys = name.split(".");
      const next = structuredClone(prev);
      let current = next;

      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }

      current[keys[keys.length - 1]] = finalValue;
      return next;
    });
  };

  const handleDateChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev: any) => {
      const keys = name.split(".");
      const next = structuredClone(prev);
      let current = next;

      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }

      current[keys[keys.length - 1]] = value;
      return next;
    });
  };

  const handleSubmit = useCallback(
    async (e?: React.FormEvent, goToStep?: string) => {
      e?.preventDefault();
      setResult(formData);

      if (goToStep) navigate(goToStep);
    },
    [formData, navigate]
  );

  const goNext = useCallback(
    (currentStep: string, state?: any) => {
      const normalizedStep = "/" + currentStep.split("/")[1];
      const index = steps.indexOf(normalizedStep);

      if (index >= 0 && index < steps.length - 1) {
        const nextStep = steps[index + 1];
        const nextPath =
          state?.dossierId && nextStep !== "/success-deceased"
            ? `${nextStep}/${state.dossierId}`
            : nextStep;

        navigate(nextPath, { state });
      }
    },
    [steps, navigate]
  );

  const goBack = useCallback(
    (currentStep: string, state?: any) => {
      const normalizedStep = "/" + currentStep.split("/")[1];
      const index = steps.indexOf(normalizedStep);

      if (index > 0) {
        const previousStep = steps[index - 1];
        const previousPath =
          state?.dossierId && previousStep !== "/success-deceased"
            ? `${previousStep}/${state.dossierId}`
            : previousStep;

        navigate(previousPath, { state });
      }
    },
    [steps, navigate]
  );

  const resetForm = useCallback(() => {
    setFormData(initialData);
    setResult(null);
  }, [initialData]);

  return {
    formData,
    result,
    handleChange,
    handleDateChange,
    handleSubmit,
    goNext,
    goBack,
    resetForm,
    setFormData,
    loading,
    error,
  };
};