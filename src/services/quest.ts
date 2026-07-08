import { api } from "./api";

export interface Quest {
  _id: string;
  title: string;
  description?: string;
  // other fields as needed
}

export const getQuests = async () => {
  return api.get('/quests');
};

export const submitQuestProgress = async (questId: string, data: any) => {
  return api.put(`/quests/${questId}/progress`, data);
};
