package bai4_qlsp_LeBinh.demo.exception;

public class SelfReferralNotAllowedException extends BadRequestException {
    public SelfReferralNotAllowedException(String message) {
        super(message);
    }
}
