import React, { useEffect, useRef, useState } from "react";
import FormCard from "./FormCard";
import FormField from "./FormField";
import { useDropdownData } from "../hooks";
import { FuneralLeaderDto } from "../types";
import { endpoints } from "../api/apiConfig";

type FuneralFormNavAction = {
  label: string;
  onClick: () => void;
};

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
  navigationActions?: FuneralFormNavAction[];
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
  navigationActions = [],
  isLastStep = false,
}: FuneralFormProps) {
  const { data, loading: dropdownLoading, errors: dropdownErrors } = useDropdownData({
    funeralLeaders: endpoints.funeralLeaders,
  });

  const funeralLeaders: FuneralLeaderDto[] = data.funeralLeaders || [];

  const [showNavMenu, setShowNavMenu] = useState(false);
  const navMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        navMenuRef.current &&
        !navMenuRef.current.contains(event.target as Node)
      ) {
        setShowNavMenu(false);
      }
    };

    if (showNavMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showNavMenu]);

  return (
    <FormCard title="Uitvaart">
      <div className="grid grid-cols-2 gap-8">
        <FormField label="Uitvaartverzorger aanname" required>
          {readOnly ? (
            <div className="w-full border-0 border-b rounded-none border-gray-100">
              {formData.funeralLeader}
            </div>
          ) : dropdownLoading.funeralLeaders ? (
            <div>Loading...</div>
          ) : dropdownErrors.funeralLeaders ? (
            <div className="text-red-600">{ dropdownErrors.funeralLeaders }</div>
          ) : (
            <select
              name="funeralLeader"
              value={formData.funeralLeader}
              onChange={onChange}
              className="w-full border-0 border-b border-gray-300 rounded-none focus:ring-0 focus:border-gray-900"
            >
              <option value="">Selecteer een uitvaartleider...</option>
              {funeralLeaders.map((ft) => (
                <option key={ft.id} value={ft.label}>
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

<div className="mt-6 flex items-center justify-between">
  <div>
    {navigationActions.length > 0 && (
      <div className="relative" ref={navMenuRef}>
        <button
          type="button"
          onClick={() => setShowNavMenu((prev) => !prev)}
          className="bg-white border border-red-600 text-red-600 px-6 py-2 rounded hover:bg-red-50 transition"
        >
          Snel naar ▾
        </button>

        {showNavMenu && (
          <div className="absolute left-0 top-full mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-2 overflow-hidden">
            {navigationActions.map((action) => (
              <button
                key={action.label}
                type="button"
                onClick={() => {
                  setShowNavMenu(false);
                  action.onClick();
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-red-50 transition"
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
    )}
  </div>

  <div className="flex items-center space-x-4">
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
</div>
    </FormCard>
  );
}