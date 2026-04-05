import axiosClient from "./axiosClient";
import type { ApiResponse } from "../types/api";
import type { CompareProduct } from "../types/compare";

export async function getCompareProducts(productIds: number[]) {
  const response = await axiosClient.post<ApiResponse<CompareProduct[]>>(
    "/api/user/products/compare",
    { productIds }
  );

  return response.data.data;
}
