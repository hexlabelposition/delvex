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
