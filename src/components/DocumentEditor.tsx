import React from "react";
import { FormField } from "../components";
import { DocumentTemplate } from "../types";

interface DocumentEditorProps {
  template: DocumentTemplate;
  onChange: (updated: DocumentTemplate | ((prev: DocumentTemplate) => DocumentTemplate)) => void;
  onSave: () => void;
}

export const DocumentEditor: React.FC<DocumentEditorProps> = ({ template, onChange, onSave }) => {
  const handleFieldChange = (fieldKey: string, value: any) => {
    onChange((prev) => ({
      ...prev,
      fields: {
        ...prev.fields,
        [fieldKey]: {
          ...prev.fields[fieldKey],
          value,
        },
      },
    }));
  };

  return (
    <div className="space-y-4">
      {Object.entries(template.fields).map(([key, field]) => (
        <FormField key={key} label={field.label}>
          {field.type === "textarea" ? (
            <textarea
              name={key}
              value={field.value}
              onChange={(e) => handleFieldChange(key, e.target.value)}
              className="w-full border-0 border-b border-gray-300 rounded-none focus:ring-0 focus:border-gray-900"
            />
          ) : field.type === "checkbox" ? (
            <input
              type="checkbox"
              name={key}
              checked={field.value}
              onChange={(e) => handleFieldChange(key, e.target.checked)}
              className="rounded"
            />
          ) : field.type === "list" ? (
            <input
              type="text"
              name={key}
              value={Array.isArray(field.value) ? field.value.join(", ") : ""}
              onChange={(e) =>
                handleFieldChange(
                  key,
                  e.target.value.split(",").map((s) => s.trim())
                )
              }
              className="w-full border-0 border-b border-gray-300 rounded-none focus:ring-0 focus:border-gray-900"
            />
          ) : (
            <input
              type="text"
              name={key}
              value={field.value}
              onChange={(e) => handleFieldChange(key, e.target.value)}
              className="w-full border-0 border-b border-gray-300 rounded-none focus:ring-0 focus:border-gray-900"
            />
          )}
        </FormField>
      ))}

      <div className="pt-4">
        <button
          type="button"
          onClick={onSave}
          className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
        >
          Opslaan
        </button>
      </div>
    </div>
  );
};