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

export interface PostalAddressDto {
  street: string;
  houseNumber: string;
  suffix?: string | null;
  zipCode: string;
  city: string;
}

export interface PostboxDto {
  address: string;
  zipCode: string;
  city: string;
}

export interface CoffinsDto {
  id?: string;
  code: string;
  label: string;
  description?: string;
  isActive: boolean;
}