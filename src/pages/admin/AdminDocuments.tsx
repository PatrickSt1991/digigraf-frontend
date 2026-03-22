import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaArrowLeft,
  FaFileAlt,
  FaPlus,
  FaSearch,
} from "react-icons/fa";

import { DashboardLayout, DocumentEditorModal } from "../../components";
import { AdminDocumentSavePayload, DocumentTemplate, Section } from "../../types";
import { endpoints } from "../../api/apiConfig";
import apiClient from "../../api/apiClient";

type AdminTab = "overview" | "add" | "edit";

const createEmptyTemplate = (): DocumentTemplate => ({
  id: "",
  dossierId: undefined,
  title: "",
  isDefault: true,
  sections: [
    {
      type: "textarea",
      label: "Header",
      value: "",
    },
    {
      type: "textarea",
      label: "Body",
      value: "",
    },
    {
      type: "textarea",
      label: "Footer",
      value: "",
    },
  ],
});

const getSectionValue = (
  template: DocumentTemplate | null | undefined,
  label: "Header" | "Body" | "Footer"
) =>
  template?.sections.find(
    (s) => s.label?.trim().toLowerCase() === label.toLowerCase()
  )?.value ?? "";

const upsertSection = (
  sections: Section[],
  label: "Header" | "Body" | "Footer",
  value: string
): Section[] => {
  const normalized = label.toLowerCase();
  const existing = sections.find(
    (s) => s.label?.trim().toLowerCase() === normalized
  );

  if (existing) {
    return sections.map((s) =>
      s.label?.trim().toLowerCase() === normalized
        ? { ...s, value, type: "textarea" }
        : s
    );
  }

  return [
    ...sections,
    {
      type: "textarea",
      label,
      value,
    },
  ];
};

const AdminDocuments: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] =
    useState<DocumentTemplate | null>(null);

  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [templatesError, setTemplatesError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editorTemplate, setEditorTemplate] =
    useState<DocumentTemplate | null>(null);

  const loadTemplates = async () => {
    try {
      setLoadingTemplates(true);
      setTemplatesError(null);

      
      type DocumentTemplatesResponse = {
        templates?: DocumentTemplate[];
      };

      const data = await apiClient<DocumentTemplatesResponse>(endpoints.documentsdefault);

      const defaults = (data.templates ?? []).filter((t) => t.isDefault);
      setTemplates(defaults);
    } catch (err) {
      setTemplatesError(
        (err as Error).message ?? "Kon document templates niet laden."
      );
    } finally {
      setLoadingTemplates(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        setLoadingTemplates(true);
        setTemplatesError(null);

        type DocumentTemplatesResponse = {
          templates?: DocumentTemplate[];
        };

        const data = await apiClient<DocumentTemplatesResponse>(
          endpoints.documentsdefault
        );

        if (!cancelled) {
          const defaults = (data.templates ?? []).filter((t) => t.isDefault);
          setTemplates(defaults);
        }
      } catch (err) {
        if (!cancelled) {
          setTemplatesError(
            (err as Error).message ?? "Kon document templates niet laden."
          );
        }
      } finally {
        if (!cancelled) setLoadingTemplates(false);
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredTemplates = useMemo(() => {
    return templates
      .filter((t) => t.isDefault === true)
      .filter((t) => t.title.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => a.title.localeCompare(b.title));
  }, [templates, searchTerm]);

  const openEditor = (template: DocumentTemplate) => {
    setEditorTemplate(template);
    setTimeout(() => setModalOpen(true), 0);
  };

  const handleCreate = () => {
    const template = createEmptyTemplate();
    setSelectedTemplate(template);
    setEditorTemplate(template);
    setActiveTab("add");
    setTimeout(() => setModalOpen(true), 0);
  };

  const handleEdit = (template: DocumentTemplate) => {
    setSelectedTemplate(template);
    setEditorTemplate(template);
    setActiveTab("edit");
    setTimeout(() => setModalOpen(true), 0);
  };

  const handleAdminSave = async ({
    title,
    header,
    body,
    footer,
  }: AdminDocumentSavePayload) => {
    if (!editorTemplate) return;

    let updatedSections = [...(editorTemplate.sections ?? [])];
    updatedSections = upsertSection(updatedSections, "Header", header);
    updatedSections = upsertSection(updatedSections, "Body", body);
    updatedSections = upsertSection(updatedSections, "Footer", footer);

    const payload: DocumentTemplate = {
      ...editorTemplate,
      title,
      dossierId: undefined,
      isDefault: true,
      sections: updatedSections,
    };

    const isNew = !payload.id;

    await apiClient(
      isNew
        ? endpoints.documentsdefault
        : `${endpoints.documentsdefault}/${payload.id}`,
      {
        method: isNew ? "POST" : "PUT",
        body: payload,
      }
    );

    await loadTemplates();
    setModalOpen(false);
    setEditorTemplate(null);
    setSelectedTemplate(null);
    setActiveTab("overview");
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-10">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-4 h-full">
                <Link
                  to="/admin"
                  className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Terug naar dashboard"
                >
                  <FaArrowLeft size={16} />
                </Link>

                <div className="flex items-center gap-3 h-full">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <FaFileAlt className="text-white" size={22} />
                  </div>
                  <div className="flex flex-col justify-center">
                    <h1 className="text-2xl font-bold text-gray-900">
                      Document Templates Beheer
                    </h1>
                    <p className="text-gray-600">
                      Beheer standaard document templates
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 h-full items-center">
                <button
                  onClick={() => setActiveTab("overview")}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    activeTab === "overview"
                      ? "bg-purple-100 text-purple-700 font-medium"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  Overzicht
                </button>

                <button
                  onClick={handleCreate}
                  className="px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
                >
                  <FaPlus size={16} />
                  Nieuw Document
                </button>
              </div>
            </div>
          </div>

          {activeTab === "overview" && (
            <>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between h-16">
                  <div className="relative flex-1 max-w-md">
                    <FaSearch
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      size={16}
                    />
                    <input
                      type="text"
                      placeholder="Zoek templates..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    {filteredTemplates.length} templates
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Template
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Acties
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-200">
                      {loadingTemplates && (
                        <tr>
                          <td colSpan={3} className="p-6 text-gray-500">
                            Loading templates...
                          </td>
                        </tr>
                      )}

                      {!loadingTemplates && templatesError && (
                        <tr>
                          <td colSpan={3} className="p-6 text-red-600">
                            {templatesError}
                          </td>
                        </tr>
                      )}

                      {!loadingTemplates &&
                        !templatesError &&
                        filteredTemplates.map((template) => (
                          <tr
                            key={template.id || template.title}
                            className="hover:bg-gray-50 transition-colors"
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-3 group">
                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 text-white text-sm font-semibold flex items-center justify-center">
                                  <FaFileAlt size={14} />
                                </div>

                                <div className="flex flex-col">
                                  <span className="font-medium text-gray-900 group-hover:text-purple-600 transition-colors">
                                    {template.title}
                                  </span>
                                  <span className="text-sm text-gray-500">
                                    Standaard template
                                  </span>
                                </div>
                              </div>
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                Template
                              </span>
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => openEditor(template)}
                                  className="px-3 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                  Openen
                                </button>

                                {/* <button
                                  onClick={() => handleEdit(template)}
                                  className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                >
                                  <FaEdit size={16} />
                                </button> */}
                              </div>
                            </td>
                          </tr>
                        ))}

                      {!loadingTemplates &&
                        !templatesError &&
                        filteredTemplates.length === 0 && (
                          <tr>
                            <td colSpan={3} className="p-6 text-gray-500">
                              Geen standaard templates gevonden.
                            </td>
                          </tr>
                        )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {(activeTab === "add" ||
            (activeTab === "edit" && selectedTemplate)) && (
            <div className="bg-white rounded-xl border p-6 space-y-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {activeTab === "add"
                    ? "Nieuw document template"
                    : "Document template bewerken"}
                </h2>
                <p className="text-sm text-gray-500">
                  Open de editor om titel, header, body en footer aan te passen.
                </p>
              </div>

              <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setActiveTab("overview");
                    setSelectedTemplate(null);
                    setEditorTemplate(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Annuleren
                </button>
                <button
                  onClick={() =>
                    openEditor(editorTemplate ?? createEmptyTemplate())
                  }
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Open editor
                </button>
              </div>
            </div>
          )}

            <DocumentEditorModal
            isOpen={modalOpen}
            onClose={() => {
                setModalOpen(false);
                setEditorTemplate(null);
            }}
            title={editorTemplate?.title || ""}
            initialContent={getSectionValue(editorTemplate, "Body")}
            header={getSectionValue(editorTemplate, "Header")}
            footer={getSectionValue(editorTemplate, "Footer")}
            adminMode={true}
            onSave={handleAdminSave}
            />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDocuments;