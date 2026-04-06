package bai4_qlsp_LeBinh.demo.exception;

public class InvalidReferralCodeException extends BadRequestException {
    public InvalidReferralCodeException(String message) {
        super(message);
    }
}
