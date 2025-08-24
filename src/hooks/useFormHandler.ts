import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface UseFormHandlerProps<T> {
  initialData: T;
  steps: string[];
  dateFieldName: string;
  calculateAge: (birthDate: string, deathDate?: string) => number;
  deathDateFieldName?: string; // optional, if you want to calculate against deathDate
}

export const useFormHandler = <T extends Record<string, any>>({
  initialData,
  steps,
  dateFieldName,
  calculateAge
}: UseFormHandlerProps<T>) => {
  const [formData, setFormData] = useState<T>(initialData);
  const [result, setResult] = useState<T | null>(null);
  const navigate = useNavigate();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const calculatedAge = calculateAge(value);
    
    setFormData(prev => ({
      ...prev,
      [name]: value,
      age: calculatedAge.toString()
    }));
  };

  const handleSubmit = async (e?: React.FormEvent, goToStep?: string) => {
    e?.preventDefault();
    setResult(formData);

    if (goToStep)
      navigate(goToStep);
  };

  const goNext = (currentStep: string) => {
    const index = steps.indexOf(currentStep);
    if (index >= 0 && index < steps.length -1) {
      handleSubmit(undefined, steps[index + 1]);
    }
  };

  const goBack = (currentStep: string) => {
    const index = steps.indexOf(currentStep);
    if (index > 0) {
      handleSubmit(undefined, steps[index - 1]);
    }
  };

  const resetForm = () => {
    setFormData(initialData);
    setResult(null);
  };

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