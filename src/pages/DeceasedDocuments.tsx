import { useParams, useLocation } from "react-router-dom";
import { useState } from "react";
import { DocumentTemplate, Section } from "../types";
import { DashboardLayout, FormCard, FuneralForm, DocumentEditorModal } from "../components";
import { useFormHandler } from "../hooks";
import { endpoints } from "../api/apiConfig";

export default function DeceasedDocuments() {
  const { overledeneId } = useParams<{ overledeneId: string }>();
  const location = useLocation();

  const {
    formData,
    handleChange,
    goNext,
    goBack,
    setFormData,
    loading,
    error,
  } = useFormHandler<{
    funeralLeader: string;
    funeralNumber: string;
    templates?: DocumentTemplate[];
  }>({
    initialData: { funeralLeader: "", funeralNumber: "", templates: [] },
    steps: ["/funeral-information", "/funeral-documents", "/invoice", "/success-deceased"],
    fetchUrl: overledeneId
      ? `${endpoints.documentsdeceased}/${overledeneId}`
      : `${endpoints.documentsdefault}`,
  });

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTemplate, setActiveTemplate] = useState<DocumentTemplate | null>(null);

const openEditor = (template: DocumentTemplate) => {
  setActiveTemplate(template);
  setTimeout(() => {
    setModalOpen(true);
  }, 0);
};

  const handleSave = async (updatedBody: string) => {
    if (!activeTemplate) return;
    // Update the Body section
    const updatedSections: Section[] = activeTemplate.sections.map(s =>
      s.label === "Body" ? { ...s, value: updatedBody } : s
    );
console.log(updatedSections);
    const updatedTemplate: DocumentTemplate = { ...activeTemplate, sections: updatedSections };

    try {
      await fetch(`/api/documenttemplates/${activeTemplate.id}`, {
        method: "PUT",
        body: JSON.stringify(updatedTemplate),
        headers: { "Content-Type": "application/json" },
      });

      // Update FE state
      const updatedTemplates = formData.templates?.map(t =>
        t.id === activeTemplate.id ? updatedTemplate : t
      );
      setFormData({ ...formData, templates: updatedTemplates });

      setModalOpen(false);
      alert("Template saved!");
    } catch (err) {
      console.error(err);
      alert("Failed to save template");
    }
  };


  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <DashboardLayout>
      <div className="px-8 pb-8 max-w-8xl mx-auto space-y-6">
        <FuneralForm
          formData={formData}
          onChange={handleChange}
          onNext={() => goNext(location.pathname)}
          onBack={() => goBack(location.pathname)}
          readOnly={true}
        />

        <div className="grid grid-cols-3 gap-4">
          {(formData.templates || []).map(template => (
            <FormCard key={template.id} title={template.title}>
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => openEditor(template)}
                  className="px-4 py-2 rounded-xl border border-green-600 bg-green-600 text-white hover:bg-green-700 transition"
                >
                  {template.overledeneId ? "Bewerken" : "Openen"}
                </button>

                {template.overledeneId && (
                  <>
                    <button className="px-4 py-2 rounded-xl border border-gray-300 bg-gray-100 text-gray-800 hover:bg-gray-200 hover:text-gray-900 transition">
                      Printen
                    </button>
                    <button className="px-4 py-2 rounded-xl border border-blue-500 bg-blue-500 text-white hover:bg-blue-600 transition">
                      Email
                    </button>
                  </>
                )}
              </div>
            </FormCard>
          ))}
        </div>

        
          {(!formData.templates || formData.templates.length === 0) && (
            <FormCard title="">
              <div>No document templates found for this deceased.</div>
            </FormCard>
          )}
        
          <DocumentEditorModal
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            title={activeTemplate?.title || ""}
            initialContent={
              activeTemplate?.sections.find(
                s => s.label?.trim().toLowerCase() === "body"
              )?.value || ""
            }
            header={
              activeTemplate?.sections.find(
                s => s.label?.trim().toLowerCase() === "header"
              )?.value
            }
            footer={
              activeTemplate?.sections.find(
                s => s.label?.trim().toLowerCase() === "footer"
              )?.value
            }
            onSave={handleSave}
            key={activeTemplate?.id} // Add this key to force re-render when template changes
          />
      </div>
    </DashboardLayout>
  );
}
