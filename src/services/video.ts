import { api } from "./api";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

export interface VideoMetadata {
  _id: string;
  title: string;
  description?: string;
  filename: string;
  contentType: string;
  uploadedBy?: string;
  createdAt: string;
}

export const getVideos = async (): Promise<VideoMetadata[]> => {
  return api.get('/videos');
};

export const deleteVideo = async (id: string): Promise<void> => {
  const token = sessionStorage.getItem('token');
  const headers: HeadersInit = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(`${BASE_URL}/videos/${id}`, {
    method: 'DELETE',
    headers,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Delete failed' }));
    throw new Error(err.message || 'Delete failed');
  }
};

export const uploadVideo = async (title: string, description: string, file: File): Promise<VideoMetadata> => {
  const token = sessionStorage.getItem('token');
  const formData = new FormData();
  formData.append('title', title);
  formData.append('description', description);
  formData.append('file', file);

  const headers: HeadersInit = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}/videos`, {
    method: 'POST',
    headers,
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Upload failed' }));
    throw new Error(err.message || 'Upload failed');
  }
  return res.json();
};
