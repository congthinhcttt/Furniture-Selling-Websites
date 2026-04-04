import axiosClient from "./axiosClient";
import type { ApiResponse } from "../types/api";
import type { NewsArticle } from "../types/news";

export async function getNewsArticles(): Promise<NewsArticle[]> {
  const response = await axiosClient.get<ApiResponse<NewsArticle[]>>("/api/user/news");
  return response.data.data;
}

export async function getNewsArticleById(id: number): Promise<NewsArticle> {
  const response = await axiosClient.get<ApiResponse<NewsArticle>>(`/api/user/news/${id}`);
  return response.data.data;
}
