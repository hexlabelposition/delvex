export interface ApiErrorBody {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
  fieldErrors: Record<string, string>;
}

export type UserRole = "CUSTOMER" | "EMPLOYEE";

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}

export interface AuthResponse extends AuthUser {
  accessToken: string;
}

export interface RefreshResponse {
  accessToken: string;
}

export interface UserResponse extends AuthUser {
  branch?: BranchSummary | null;
  createdAt: string;
  updatedAt: string;
}

export type ShipmentStatus =
  | "CREATED"
  | "ACCEPTED_AT_ORIGIN"
  | "IN_TRANSIT"
  | "ARRIVED_AT_DESTINATION"
  | "DELIVERED"
  | "CANCELLED";

export interface BranchSummary {
  id: string;
  code: string;
  name: string;
  country: string;
  city: string;
  postalCode: string;
  address: string;
}

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
  version: number;
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

export interface CustomerSummary {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface EmployeeShipment {
  shipment: Shipment;
  customer: CustomerSummary;
  originBranch?: BranchSummary;
  destinationBranch?: BranchSummary;
  currentBranch?: BranchSummary | null;
  allowedStatuses?: ShipmentStatus[];
}

export interface EmployeeShipmentPage {
  content: EmployeeShipment[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface ShipmentStatusEvent {
  id: string;
  previousStatus: ShipmentStatus;
  newStatus: ShipmentStatus;
  changedByUserId: string;
  changedByFirstName: string;
  changedByLastName: string;
  changedByRole: UserRole;
  branch?: BranchSummary | null;
  changedAt: string;
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
