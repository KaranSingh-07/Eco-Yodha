import { api } from "./api";

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  role: string;
  // add other fields as needed
}

export const registerUser = async (data: RegisterPayload) => {
  return api.post('/auth/register', data);
};

export const loginUser = async (data: LoginPayload) => {
  const res = await api.post('/auth/login', data);
  // Store token in sessionStorage for subsequent requests
  if ((res as any).token) {
    sessionStorage.setItem('token', (res as any).token);
  }
  return res;
};

export const fetchUserProfile = async () => {
  return api.get('/auth/me');
};

export const updateUserProfile = async (data: Partial<UserProfile>) => {
  return api.put('/auth/profile', data);
};
