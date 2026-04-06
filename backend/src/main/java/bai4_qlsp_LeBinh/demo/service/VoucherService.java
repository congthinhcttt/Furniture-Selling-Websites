package bai4_qlsp_LeBinh.demo.service;

import bai4_qlsp_LeBinh.demo.dto.request.VoucherApplyRequest;
import bai4_qlsp_LeBinh.demo.dto.request.VoucherCreateRequest;
import bai4_qlsp_LeBinh.demo.dto.request.VoucherUpdateRequest;
import bai4_qlsp_LeBinh.demo.dto.response.VoucherApplyResponse;
import bai4_qlsp_LeBinh.demo.dto.response.VoucherResponse;
import bai4_qlsp_LeBinh.demo.entity.Account;
import bai4_qlsp_LeBinh.demo.entity.Voucher;
import bai4_qlsp_LeBinh.demo.enums.VoucherDiscountType;
import bai4_qlsp_LeBinh.demo.exception.BadRequestException;
import bai4_qlsp_LeBinh.demo.exception.ConflictException;
import bai4_qlsp_LeBinh.demo.exception.ResourceNotFoundException;
import bai4_qlsp_LeBinh.demo.repository.VoucherRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

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
            throw new ConflictException("Ma voucher da ton tai.");
        }

        Voucher voucher = new Voucher();
        applyVoucherData(voucher, request.getCode(), request.getName(), request.getDescription(),
                request.getDiscountType(), request.getDiscountValue(),
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
                    throw new ConflictException("Ma voucher da ton tai.");
                });

        applyVoucherData(voucher, request.getCode(), request.getName(), request.getDescription(),
                request.getDiscountType(), request.getDiscountValue(),
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
        return getAvailableVouchersForUser(null);
    }

    @Transactional(readOnly = true)
    public List<VoucherResponse> getAvailableVouchersForUser(Integer userId) {
        LocalDateTime now = LocalDateTime.now();
        List<Voucher> vouchers = new ArrayList<>(voucherRepository.findAllByActiveTrueOrderByCreatedAtDesc());

        if (userId != null) {
            vouchers.addAll(voucherRepository.findAllByActiveTrueAndCreatedForUser_IdOrderByCreatedAtDesc(userId));
        }

        return vouchers.stream()
                .distinct()
                .filter(voucher -> !voucher.getStartDate().isAfter(now))
                .filter(voucher -> !voucher.getEndDate().isBefore(now))
                .filter(voucher -> voucher.getUsageLimit() == null
                        || voucher.getUsageLimit() <= 0
                        || voucher.getUsedCount() < voucher.getUsageLimit())
                .filter(voucher -> voucher.getCreatedForUser() == null
                        || userId == null
                        || voucher.getCreatedForUser().getId().equals(userId))
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
        return applyVoucher(code, subtotal, null);
    }

    @Transactional(readOnly = true)
    public VoucherApplyResponse applyVoucher(VoucherApplyRequest request) {
        if (request == null) {
            throw new BadRequestException("Thong tin ma giam gia khong hop le.");
        }
        return applyVoucher(request.getCode(), request.getSubtotal(), null);
    }

    @Transactional(readOnly = true)
    public VoucherApplyResponse applyVoucher(String code, Long subtotal) {
        return applyVoucher(code, subtotal, null);
    }

    @Transactional(readOnly = true)
    public VoucherApplyResponse applyVoucher(String code, Long subtotal, Integer accountId) {
        if (subtotal == null || subtotal <= 0) {
            throw new BadRequestException("Gia tri don hang phai lon hon 0.");
        }

        Voucher voucher = getVoucherByCode(code);
        validateVoucherAvailability(voucher, subtotal);
        validateVoucherOwnership(voucher, accountId);

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
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay voucher."));
    }

    @Transactional(readOnly = true)
    public Voucher getVoucherByCode(String code) {
        return voucherRepository.findByCode(normalizeCode(code))
                .orElseThrow(() -> new ResourceNotFoundException("Ma giam gia khong ton tai"));
    }

    @Transactional(readOnly = true)
    public boolean hasVoucherSourceForUser(String source, Integer userId) {
        if (source == null || userId == null) {
            return false;
        }
        return voucherRepository.existsBySourceAndCreatedForUser_Id(source, userId);
    }

    @Transactional
    public Voucher createAffiliateVoucher(Account beneficiary,
                                          VoucherDiscountType discountType,
                                          Long discountValue,
                                          Long minOrderValue,
                                          Long maxDiscount,
                                          Integer expiryDays,
                                          Long affiliateReferralId,
                                          String source,
                                          String voucherName,
                                          String voucherDescription) {
        if (beneficiary == null || beneficiary.getId() == null) {
            throw new BadRequestException("Nguoi nhan voucher khong hop le");
        }
        if (discountType == null || discountValue == null || discountValue <= 0) {
            throw new BadRequestException("Cau hinh voucher affiliate khong hop le");
        }
        if (discountType == VoucherDiscountType.PERCENT && discountValue > 100) {
            throw new BadRequestException("Voucher phan tram affiliate khong duoc vuot 100");
        }
        if (expiryDays == null || expiryDays <= 0) {
            throw new BadRequestException("voucherExpiryDays phai lon hon 0");
        }

        LocalDateTime now = LocalDateTime.now();

        Voucher voucher = new Voucher();
        voucher.setCode(generateUniqueAffiliateVoucherCode());
        voucher.setName(voucherName != null && !voucherName.isBlank() ? voucherName.trim() : "Affiliate Reward");
        voucher.setDescription(voucherDescription != null ? voucherDescription.trim() : null);
        voucher.setDiscountType(discountType);
        voucher.setDiscountValue(discountValue);
        voucher.setMinOrderValue(normalizeMoney(minOrderValue));
        voucher.setMaxDiscount(discountType == VoucherDiscountType.PERCENT ? normalizeMoney(maxDiscount) : null);
        voucher.setStartDate(now);
        voucher.setEndDate(now.plusDays(expiryDays));
        voucher.setUsageLimit(1);
        voucher.setUsedCount(0);
        voucher.setActive(true);
        voucher.setCreatedForUser(beneficiary);
        voucher.setSource(source != null ? source : "AFFILIATE");
        voucher.setAffiliateReferralId(affiliateReferralId);
        return voucherRepository.save(voucher);
    }

    private void incrementVoucherUsage(Voucher voucher) {
        validateVoucherAvailability(voucher, Long.MAX_VALUE);

        voucher.setUsedCount(voucher.getUsedCount() + 1);
        voucherRepository.save(voucher);
    }

    private void validateVoucherAvailability(Voucher voucher, Long subtotal) {
        LocalDateTime now = LocalDateTime.now();

        if (!Boolean.TRUE.equals(voucher.getActive())) {
            throw new BadRequestException("Ma giam gia hien khong kha dung");
        }

        if (voucher.getStartDate().isAfter(now)) {
            throw new BadRequestException("Ma giam gia chua den thoi gian su dung");
        }

        if (voucher.getEndDate().isBefore(now)) {
            throw new BadRequestException("Ma giam gia da het han");
        }

        if (voucher.getUsageLimit() != null && voucher.getUsageLimit() > 0
                && voucher.getUsedCount() >= voucher.getUsageLimit()) {
            throw new BadRequestException("Ma giam gia da het luot su dung");
        }

        if (subtotal != null && subtotal != Long.MAX_VALUE
                && voucher.getMinOrderValue() != null
                && subtotal < voucher.getMinOrderValue()) {
            throw new BadRequestException("Don hang chua dat gia tri toi thieu de ap dung ma");
        }
    }

    private void validateVoucherOwnership(Voucher voucher, Integer accountId) {
        if (voucher.getCreatedForUser() == null) {
            return;
        }
        if (accountId == null || !voucher.getCreatedForUser().getId().equals(accountId)) {
            throw new BadRequestException("Voucher nay khong duoc cap cho tai khoan cua ban");
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
                                  String description,
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
        voucher.setDescription(description != null ? description.trim() : null);
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
            throw new BadRequestException("Ma voucher khong duoc de trong.");
        }

        if (name == null || name.isBlank()) {
            throw new BadRequestException("Ten voucher khong duoc de trong.");
        }

        if (discountType == null) {
            throw new BadRequestException("Loai giam gia khong hop le.");
        }

        if (discountValue == null || discountValue <= 0) {
            throw new BadRequestException("Gia tri giam phai lon hon 0.");
        }

        if (discountType == VoucherDiscountType.PERCENT && discountValue > 100) {
            throw new BadRequestException("Voucher phan tram khong duoc lon hon 100%.");
        }

        if (minOrderValue != null && minOrderValue < 0) {
            throw new BadRequestException("Gia tri don hang toi thieu khong hop le.");
        }

        if (maxDiscount != null && maxDiscount < 0) {
            throw new BadRequestException("Muc giam toi da khong hop le.");
        }

        if (startDate == null || endDate == null) {
            throw new BadRequestException("Thoi gian ap dung voucher khong hop le.");
        }

        if (endDate.isBefore(startDate)) {
            throw new BadRequestException("Ngay het han phai sau hoac bang ngay bat dau.");
        }

        if (usageLimit != null && usageLimit < 0) {
            throw new BadRequestException("So lan su dung toi da phai lon hon hoac bang 0.");
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

    private String generateUniqueAffiliateVoucherCode() {
        for (int i = 0; i < 10; i++) {
            String code = "AFF" + UUID.randomUUID().toString().replace("-", "").substring(0, 10).toUpperCase();
            if (!voucherRepository.existsByCode(code)) {
                return code;
            }
        }
        throw new ConflictException("Khong the tao ma voucher affiliate duy nhat");
    }

    private VoucherResponse mapToResponse(Voucher voucher) {
        return VoucherResponse.builder()
                .id(voucher.getId())
                .code(voucher.getCode())
                .name(voucher.getName())
                .description(voucher.getDescription())
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
