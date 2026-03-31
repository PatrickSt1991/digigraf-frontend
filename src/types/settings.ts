export interface CompanySettings {
  name: string;
  address: string;
  postalCode: string;
  city: string;
  country: string;
  phone: string;
  email: string;
  website: string;
  kvkNumber: string;
  btwNumber: string;
  termsAndConditions: string;
}

export interface AccessDbEntry {
  name: string;
  filePath: string;
  tableName: string;
  lastNameColumn: string;
  firstNameColumn: string;
  birthDateColumn: string;
  funeralNumberColumn: string;
}