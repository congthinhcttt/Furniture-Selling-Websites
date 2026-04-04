package bai4_qlsp_LeBinh.demo.controller.user;

import bai4_qlsp_LeBinh.demo.dto.request.VnpayCreatePaymentRequest;
import bai4_qlsp_LeBinh.demo.dto.response.ApiResponse;
import bai4_qlsp_LeBinh.demo.dto.response.VnpayCreatePaymentResponse;
import bai4_qlsp_LeBinh.demo.entity.Account;
import bai4_qlsp_LeBinh.demo.service.AccountService;
import bai4_qlsp_LeBinh.demo.service.PaymentService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/user/payments")
public class UserPaymentController {

    private final PaymentService paymentService;
    private final AccountService accountService;

    public UserPaymentController(PaymentService paymentService, AccountService accountService) {
        this.paymentService = paymentService;
        this.accountService = accountService;
    }

    @PostMapping("/vnpay/create")
    public ResponseEntity<ApiResponse<VnpayCreatePaymentResponse>> createVnpayPayment(Authentication authentication,
                                                                                       HttpServletRequest request,
                                                                                       @Valid @RequestBody VnpayCreatePaymentRequest payload) {
        Integer accountId = getCurrentAccount(authentication).getId();
        VnpayCreatePaymentResponse response = paymentService.createVnpayPaymentUrl(accountId, payload.getOrderId(), request.getRemoteAddr());

        return ResponseEntity.ok(
                ApiResponse.<VnpayCreatePaymentResponse>builder()
                        .success(true)
                        .message("Tao lien ket thanh toan VNPay thanh cong")
                        .data(response)
                        .build()
        );
    }

    private Account getCurrentAccount(Authentication authentication) {
        return accountService.getAccountByLoginName(authentication.getName());
    }
}
