package bai4_qlsp_LeBinh.demo.service;

import bai4_qlsp_LeBinh.demo.dto.request.VoucherApplyRequest;
import bai4_qlsp_LeBinh.demo.dto.request.VoucherCreateRequest;
import bai4_qlsp_LeBinh.demo.dto.request.VoucherUpdateRequest;
import bai4_qlsp_LeBinh.demo.dto.response.VoucherApplyResponse;
import bai4_qlsp_LeBinh.demo.dto.response.VoucherResponse;
import bai4_qlsp_LeBinh.demo.entity.Voucher;
import bai4_qlsp_LeBinh.demo.enums.VoucherDiscountType;
import bai4_qlsp_LeBinh.demo.exception.BadRequestException;
import bai4_qlsp_LeBinh.demo.exception.ConflictException;
import bai4_qlsp_LeBinh.demo.exception.ResourceNotFoundException;
import bai4_qlsp_LeBinh.demo.repository.VoucherRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class VoucherService {

    private final VoucherRepository voucherRepository;

    public VoucherService(VoucherRepository voucherRepository) {
        this.voucherRepository = voucherRepository;
    }

    @Transactional
    public VoucherResponse createVoucher(VoucherCreateRequest request) {
        validateVoucherRequest(request.getCode(), request.getName(), request.getDiscountType(), request.getDiscountValue(),
                request.getMinOrderValue(), request.getMaxDiscount(), request.getStartDate(), request.getEndDate(), request.getUsageLimit());

        String normalizedCode = normalizeCode(request.getCode());
        if (voucherRepository.existsByCode(normalizedCode)) {
            throw new ConflictException("Mã voucher đã tồn tại.");
        }

        Voucher voucher = new Voucher();
        applyVoucherData(voucher, request.getCode(), request.getName(), request.getDiscountType(), request.getDiscountValue(),
                request.getMinOrderValue(), request.getMaxDiscount(), request.getStartDate(), request.getEndDate(),
                request.getUsageLimit(), request.getActive());

        return mapToResponse(voucherRepository.save(voucher));
    }

    @Transactional
    public VoucherResponse updateVoucher(Long id, VoucherUpdateRequest request) {
        Voucher voucher = getVoucherEntityById(id);
        validateVoucherRequest(request.getCode(), request.getName(), request.getDiscountType(), request.getDiscountValue(),
                request.getMinOrderValue(), request.getMaxDiscount(), request.getStartDate(), request.getEndDate(), request.getUsageLimit());

        String normalizedCode = normalizeCode(request.getCode());
        voucherRepository.findByCode(normalizedCode)
                .filter(existing -> !existing.getId().equals(id))
                .ifPresent(existing -> {
                    throw new ConflictException("Mã voucher đã tồn tại.");
                });

        applyVoucherData(voucher, request.getCode(), request.getName(), request.getDiscountType(), request.getDiscountValue(),
                request.getMinOrderValue(), request.getMaxDiscount(), request.getStartDate(), request.getEndDate(),
                request.getUsageLimit(), request.getActive());

        return mapToResponse(voucherRepository.save(voucher));
    }

    @Transactional
    public void deleteVoucher(Long id) {
        voucherRepository.delete(getVoucherEntityById(id));
    }

    @Transactional(readOnly = true)
    public List<VoucherResponse> getAllVouchers() {
        return voucherRepository.findAll()
                .stream()
                .sorted((left, right) -> right.getCreatedAt().compareTo(left.getCreatedAt()))
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<VoucherResponse> getAvailableVouchers() {
        LocalDateTime now = LocalDateTime.now();

        return voucherRepository.findAllByActiveTrueOrderByCreatedAtDesc()
                .stream()
                .filter(voucher -> !voucher.getStartDate().isAfter(now))
                .filter(voucher -> !voucher.getEndDate().isBefore(now))
                .filter(voucher -> voucher.getUsageLimit() == null
                        || voucher.getUsageLimit() <= 0
                        || voucher.getUsedCount() < voucher.getUsageLimit())
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public VoucherResponse getVoucherById(Long id) {
        return mapToResponse(getVoucherEntityById(id));
    }

    @Transactional
    public VoucherResponse toggleStatus(Long id) {
        Voucher voucher = getVoucherEntityById(id);
        voucher.setActive(!Boolean.TRUE.equals(voucher.getActive()));
        return mapToResponse(voucherRepository.save(voucher));
    }

    @Transactional(readOnly = true)
    public VoucherApplyResponse validateVoucher(String code, Long subtotal) {
        return applyVoucher(code, subtotal);
    }

    @Transactional(readOnly = true)
    public VoucherApplyResponse applyVoucher(VoucherApplyRequest request) {
        if (request == null) {
            throw new BadRequestException("Thông tin mã giảm giá không hợp lệ.");
        }
        return applyVoucher(request.getCode(), request.getSubtotal());
    }

    @Transactional(readOnly = true)
    public VoucherApplyResponse applyVoucher(String code, Long subtotal) {
        if (subtotal == null || subtotal <= 0) {
            throw new BadRequestException("Giá trị đơn hàng phải lớn hơn 0.");
        }

        Voucher voucher = getVoucherByCode(code);
        validateVoucherAvailability(voucher, subtotal);

        long discountAmount = calculateDiscountAmount(voucher, subtotal);
        long finalTotal = Math.max(0L, subtotal - discountAmount);

        return VoucherApplyResponse.builder()
                .voucherId(voucher.getId())
                .code(voucher.getCode())
                .name(voucher.getName())
                .discountType(voucher.getDiscountType())
                .discountValue(voucher.getDiscountValue())
                .subtotal(subtotal)
                .discountAmount(discountAmount)
                .finalTotal(finalTotal)
                .build();
    }

    @Transactional
    public void markVoucherUsed(Long voucherId) {
        Voucher voucher = getVoucherEntityById(voucherId);
        incrementVoucherUsage(voucher);
    }

    @Transactional
    public void markVoucherUsed(String code) {
        Voucher voucher = getVoucherByCode(code);
        incrementVoucherUsage(voucher);
    }

    @Transactional(readOnly = true)
    public Voucher getVoucherEntityById(Long id) {
        return voucherRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy voucher."));
    }

    @Transactional(readOnly = true)
    public Voucher getVoucherByCode(String code) {
        return voucherRepository.findByCode(normalizeCode(code))
                .orElseThrow(() -> new ResourceNotFoundException("Mã giảm giá không tồn tại"));
    }

    private void incrementVoucherUsage(Voucher voucher) {
        validateVoucherAvailability(voucher, Long.MAX_VALUE);

        voucher.setUsedCount(voucher.getUsedCount() + 1);
        voucherRepository.save(voucher);
    }

    private void validateVoucherAvailability(Voucher voucher, Long subtotal) {
        LocalDateTime now = LocalDateTime.now();

        if (!Boolean.TRUE.equals(voucher.getActive())) {
            throw new BadRequestException("Mã giảm giá hiện không khả dụng");
        }

        if (voucher.getStartDate().isAfter(now)) {
            throw new BadRequestException("Mã giảm giá chưa đến thời gian sử dụng");
        }

        if (voucher.getEndDate().isBefore(now)) {
            throw new BadRequestException("Mã giảm giá đã hết hạn");
        }

        if (voucher.getUsageLimit() != null && voucher.getUsageLimit() > 0
                && voucher.getUsedCount() >= voucher.getUsageLimit()) {
            throw new BadRequestException("Mã giảm giá đã hết lượt sử dụng");
        }

        if (subtotal != null && subtotal != Long.MAX_VALUE
                && voucher.getMinOrderValue() != null
                && subtotal < voucher.getMinOrderValue()) {
            throw new BadRequestException("Đơn hàng chưa đạt giá trị tối thiểu để áp dụng mã");
        }
    }

    private long calculateDiscountAmount(Voucher voucher, long subtotal) {
        long discountAmount;

        if (voucher.getDiscountType() == VoucherDiscountType.PERCENT) {
            discountAmount = subtotal * voucher.getDiscountValue() / 100;
            if (voucher.getMaxDiscount() != null && voucher.getMaxDiscount() > 0) {
                discountAmount = Math.min(discountAmount, voucher.getMaxDiscount());
            }
        } else {
            discountAmount = voucher.getDiscountValue();
        }

        return Math.min(discountAmount, subtotal);
    }

    private void applyVoucherData(Voucher voucher,
                                  String code,
                                  String name,
                                  VoucherDiscountType discountType,
                                  Long discountValue,
                                  Long minOrderValue,
                                  Long maxDiscount,
                                  LocalDateTime startDate,
                                  LocalDateTime endDate,
                                  Integer usageLimit,
                                  Boolean active) {
        voucher.setCode(normalizeCode(code));
        voucher.setName(name.trim());
        voucher.setDiscountType(discountType);
        voucher.setDiscountValue(discountValue);
        voucher.setMinOrderValue(normalizeMoney(minOrderValue));
        voucher.setMaxDiscount(discountType == VoucherDiscountType.PERCENT ? normalizeMoney(maxDiscount) : null);
        voucher.setStartDate(startDate);
        voucher.setEndDate(endDate);
        voucher.setUsageLimit(usageLimit != null ? usageLimit : 0);
        voucher.setActive(active != null ? active : true);
    }

    private void validateVoucherRequest(String code,
                                        String name,
                                        VoucherDiscountType discountType,
                                        Long discountValue,
                                        Long minOrderValue,
                                        Long maxDiscount,
                                        LocalDateTime startDate,
                                        LocalDateTime endDate,
                                        Integer usageLimit) {
        if (code == null || code.isBlank()) {
            throw new BadRequestException("Mã voucher không được để trống.");
        }

        if (name == null || name.isBlank()) {
            throw new BadRequestException("Tên voucher không được để trống.");
        }

        if (discountType == null) {
            throw new BadRequestException("Loại giảm giá không hợp lệ.");
        }

        if (discountValue == null || discountValue <= 0) {
            throw new BadRequestException("Giá trị giảm phải lớn hơn 0.");
        }

        if (discountType == VoucherDiscountType.PERCENT && discountValue > 100) {
            throw new BadRequestException("Voucher phần trăm không được lớn hơn 100%.");
        }

        if (minOrderValue != null && minOrderValue < 0) {
            throw new BadRequestException("Giá trị đơn hàng tối thiểu không hợp lệ.");
        }

        if (maxDiscount != null && maxDiscount < 0) {
            throw new BadRequestException("Mức giảm tối đa không hợp lệ.");
        }

        if (startDate == null || endDate == null) {
            throw new BadRequestException("Thời gian áp dụng voucher không hợp lệ.");
        }

        if (endDate.isBefore(startDate)) {
            throw new BadRequestException("Ngày hết hạn phải sau hoặc bằng ngày bắt đầu.");
        }

        if (usageLimit != null && usageLimit < 0) {
            throw new BadRequestException("Số lần sử dụng tối đa phải lớn hơn hoặc bằng 0.");
        }
    }

    private String normalizeCode(String code) {
        if (code == null) {
            return "";
        }
        return code.trim().toUpperCase();
    }

    private Long normalizeMoney(Long value) {
        if (value == null || value <= 0) {
            return null;
        }
        return value;
    }

    private VoucherResponse mapToResponse(Voucher voucher) {
        return VoucherResponse.builder()
                .id(voucher.getId())
                .code(voucher.getCode())
                .name(voucher.getName())
                .discountType(voucher.getDiscountType())
                .discountValue(voucher.getDiscountValue())
                .minOrderValue(voucher.getMinOrderValue())
                .maxDiscount(voucher.getMaxDiscount())
                .startDate(voucher.getStartDate())
                .endDate(voucher.getEndDate())
                .usageLimit(voucher.getUsageLimit())
                .usedCount(voucher.getUsedCount())
                .active(voucher.getActive())
                .createdAt(voucher.getCreatedAt())
                .updatedAt(voucher.getUpdatedAt())
                .build();
    }
}
