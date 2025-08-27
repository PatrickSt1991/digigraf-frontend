import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

interface UseFormHandlerProps<T extends Record<string, any> & { age: string }> {
  initialData: T;
  steps: string[];
  dateFieldName: string;
  calculateAge: (birthDate: string, deathDate?: string) => number;
  deathDateFieldName?: string; // optional, if you want to calculate against deathDate
}

export const useFormHandler = <T extends Record<string, any> & { age: string }>({
  initialData,
  steps,
  dateFieldName,
  calculateAge,
  deathDateFieldName
}: UseFormHandlerProps<T>) => {
  const [formData, setFormData] = useState<T>(initialData);
  const [result, setResult] = useState<T | null>(null);
  const navigate = useNavigate();

  const handleChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  }, []);

  const handleDateChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => {
      const updatedData = { ...prev, [name]: value };
      
      // Only calculate age if we're changing the birth date and we have a valid birth date
      if (name === dateFieldName && value) {
        try {
          // Use death date if available, otherwise calculate age as of today
          const deathDate = deathDateFieldName ? updatedData[deathDateFieldName] : undefined;
          const calculatedAge = calculateAge(value, deathDate);
          
          if (!isNaN(calculatedAge) && calculatedAge >= 0) {
            (updatedData as any).age = calculatedAge.toString();
          }
        } catch (error) {
          console.warn('Age calculation failed:', error);
          // Don't update age if calculation fails
        }
      }
      
      // If we're updating death date and we have a birth date, recalculate age
      if (name === deathDateFieldName && value && updatedData[dateFieldName]) {
        try {
          const calculatedAge = calculateAge(updatedData[dateFieldName], value);
          if (!isNaN(calculatedAge) && calculatedAge >= 0) {
            (updatedData as any).age = calculatedAge.toString();
          }
        } catch (error) {
          console.warn('Age calculation failed:', error);
        }
      }
      
      return updatedData;
    });
  }, [dateFieldName, deathDateFieldName, calculateAge]);

  const handleSubmit = useCallback(async (e?: React.FormEvent, goToStep?: string) => {
    e?.preventDefault();
    setResult(formData);

    if (goToStep)
      navigate(goToStep);
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
    setFormData
  };
};