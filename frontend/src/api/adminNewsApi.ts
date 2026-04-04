import axiosClient from "./axiosClient";
import type { ApiResponse } from "../types/api";
import type { NewsArticle } from "../types/news";

export interface AdminNewsPayload {
  topic: string;
  title: string;
  image?: string;
  content: string;
}

export async function getAdminNews() {
  const response = await axiosClient.get<ApiResponse<NewsArticle[]>>("/api/admin/news");
  return response.data.data;
}

export async function createAdminNews(payload: AdminNewsPayload) {
  const response = await axiosClient.post<ApiResponse<NewsArticle>>("/api/admin/news", payload);
  return response.data.data;
}

export async function updateAdminNews(newsId: number, payload: AdminNewsPayload) {
  const response = await axiosClient.put<ApiResponse<NewsArticle>>(`/api/admin/news/${newsId}`, payload);
  return response.data.data;
}

export async function deleteAdminNews(newsId: number) {
  await axiosClient.delete<ApiResponse<null>>(`/api/admin/news/${newsId}`);
}
