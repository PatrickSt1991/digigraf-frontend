import React from "react";
import FormCard from "./FormCard";
import FormField from "./FormField";
import { useDropdownData } from "../hooks";
import { FuneralLeaderDto } from "../DTOs";
import { endpoints } from "../api/apiConfig";

type FuneralFormProps = {
  formData: {
    funeralLeader: string;
    funeralNumber: string;
  };
  onChange?: (e: React.ChangeEvent<any>) => void;
  readOnly?: boolean;
  onNext?: (e: React.FormEvent) => void;
  onBack?: (e: React.FormEvent) => void;
};

export default function FuneralForm({
  formData,
  onChange,
  readOnly = false,
  onNext,
  onBack,
}: FuneralFormProps) {
  const { data, loading, error }   = useDropdownData({
    funeralLeaders: endpoints.funeralLeaders,
  });

  const funeralLeaders: FuneralLeaderDto[] = data.funeralLeaders || [];

  return (
    <FormCard title="Uitvaart">
      <div className="grid grid-cols-2 gap-8">
        <FormField label="Uitvaartverzorger aanname" required>
          {readOnly ? (
            <div className="w-full border-0 border-b rounded-none border-gray-100">
              {formData.funeralLeader}
            </div>
          ) : loading ? (
            <div>Loading...</div>
          ) : error ? (
            <div className="text-red-600">{ error }</div>
          ) : (
            <select
              name="funeralLeader"
              value={formData.funeralLeader}
              onChange={onChange}
              className="w-full border-0 border-b border-gray-300 rounded-none focus:ring-0 focus:border-gray-900"
            >
              <option value="">Selecteer een uitvaartleider...</option>
              {funeralLeaders.map((ft) => (
                <option key={ft.id} value={ft.value}>
                  {ft.label}
                </option>
              ))}
            </select>
          )}
        </FormField>

        <FormField label="Uitvaart nummer" required>
          {readOnly ? (
            <div className="w-full border-0 border-b rounded-none border-gray-100">
              {formData.funeralNumber}
            </div>
          ) : (
            <input
              name="funeralNumber"
              value={formData.funeralNumber}
              onChange={onChange}
              className="w-full border-0 border-b border-gray-300 rounded-none focus:ring-0 focus:border-gray-900"
            />
          )}
        </FormField>
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
        {onNext && (
          <button
            type="submit"
            onClick={onNext}
            className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700 transition"
          >
            Volgende
          </button>
        )}
      </div>
    </FormCard>
  );
}