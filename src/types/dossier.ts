export interface Deceased {
    id?: string; // Guid
    firstName?: string;
    lastName?: string;
    salutation?: string;
    dob?: string; // ISO date
    placeOfBirth?: string;
    postalCode?: string;
    street?: string;
    houseNumber?: string;
    houseNumberAddition?: string;
    city?: string;
    county?: string;
    homeDeceased?: boolean;
}

export interface DeathInfoDto {
    id?: string; // Guid
    dateOfDeath?: string; // ISO date
    timeOfDeath?: string; // ISO time
    locationOfDeath?: string;
    postalCodeOfDeath?: string;
    streetOfDeath?: string;
    houseNumberOfDeath?: string;
    houseNumberAdditionOfDeath?: string;
    cityOfDeath?: string;
    countyOfDeath?: string;
    bodyFinding?: string;
    origin?: string;
}

export interface DossierDto {
    id?: string; // Guid
    funeralLeader?: string;
    funeralNumber?: string;
    funeralType?: string;
    voorregeling?: boolean;
    dossierCompleted?: boolean;
    deceased?: Deceased;
    deathInfo?: DeathInfoDto;
}

export interface FuneralLeaderDto {
  id: string;
  value: string;
  label: string;
};

export interface Props {
  overledeneId: string;
}