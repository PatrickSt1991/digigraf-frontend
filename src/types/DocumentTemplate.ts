export type SectionType = "text" | "textarea" | "image";

export interface Section {
  type: SectionType;
  label: string;   // "Header", "Body", "Footer", or any other section label
  value: string;   // actual content
}

export interface DocumentTemplate {
  id: string;
  title: string;
  overledeneId?: string;  // optional link to deceased person
  sections: Section[];
}