import axiosClient from "./axiosClient";
import type { ApiResponse } from "../types/api";
import type { Product } from "../types/product";

interface GetProductsParams {
  categoryId?: number;
  categoryIds?: number[];
  groupId?: number;
}

export async function getProducts(params?: GetProductsParams): Promise<Product[]> {
  const response = await axiosClient.get<ApiResponse<Product[]>>("/api/user/products", {
    params,
    paramsSerializer: (params: GetProductsParams) => {
      const searchParams = new URLSearchParams();

      if (params?.categoryId !== undefined) {
        searchParams.append("categoryId", String(params.categoryId));
      }

      if (params?.groupId !== undefined) {
        searchParams.append("groupId", String(params.groupId));
      }

      if (params?.categoryIds?.length) {
        params.categoryIds.forEach((id: number) => {
          searchParams.append("categoryIds", String(id));
        });
      }

      return searchParams.toString();
    },
  });

  return response.data.data;
}

export async function getProductById(id: number): Promise<Product> {
  const response = await axiosClient.get<ApiResponse<Product>>(`/api/user/products/${id}`);
  return response.data.data;
}

export async function getFeaturedProducts(limit = 12): Promise<Product[]> {
  const response = await axiosClient.get<ApiResponse<Product[]>>("/api/user/products/featured", {
    params: { limit },
  });

  return response.data.data;
}
