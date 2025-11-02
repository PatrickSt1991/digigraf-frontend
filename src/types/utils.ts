export interface Salutation {
    id: string;
    code: string;
    label: string;
    description?: string;
    is_active?: boolean;
}

export interface FuneralType {
    id: string;
    name: string;
    description?: string;
    is_active?: boolean;
}