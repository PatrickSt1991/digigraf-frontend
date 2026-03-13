import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import { DocumentTemplate, Section } from "../../types";
import {
  DashboardLayout,
  FormCard,
  FuneralForm,
  DocumentEditorModal,
} from "../../components";
import { useFormHandler } from "../../hooks";
import { endpoints } from "../../api/apiConfig";

type DeceasedDocumentsFormData = {
  id?: string;
  funeralLeader: string;
  funeralNumber: string;
  templates?: DocumentTemplate[];
};

export default function DeceasedDocuments() {
  const { dossierId } = useParams<{ dossierId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const navState = location.state as
    | {
        dossierId?: string;
        funeralLeader?: string;
        funeralNumber?: string;
      }
    | undefined;

  const {
    formData,
    handleChange,
    goNext,
    goBack,
    setFormData,
    loading,
    error,
  } = useFormHandler<DeceasedDocumentsFormData>({
    initialData: {
      id: dossierId ?? "",
      funeralLeader: navState?.funeralLeader ?? "",
      funeralNumber: navState?.funeralNumber ?? "",
      templates: [],
    },
    steps: ["/deceased-funeral", "/deceased-documents", "/deceased-invoice", "/success-deceased",],
    fetchUrl: dossierId
      ? `${endpoints.documentsdeceased}/${dossierId}`
      : `${endpoints.documentsdefault}`,
    allow404AsEmpty: true,
  });

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

    const updatedSections: Section[] = activeTemplate.sections.map((s) =>
      s.label === "Body" ? { ...s, value: updatedBody } : s
    );

    const updatedTemplate: DocumentTemplate = {
      ...activeTemplate,
      sections: updatedSections,
    };

    try {
      await fetch(`${endpoints.documentsdeceased}/${activeTemplate.id}`, {
        method: "PUT",
        body: JSON.stringify(updatedTemplate),
        headers: { "Content-Type": "application/json" },
      });

      setFormData((prev) => ({
        ...prev,
        templates: prev.templates?.map((t) =>
          t.id === activeTemplate.id ? updatedTemplate : t
        ),
      }));

      setModalOpen(false);
      alert("Template saved!");
    } catch (err) {
      console.error(err);
      alert("Failed to save template");
    }
  };

  const handlePrint = async (template: DocumentTemplate) => {
    window.open(`${endpoints.documentsdeceased}/${template.id}/print`, "_blank");
  };

  const handleEmail = async (template: DocumentTemplate) => {
    window.open(`${endpoints.documentsdeceased}/${template.id}/email`, "_blank");
  };

  if (loading) return <div>Loading documents...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <DashboardLayout>
      <div className="px-8 pb-8 max-w-8xl mx-auto space-y-6">
      <FuneralForm
        formData={formData}
        onChange={handleChange}
        onNext={() =>
          goNext(location.pathname, {
            dossierId: dossierId ?? formData.id ?? "",
            funeralLeader: formData.funeralLeader ?? "",
            funeralNumber: formData.funeralNumber ?? "",
          })
        }
        onBack={() =>
          goBack(location.pathname, {
            dossierId: dossierId ?? formData.id ?? "",
            funeralLeader: formData.funeralLeader ?? "",
            funeralNumber: formData.funeralNumber ?? "",
          })
        }
        readOnly={true}
        navigationActions={[
          { label: "Dashboard", onClick: () => navigate("/dashboard") },
          { label: "Overledene", onClick: () => navigate(`/deceased/${dossierId}`) },
          { label: "Opdrachtgever", onClick: () => navigate(`/deceased-information/${dossierId}`) },
          { label: "Verzekeringen", onClick: () => navigate(`/deceased-insurance/${dossierId}`) },
          { label: "Opbaren", onClick: () => navigate(`/deceased-layout/${dossierId}`) },
          { label: "Condoleance", onClick: () => navigate(`/deceased-funeral/${dossierId}`) },
          { label: "Kostenbegroting ", onClick: () => navigate(`/deceased-invoice/${dossierId}`) },
          { label: "Diensten", onClick: () => navigate(`/deceased-services/${dossierId}`) },
        ]}
      />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(formData.templates || []).map((template) => (
            <FormCard key={template.id} title={template.title}>
              <div className="flex gap-3 mt-4 flex-wrap">
                <button
                  type="button"
                  onClick={() => openEditor(template)}
                  className="px-4 py-2 rounded-xl border border-green-600 bg-green-600 text-white hover:bg-green-700 transition"
                >
                  {template.overledeneId ? "Bewerken" : "Openen"}
                </button>

                {template.overledeneId && (
                  <>
                    <button
                      type="button"
                      onClick={() => handlePrint(template)}
                      className="px-4 py-2 rounded-xl border border-gray-300 bg-gray-100 text-gray-800 hover:bg-gray-200 hover:text-gray-900 transition"
                    >
                      Printen
                    </button>
                    <button
                      type="button"
                      onClick={() => handleEmail(template)}
                      className="px-4 py-2 rounded-xl border border-blue-500 bg-blue-500 text-white hover:bg-blue-600 transition"
                    >
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
              (s) => s.label?.trim().toLowerCase() === "body"
            )?.value || ""
          }
          header={
            activeTemplate?.sections.find(
              (s) => s.label?.trim().toLowerCase() === "header"
            )?.value
          }
          footer={
            activeTemplate?.sections.find(
              (s) => s.label?.trim().toLowerCase() === "footer"
            )?.value
          }
          onSave={handleSave}
          key={activeTemplate?.id}
        />
      </div>
    </DashboardLayout>
  );
}