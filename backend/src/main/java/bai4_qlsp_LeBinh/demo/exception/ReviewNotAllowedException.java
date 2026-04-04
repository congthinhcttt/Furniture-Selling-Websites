package bai4_qlsp_LeBinh.demo.exception;

public class ReviewNotAllowedException extends BadRequestException {

    public ReviewNotAllowedException(String message) {
        super(message);
    }
}
