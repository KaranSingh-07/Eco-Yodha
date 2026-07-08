import { api } from "./api";

export interface CreateClassroomPayload {
  name: string;
  subject: string;
  // add other fields as needed
}

export interface JoinClassroomPayload {
  classroomId: string;
  // add other fields if needed
}

export const createClassroom = async (data: CreateClassroomPayload) => {
  return api.post('/classroom/create', data);
};

export const joinClassroom = async (data: JoinClassroomPayload) => {
  return api.post('/classroom/join', data);
};

export const getTeacherStudents = async () => {
  return api.get('/classroom/students');
};
