import axiosClient from "./axiosClient";
import type { ApiResponse } from "../types/api";
import type { AddressFormPayload, SavedAddress } from "../types/address";

export async function getMyAddresses() {
  const response = await axiosClient.get<ApiResponse<SavedAddress[]>>("/api/user/addresses");
  return response.data.data;
}

export async function createAddress(payload: AddressFormPayload) {
  const response = await axiosClient.post<ApiResponse<SavedAddress>>("/api/user/addresses", payload);
  return response.data.data;
}

export async function updateAddress(addressId: number, payload: AddressFormPayload) {
  const response = await axiosClient.put<ApiResponse<SavedAddress>>(`/api/user/addresses/${addressId}`, payload);
  return response.data.data;
}

export async function deleteAddress(addressId: number) {
  await axiosClient.delete<ApiResponse<void>>(`/api/user/addresses/${addressId}`);
}

export async function setDefaultAddress(addressId: number) {
  const response = await axiosClient.patch<ApiResponse<SavedAddress>>(`/api/user/addresses/${addressId}/default`, {});
  return response.data.data;
}
