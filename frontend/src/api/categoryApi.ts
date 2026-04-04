import axiosClient from "./axiosClient";
import type { ApiResponse } from "../types/api";
import type { Category } from "../types/category";
import type { CategoryGroup } from "../types/categoryGroup";

interface GetCategoriesParams {
  groupId?: number;
}

export async function getCategories(params?: GetCategoriesParams): Promise<Category[]> {
  const response = await axiosClient.get<ApiResponse<Category[]>>("/api/user/categories", {
    params,
  });

  return response.data.data;
}

export async function getCategoryGroups(): Promise<CategoryGroup[]> {
  const response = await axiosClient.get<ApiResponse<CategoryGroup[]>>("/api/user/category-groups");
  return response.data.data;
}
