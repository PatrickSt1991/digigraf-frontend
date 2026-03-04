import { PostalAddressDto, PostboxDto } from './utils';

export interface SupplierTypeDto {
  code: string;
  label: string;
}

export interface SupplierDto {
  id?: string;

  name: string;
  type: SupplierTypeDto;
  description?: string | null;
  isActive: boolean;

  address?: PostalAddressDto | null;
  postbox?: PostboxDto | null;
}