import axiosClient from "./axiosClient";
import type { ApiResponse } from "../types/api";
import type { ChatbotAskRequest, ChatbotResponseData } from "../types/chatbot";

export async function askChatbot(payload: ChatbotAskRequest) {
  const response = await axiosClient.post<ApiResponse<ChatbotResponseData>>(
    "/api/user/chatbot/ask",
    payload
  );

  return response.data.data;
}

export async function getChatbotQuickQuestions() {
  const response = await axiosClient.get<ApiResponse<string[]>>(
    "/api/user/chatbot/quick-questions"
  );

  return response.data.data;
}
