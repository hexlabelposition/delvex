export interface ApiErrorBody {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
  fieldErrors: Record<string, string>;
}

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse extends AuthUser {
  accessToken: string;
}

export interface RefreshResponse {
  accessToken: string;
}

export interface UserResponse extends AuthUser {
  createdAt: string;
  updatedAt: string;
}

export type ShipmentStatus =
  "CREATED" | "IN_TRANSIT" | "DELIVERED" | "CANCELLED";

export interface Shipment {
  id: string;
  referenceNumber: string;
  status: ShipmentStatus;
  originCountry: string;
  originCity: string;
  originPostalCode: string;
  originAddress: string;
  destinationCountry: string;
  destinationCity: string;
  destinationPostalCode: string;
  destinationAddress: string;
  cargoDescription: string;
  weightKg: number;
  pickupAt: string | null;
  deliveryAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ShipmentPage {
  content: Shipment[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface CreateShipmentPayload {
  originLocationId: string;
  destinationLocationId: string;
  cargoDescription: string;
  weightKg: number;
  pickupAt: string | null;
  deliveryAt: string | null;
}

export type UpdateShipmentPayload = Partial<
  Omit<CreateShipmentPayload, "pickupAt" | "deliveryAt">
> & {
  pickupAt?: string;
  deliveryAt?: string;
};
