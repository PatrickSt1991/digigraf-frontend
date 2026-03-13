import React from "react";
import FormCard from "./FormCard";
import FormField from "./FormField";
import { useDropdownData } from "../hooks";
import { FuneralLeaderDto } from "../types";
import { endpoints } from "../api/apiConfig";

type FuneralFormProps = {
  formData: {
    funeralLeader: string;
    funeralNumber: string;
  };
  onChange?: (e: React.ChangeEvent<any>) => void;
  readOnly?: boolean;
  onNext?: (e?: React.FormEvent) => void;
  onBack?: (e?: React.FormEvent) => void;
  onComplete?: (e?: React.FormEvent) => void;
  onSaveAndClose?: (e?: React.FormEvent) => void;
  isLastStep?: boolean;
};

export default function FuneralForm({
  formData,
  onChange,
  readOnly = false,
  onNext,
  onBack,
  onComplete,
  onSaveAndClose,
  isLastStep = false,
}: FuneralFormProps) {
  const { data, loading: dropdownLoading, errors: dropdownErrors } = useDropdownData({
    funeralLeaders: endpoints.funeralLeaders,
  });

  const funeralLeaders: FuneralLeaderDto[] = data.funeralLeaders || [];

  return (
    <FormCard title="Uitvaart">
      <div className="grid grid-cols-2 gap-8">
        {/* existing fields unchanged */}
      </div>

      <div className="mt-6 flex justify-end space-x-4">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="bg-gray-400 text-white px-6 py-2 rounded hover:bg-gray-500 transition"
          >
            Terug
          </button>
        )}

        {isLastStep ? (
          <>
            {onSaveAndClose && (
              <button
                type="button"
                onClick={onSaveAndClose}
                className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700 transition"
              >
                Opslaan en sluiten
              </button>
            )}

            {onComplete && (
              <button
                type="button"
                onClick={onComplete}
                className="py-2 px-6 rounded-md bg-green-600 text-white hover:bg-green-700 transition-colors"
              >
                Afronden
              </button>
            )}
          </>
        ) : (
          onNext && (
            <button
              type="button"
              onClick={onNext}
              className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700 transition"
            >
              Volgende
            </button>
          )
        )}
      </div>
    </FormCard>
  );
}