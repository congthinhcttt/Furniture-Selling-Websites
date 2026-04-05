package bai4_qlsp_LeBinh.demo.controller.user;

import bai4_qlsp_LeBinh.demo.dto.request.ChatbotAskRequest;
import bai4_qlsp_LeBinh.demo.dto.response.ApiResponse;
import bai4_qlsp_LeBinh.demo.dto.response.ChatbotResponseData;
import bai4_qlsp_LeBinh.demo.service.ChatbotService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/user/chatbot")
public class UserChatbotController {

    private final ChatbotService chatbotService;

    public UserChatbotController(ChatbotService chatbotService) {
        this.chatbotService = chatbotService;
    }

    @PostMapping("/ask")
    public ResponseEntity<ApiResponse<ChatbotResponseData>> ask(@RequestBody ChatbotAskRequest request) {
        return ResponseEntity.ok(ApiResponse.<ChatbotResponseData>builder()
                .success(true)
                .message("Chatbot trả lời thành công")
                .data(chatbotService.ask(request))
                .build());
    }

    @GetMapping("/quick-questions")
    public ResponseEntity<ApiResponse<List<String>>> getQuickQuestions() {
        return ResponseEntity.ok(ApiResponse.<List<String>>builder()
                .success(true)
                .message("Lấy câu hỏi gợi ý thành công")
                .data(chatbotService.getQuickQuestions())
                .build());
    }
}
