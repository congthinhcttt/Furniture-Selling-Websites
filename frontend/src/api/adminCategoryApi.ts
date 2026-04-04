import axiosClient from "./axiosClient";
import type { ApiResponse } from "../types/api";
import type { Category } from "../types/category";
import type { CategoryGroup } from "../types/categoryGroup";

export interface AdminCategoryPayload {
  name: string;
  slug?: string;
  groupId: number;
}

export interface AdminCategoryGroupPayload {
  name: string;
  slug?: string;
  bannerImage?: string;
}

export async function getAdminCategories() {
  const response = await axiosClient.get<ApiResponse<Category[]>>("/api/admin/categories");
  return response.data.data;
}

export async function createAdminCategory(payload: AdminCategoryPayload) {
  const response = await axiosClient.post<ApiResponse<Category>>("/api/admin/categories", payload);
  return response.data.data;
}

export async function updateAdminCategory(categoryId: number, payload: AdminCategoryPayload) {
  const response = await axiosClient.put<ApiResponse<Category>>(
    `/api/admin/categories/${categoryId}`,
    payload
  );
  return response.data.data;
}

export async function deleteAdminCategory(categoryId: number) {
  await axiosClient.delete<ApiResponse<null>>(`/api/admin/categories/${categoryId}`);
}

export async function getAdminCategoryGroups() {
  const response = await axiosClient.get<ApiResponse<CategoryGroup[]>>("/api/admin/category-groups");
  return response.data.data;
}

export async function createAdminCategoryGroup(payload: AdminCategoryGroupPayload) {
  const response = await axiosClient.post<ApiResponse<CategoryGroup>>(
    "/api/admin/category-groups",
    payload
  );
  return response.data.data;
}

export async function updateAdminCategoryGroup(
  groupId: number,
  payload: AdminCategoryGroupPayload
) {
  const response = await axiosClient.put<ApiResponse<CategoryGroup>>(
    `/api/admin/category-groups/${groupId}`,
    payload
  );
  return response.data.data;
}

export async function deleteAdminCategoryGroup(groupId: number) {
  await axiosClient.delete<ApiResponse<null>>(`/api/admin/category-groups/${groupId}`);
}
