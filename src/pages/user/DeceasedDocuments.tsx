import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import { DeceasedDocumentsFormData, DocumentTemplate, Section, CessieAction } from "../../types";
import {
  DashboardLayout,
  FormCard,
  FuneralForm,
  DocumentEditorModal,
  LoadingState,
  ErrorState,
} from "../../components";
import { useFormHandler } from "../../hooks";
import { endpoints } from "../../api/apiConfig";
import apiClient from "../../api/apiClient";
import { InsuranceSelectionModal } from "../../modals/user/InsuranceSelectionModal";

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}

function getFileName(response: Response, fallback: string): string {
  const disposition = response.headers.get("Content-Disposition");
  if (disposition) {
    const utf8Match = disposition.match(/filename\*=UTF-8''([^;]+)/i);
    if (utf8Match) return decodeURIComponent(utf8Match[1].trim());
    const plainMatch = disposition.match(/filename="?([^";]+)"?/i);
    if (plainMatch) return plainMatch[1].trim();
  }
  return fallback;
}

export default function DeceasedDocuments() {
  const { dossierId } = useParams<{ dossierId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const navState = location.state as
    | { dossierId?: string; funeralLeader?: string; funeralNumber?: string }
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
    steps: [
      "/deceased-funeral",
      "/deceased-documents",
      "/deceased-invoice",
      "/success-deceased",
    ],
    fetchUrl: dossierId
      ? `${endpoints.documentsdeceased}/${dossierId}`
      : `${endpoints.documentsdefault}`,
    allow404AsEmpty: true,
  });

  const [cessieModalOpen, setCessieModalOpen] = useState(false);
  const [cessieTemplate, setCessieTemplate] = useState<DocumentTemplate | null>(null);
  const [cessieAction, setCessieAction] = useState<CessieAction>("pdf");

  const isCessie = (template: DocumentTemplate) =>
    template.title.toLowerCase().includes("cessie");

  const [modalOpen, setModalOpen] = useState(false);
  const [activeTemplate, setActiveTemplate] = useState<DocumentTemplate | null>(null);

  const [downloadingDocx, setDownloadingDocx] = useState<string | null>(null);
  const [downloadingPdf, setDownloadingPdf] = useState<string | null>(null);

  const openEditor = (template: DocumentTemplate) => {
    if (isCessie(template)) {
      setCessieTemplate(template);
      setCessieAction("editor");
      setCessieModalOpen(true);
      return;
    }

    setActiveTemplate(template);
    setTimeout(() => setModalOpen(true), 0);
  };

  const openSelectedCessieEditor = (template: DocumentTemplate) => {
    setActiveTemplate(template);
    setCessieModalOpen(false);
    setTimeout(() => setModalOpen(true), 0);
  };

  const handleSave = async (updatedBody: string) => {
    if (!activeTemplate) return;

    const updatedSections: Section[] = activeTemplate.sections.map((s) =>
      s.label === "Body" || s.label === "body" ? { ...s, value: updatedBody } : s
    );

    const updatedTemplate: DocumentTemplate = {
      ...activeTemplate,
      sections: updatedSections,
    };

    try {
      await apiClient(`${endpoints.documentsdeceased}/${activeTemplate.id}`, {
        method: "PUT",
        body: updatedTemplate,
      });

      setFormData((prev) => ({
        ...prev,
        templates: prev.templates?.map((t) =>
          t.id === activeTemplate.id ? updatedTemplate : t
        ),
      }));

      setModalOpen(false);
      alert("Template opgeslagen!");
    } catch (err) {
      console.error(err);
      alert("Opslaan mislukt.");
    }
  };

  const handlePrint = (template: DocumentTemplate) => {
    if (isCessie(template)) {
      setCessieTemplate(template);
      setCessieAction("print");
      setCessieModalOpen(true);
      return;
    }

    window.open(`${endpoints.documentsdeceased}/${template.id}/print`, "_blank");
  };

  const handleDownloadPdf = async (template: DocumentTemplate) => {
    if (isCessie(template)) {
      setCessieTemplate(template);
      setCessieAction("pdf");
      setCessieModalOpen(true);
      return;
    }

    setDownloadingPdf(template.id);
    try {
      const response = await fetch(`${endpoints.documentsdeceased}/${template.id}/pdf`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("PDF genereren mislukt.");
      const blob = await response.blob();
      downloadBlob(blob, getFileName(response, `${template.title}.pdf`));
    } catch (err) {
      console.error(err);
      alert("PDF downloaden mislukt.");
    } finally {
      setDownloadingPdf(null);
    }
  };

  const handleDownloadDocx = async (template: DocumentTemplate) => {
    if (isCessie(template)) {
      setCessieTemplate(template);
      setCessieAction("docx");
      setCessieModalOpen(true);
      return;
    }

    setDownloadingDocx(template.id);
    try {
      const response = await fetch(`${endpoints.documentsdeceased}/${template.id}/docx`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Word-document genereren mislukt.");
      const blob = await response.blob();
      downloadBlob(blob, getFileName(response, `${template.title}.docx`));
    } catch (err) {
      console.error(err);
      alert("Word-document downloaden mislukt.");
    } finally {
      setDownloadingDocx(null);
    }
  };

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
            { label: "Kostenbegroting", onClick: () => navigate(`/deceased-invoice/${dossierId}`) },
            { label: "Diensten", onClick: () => navigate(`/deceased-services/${dossierId}`) },
          ]}
        />

        {loading ? (
          <LoadingState
            title="Documenten laden"
            message="Documenten worden geladen..."
          />
        ) : error ? (
          <ErrorState
            title="Fout bij laden"
            message={error}
          />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(formData.templates || [])
                .sort((a, b) => a.title.localeCompare(b.title))
                .map((template) => (
                  <FormCard key={template.id} title={template.title}>
                    <div className="flex gap-2 mt-4 flex-wrap">
                      <button
                        type="button"
                        onClick={() => openEditor(template)}
                        className="px-4 py-2 rounded-xl border border-green-600 bg-green-600 text-white hover:bg-green-700 transition"
                      >
                        {template.dossierId ? "Bewerken" : "Openen"}
                      </button>

                      {template.dossierId && (
                        <>
                          <button
                            type="button"
                            onClick={() => handlePrint(template)}
                            className="px-4 py-2 rounded-xl border border-gray-300 bg-gray-100 text-gray-800 hover:bg-gray-200 transition"
                          >
                            Printen
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDownloadPdf(template)}
                            disabled={downloadingPdf === template.id}
                            className="px-4 py-2 rounded-xl border border-red-500 bg-red-500 text-white hover:bg-red-600 disabled:opacity-60 transition"
                          >
                            {downloadingPdf === template.id ? "PDF downloaden..." : "PDF"}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDownloadDocx(template)}
                            disabled={downloadingDocx === template.id}
                            className="px-4 py-2 rounded-xl border border-blue-600 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 transition"
                          >
                            {downloadingDocx === template.id ? "Word downloaden..." : "Word"}
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
          </>
        )}

        {cessieTemplate && (
          <InsuranceSelectionModal
            isOpen={cessieModalOpen}
            dossierId={dossierId ?? ""}
            templateId={cessieTemplate.id}
            templateTitle={cessieTemplate.title}
            action={cessieAction}
            onClose={() => setCessieModalOpen(false)}
            onOpenEditor={openSelectedCessieEditor}
            key={cessieTemplate.id + cessieAction}
          />
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