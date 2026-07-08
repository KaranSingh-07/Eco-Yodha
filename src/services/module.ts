import { api } from "./api";

export interface Module {
  _id: string;
  title: string;
  description?: string;
  // other fields as needed
}

export const getModules = async () => {
  return api.get('/modules');
};

export const getModuleById = async (id: string) => {
  return api.get(`/modules/${id}`);
};

export const completeModule = async (id: string) => {
  return api.put(`/modules/${id}/complete`);
};
