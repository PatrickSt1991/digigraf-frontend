export type SectionType = "text" | "textarea" | "image";

export interface Section {
  type: SectionType;
  label: string;   // "Header", "Body", "Footer", or any other section label
  value: string;   // actual content
}

export interface DocumentTemplate {
  id: string;
  title: string;
  dossierId?: string;
  sections: Section[];
  isDefault: boolean;
}

export type DeceasedDocumentsFormData = {
  id?: string;
  funeralLeader: string;
  funeralNumber: string;
  templates?: DocumentTemplate[];
};

export type AdminDocumentSavePayload = {
  title: string;
  header: string;
  body: string;
  footer: string;
};

export type DocumentAsset = {
  id: string;
  fileName: string;
  contentType: string;
  size: number;
  createdAtUtc: string;
  url: string;
};

export type DocumentAssetsResponse = {
  assets?: DocumentAsset[];
};