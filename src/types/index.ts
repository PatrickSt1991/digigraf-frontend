export interface BaseFormData {
  funeralLeader: string;
  funeralNumber: string;
  age?: string;
}

export interface DocumentTemplate extends BaseFormData {
  title: string;
  fields: Record<
    string,
    {
      type: "text" | "textarea" | "checkbox" | "list";
      label: string;
      value: any;
    }
  >;
}
