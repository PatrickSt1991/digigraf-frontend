import { useLocation, useParams } from "react-router-dom";
import { DashboardLayout, FormCard, TitleCard, FuneralForm } from "../components";
import { useFormHandler } from "../hooks";
import apiClient from "../api/apiClient";
import { DocumentEditor } from "../components/DocumentEditor";
import { endpoints } from "../api/apiConfig";
import { DocumentTemplate } from "../types";

export default function FuneralDocuments() {
  const location = useLocation();
  const { overledeneId } = useParams<{ overledeneId: string }>();

  const {
    formData: template,
    setFormData: setTemplate,
    goNext,
    goBack,
    loading,
    error,
  } = useFormHandler<DocumentTemplate>({
    initialData: {
      funeralLeader: "",
      funeralNumber: "",
      title: "",
      fields: {},
    },
    steps: ["/layout-information", "/funeral-information", "/funeral-documents", "/success-deceased"],
    fetchUrl: overledeneId ? `${endpoints.documents}/${overledeneId}` : undefined,
  });

  const handleSave = async () => {
    if (!template) return;
    await apiClient(`/documents/${overledeneId}`, {
      method: "PUT",
      body: template,
    });
    alert("Document opgeslagen!");
  };

  return (
    <DashboardLayout>
      <div className="p-8 max-w-8xl mx-auto space-y-6">

        {/* Top navigation form */}
        <FuneralForm
          formData={template}
          onChange={() => {}} // readOnly so noop
          onNext={() => goNext(location.pathname)}
          onBack={() => goBack(location.pathname)}
          readOnly={true}
        />

        {loading && <div>Document wordt geladen...</div>}
        {error && <div className="text-red-600">{error}</div>}

        <div className="grid grid-cols-1 gap-4">
          <FormCard title="Documenten">
            {template && (
              <DocumentEditor
                template={template}
                onChange={setTemplate}
                onSave={handleSave}
              />
            )}
          </FormCard>
        </div>
      </div>
    </DashboardLayout>
  );
}