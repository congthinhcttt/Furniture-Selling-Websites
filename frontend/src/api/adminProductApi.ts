import axiosClient from "./axiosClient";
import type { ApiResponse } from "../types/api";
import type { LowStockProduct, Product } from "../types/product";

export interface AdminProductPayload {
  name: string;
  description?: string;
  price: number;
  image?: string;
  material?: string;
  color?: string;
  warranty?: string;
  shortDescription?: string;
  style?: string;
  width: number;
  length: number;
  stockQuantity: number;
  categoryId: number;
}

export interface ProductRestockPayload {
  quantity: number;
}

export interface ProductBulkRestockItemPayload {
  productId: number;
  quantity: number;
}

export interface ProductBulkRestockPayload {
  items: ProductBulkRestockItemPayload[];
}

export async function getAdminProducts() {
  const response = await axiosClient.get<ApiResponse<Product[]>>("/api/admin/products");
  return response.data.data;
}

export async function createAdminProduct(payload: AdminProductPayload) {
  const response = await axiosClient.post<ApiResponse<Product>>("/api/admin/products", payload);
  return response.data.data;
}

export async function updateAdminProduct(productId: number, payload: AdminProductPayload) {
  const response = await axiosClient.put<ApiResponse<Product>>(
    `/api/admin/products/${productId}`,
    payload
  );
  return response.data.data;
}

export async function restockAdminProduct(productId: number, payload: ProductRestockPayload) {
  const response = await axiosClient.post<ApiResponse<Product>>(
    `/api/admin/products/${productId}/restock`,
    payload
  );
  return response.data.data;
}

export async function restockAdminProductsBulk(payload: ProductBulkRestockPayload) {
  const response = await axiosClient.post<ApiResponse<Product[]>>(
    "/api/admin/products/restock/bulk",
    payload
  );
  return response.data.data;
}

export async function deleteAdminProduct(productId: number) {
  await axiosClient.delete<ApiResponse<null>>(`/api/admin/products/${productId}`);
}

export async function getLowStockProducts(threshold = 5) {
  const response = await axiosClient.get<ApiResponse<LowStockProduct[]>>(
    "/api/admin/products/low-stock",
    { params: { threshold } }
  );
  return response.data.data;
}
