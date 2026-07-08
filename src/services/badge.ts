import { api } from "./api";

export interface Badge {
  _id: string;
  name: string;
  description?: string;
  // other fields as needed
}

export const getBadges = async () => {
  return api.get('/badges');
};

export const claimBadge = async (badgeId: string) => {
  return api.post(`/badges/award`, { badgeId });
};
