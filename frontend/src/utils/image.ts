import { API_BASE_URL } from "../config/runtime";

export function buildImageUrl(image?: string, fallback?: string) {
  if (!image) {
    return fallback || "";
  }

  if (image.startsWith("http://") || image.startsWith("https://")) {
    return image;
  }

  return `${API_BASE_URL}/images/${image}`;
}

