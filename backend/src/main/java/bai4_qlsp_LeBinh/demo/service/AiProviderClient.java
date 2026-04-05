package bai4_qlsp_LeBinh.demo.service;

import java.util.Optional;

public interface AiProviderClient {

    Optional<String> generateReply(String prompt);
}
