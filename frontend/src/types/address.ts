export interface SavedAddress {
  id: number;
  fullName: string;
  phone: string;
  addressLine: string;
  label?: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AddressFormPayload {
  fullName: string;
  phone: string;
  addressLine: string;
  label?: string;
  isDefault?: boolean;
}
