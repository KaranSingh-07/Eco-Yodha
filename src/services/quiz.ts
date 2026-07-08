import { api } from "./api";

export const getQuizByModule = async (moduleId: string) => {
  return api.get(`/quiz/${moduleId}`);
};

export const submitQuiz = async (moduleId: string, answers: any) => {
  return api.post(`/quiz/${moduleId}/submit`, { answers });
};
