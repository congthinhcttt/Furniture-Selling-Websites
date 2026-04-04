import axios from "axios";
import { clearStoredAuth, getStoredAuth } from "../utils/authStorage";
import { API_BASE_URL } from "../config/runtime";

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosClient.interceptors.request.use((config) => {
  const auth = getStoredAuth();

  if (auth?.token) {
    config.headers.Authorization = `${auth.tokenType || "Bearer"} ${auth.token}`;
  }

  return config;
});

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      clearStoredAuth();
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
