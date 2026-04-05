export type ChatbotResponseType =
  | "FAQ"
  | "PRODUCT_SUGGESTION"
  | "NO_RESULT"
  | "FALLBACK"
  | "ERROR";

export interface ChatbotAskRequest {
  message: string;
}

export interface ChatbotProductItem {
  id: number;
  name: string;
  price: number;
  image?: string;
  shortDescription?: string;
  detailUrl: string;
}

export interface ChatbotResponseData {
  type: ChatbotResponseType;
  reply: string;
  products: ChatbotProductItem[];
  suggestions: string[];
}
