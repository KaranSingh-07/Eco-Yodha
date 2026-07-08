import { api } from "./api";

export interface DashboardData {
  // define shape as needed, using any for now
  [key: string]: any;
}

export const getDashboard = async () => {
  return api.get('/progress/dashboard');
};

export const getTrends = async () => {
  return api.get('/progress/trends');
};

export const updateProgress = async (data: any) => {
  return api.put('/progress', data);
};
