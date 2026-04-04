package bai4_qlsp_LeBinh.demo.controller;

import bai4_qlsp_LeBinh.demo.service.PaymentService;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/payment/vnpay")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @GetMapping("/return")
    public void handleVnpayReturn(@RequestParam Map<String, String> params, HttpServletResponse response) throws IOException {
        PaymentService.PaymentProcessResult result = paymentService.processReturn(params);
        response.sendRedirect(paymentService.buildFrontendResultUrl(result));
    }

    @GetMapping("/ipn")
    public ResponseEntity<Map<String, String>> handleVnpayIpn(@RequestParam Map<String, String> params) {
        PaymentService.PaymentProcessResult result = paymentService.processIpn(params);
        Map<String, String> body = new LinkedHashMap<>();

        if ("97".equals(result.responseCode())) {
            body.put("RspCode", "97");
            body.put("Message", "Invalid Checksum");
            return ResponseEntity.ok(body);
        }

        if (result.orderId() == null) {
            body.put("RspCode", "01");
            body.put("Message", "Order not Found");
            return ResponseEntity.ok(body);
        }

        if (result.alreadyProcessed()) {
            body.put("RspCode", "02");
            body.put("Message", "Order already confirmed");
        } else if (result.success()) {
            body.put("RspCode", "00");
            body.put("Message", "Confirm Success");
        } else {
            body.put("RspCode", "00");
            body.put("Message", "Confirm Success");
        }

        return ResponseEntity.ok(body);
    }
}
