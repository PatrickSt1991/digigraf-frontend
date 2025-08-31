import { useParams, useLocation } from "react-router-dom";
import { useState } from "react";
import { DocumentTemplate, Section } from "../types";
import { DashboardLayout, FormCard, FuneralForm, DocumentEditorModal } from "../components";
import { useFormHandler } from "../hooks";
import { endpoints } from "../api/apiConfig";

export default function FuneralDocuments() {
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
    steps: ["/funeral-information", "/funeral-documents", "/next-step", "/success-deceased"],
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

console.log("Opening template:", activeTemplate);
console.log("Body section:", activeTemplate?.sections.find(s => s.label === "Body"));


  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <DashboardLayout>
      <div className="p-8 max-w-6xl mx-auto space-y-6">
        <FuneralForm
          formData={formData}
          onChange={handleChange}
          onNext={() => goNext(location.pathname)}
          onBack={() => goBack(location.pathname)}
          readOnly={true}
        />

        {(formData.templates || []).map(template => (
          <FormCard key={template.id} title={template.title}>
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => openEditor(template)}
                className="px-4 py-2 rounded-xl bg-green-600 text-white"
              >
                {template.overledeneId ? "Edit" : "Create"}
              </button>

              {template.overledeneId && (
                <>
                  <button className="px-4 py-2 rounded-xl border">Print</button>
                  <button className="px-4 py-2 rounded-xl border">Email</button>
                </>
              )}
            </div>
          </FormCard>
        ))}

        <FormCard title="">
          {(!formData.templates || formData.templates.length === 0) && (
            <div>No document templates found for this deceased.</div>
          )}
        </FormCard>
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
