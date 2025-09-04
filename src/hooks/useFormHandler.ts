import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { InvoiceFormData } from '../types/invoiceTypes';

interface UseFormHandlerProps<T extends Record<string, any> & { age?: string }> {
  initialData: T;
  steps: string[];
  dateFieldName?: string;
  calculateAge?: (birthDate: string, deathDate?: string) => number;
  deathDateFieldName?: string;
  fetchUrl?: string; // optional: if provided, hook fetches data
}

export const useFormHandler = <T extends Record<string, any> & { age?: string }>({
  initialData,
  steps,
  dateFieldName,
  calculateAge,
  deathDateFieldName,
  fetchUrl
}: UseFormHandlerProps<T>) => {
  const [formData, setFormData] = useState<T>(initialData);
  const [result, setResult] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(!!fetchUrl);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  // Fetch existing data if fetchUrl is given
  useEffect(() => {
    if (!fetchUrl) return;

    const fetchData = async () => {
      try {
        const res = await fetch(fetchUrl);
        if (!res.ok) throw new Error("Failed to fetch data");
        const data = await res.json();

        // Merge API data with initial form data
        setFormData(prev => ({
          ...prev,
          ...data,
        }));
      } catch (err: any) {
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [fetchUrl]);

const handleChange = useCallback((
  eOrObj: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement> | Partial<InvoiceFormData>
) => {
  if ("target" in eOrObj) {
    const { name, value, type } = eOrObj.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? (eOrObj.target as HTMLInputElement).checked : value,
    }));
  } else {
    // object update
    setFormData(prev => ({
      ...prev,
      ...eOrObj,
    }));
  }
}, []);


  const handleDateChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData(prev => {
      const updatedData = { ...prev, [name]: value };

      // only run age calculation if both props exist
      if (dateFieldName && calculateAge) {
        if (name === dateFieldName && value) {
          try {
            const deathDate = deathDateFieldName ? updatedData[deathDateFieldName] : undefined;
            const calculatedAge = calculateAge(value, deathDate);
            if (!isNaN(calculatedAge) && calculatedAge >= 0) {
              (updatedData as any).age = calculatedAge.toString();
            }
          } catch (error) {
            console.warn('Age calculation failed:', error);
          }
        }

        if (deathDateFieldName && name === deathDateFieldName && value && updatedData[dateFieldName]) {
          try {
            const calculatedAge = calculateAge(updatedData[dateFieldName], value);
            if (!isNaN(calculatedAge) && calculatedAge >= 0) {
              (updatedData as any).age = calculatedAge.toString();
            }
          } catch (error) {
            console.warn('Age calculation failed:', error);
          }
        }
      }

      return updatedData;
    });
  }, [dateFieldName, deathDateFieldName, calculateAge]);

  const handleSubmit = useCallback(async (e?: React.FormEvent, goToStep?: string) => {
    e?.preventDefault();
    setResult(formData);

    if (goToStep) navigate(goToStep);
  }, [formData, navigate]);

  const goNext = useCallback((currentStep: string) => {
    const index = steps.indexOf(currentStep);
    if (index >= 0 && index < steps.length - 1) {
      handleSubmit(undefined, steps[index + 1]);
    }
  }, [steps, handleSubmit]);

  const goBack = useCallback((currentStep: string) => {
    const index = steps.indexOf(currentStep);
    if (index > 0) {
      handleSubmit(undefined, steps[index - 1]);
    }
  }, [steps, handleSubmit]);

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
