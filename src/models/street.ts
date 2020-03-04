export class Street {
  highlightedName: string;
  latitude: number;
  longitude: number;
  name: string;
  score: number;
  suggestionType: number;
  uniqueIdentifier: string;
}

export class StreetSpecific {
  closestDistance: number;
  communeBfsNumber: number;
  country: number;
  countryCode: string;
  entranceAddressUniqueIdentifier: string;
  executionTime: string;
  formattedAddress: string;
  geoQuality: number;
  height: number;
  LV95_E: number;
  LV95_N: number;
  latitude: number;
  locality: string;
  localityUniqueIdentifier: string;
  longitude: number;
  optimizedRequest: boolean;
  state: string;
  stateShort: string;
  stateUniqueIdentifier: string;
  street: string;
  streetNumber: string;
  streetUniqueIdentifier: string;
  zip: string;
}
