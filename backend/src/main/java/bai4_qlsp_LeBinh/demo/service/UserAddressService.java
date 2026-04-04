package bai4_qlsp_LeBinh.demo.service;

import bai4_qlsp_LeBinh.demo.dto.request.UserAddressRequest;
import bai4_qlsp_LeBinh.demo.dto.response.UserAddressResponse;
import bai4_qlsp_LeBinh.demo.entity.Account;
import bai4_qlsp_LeBinh.demo.entity.UserAddress;
import bai4_qlsp_LeBinh.demo.repository.AccountRepository;
import bai4_qlsp_LeBinh.demo.repository.UserAddressRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class UserAddressService {

    private final UserAddressRepository userAddressRepository;
    private final AccountRepository accountRepository;

    public UserAddressService(UserAddressRepository userAddressRepository, AccountRepository accountRepository) {
        this.userAddressRepository = userAddressRepository;
        this.accountRepository = accountRepository;
    }

    @Transactional(readOnly = true)
    public List<UserAddressResponse> getAddressesByAccountId(Integer accountId) {
        return userAddressRepository.findByAccountIdOrderByIsDefaultDescUpdatedAtDesc(accountId.longValue())
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional
    public UserAddressResponse createAddress(Integer accountId, UserAddressRequest request) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new RuntimeException("Khong tim thay tai khoan"));

        boolean shouldSetDefault = request.isDefault() || !userAddressRepository.existsByAccountId(accountId.longValue());
        if (shouldSetDefault) {
            userAddressRepository.clearDefaultByAccountId(accountId.longValue());
        }

        LocalDateTime now = LocalDateTime.now();
        UserAddress address = new UserAddress();
        address.setAccount(account);
        address.setFullName(request.getFullName().trim());
        address.setPhone(request.getPhone().trim());
        address.setAddressLine(request.getAddressLine().trim());
        address.setLabel(request.getLabel() != null ? request.getLabel().trim() : "");
        address.setDefault(shouldSetDefault);
        address.setCreatedAt(now);
        address.setUpdatedAt(now);

        return mapToResponse(userAddressRepository.save(address));
    }

    @Transactional
    public UserAddressResponse updateAddress(Integer accountId, Long addressId, UserAddressRequest request) {
        UserAddress address = getOwnedAddress(accountId, addressId);
        boolean shouldSetDefault = request.isDefault();
        if (shouldSetDefault) {
            userAddressRepository.clearDefaultByAccountId(accountId.longValue());
        }

        address.setFullName(request.getFullName().trim());
        address.setPhone(request.getPhone().trim());
        address.setAddressLine(request.getAddressLine().trim());
        address.setLabel(request.getLabel() != null ? request.getLabel().trim() : "");
        address.setDefault(shouldSetDefault || (!hasAnotherDefault(accountId, addressId) && address.isDefault()));
        address.setUpdatedAt(LocalDateTime.now());

        UserAddress saved = userAddressRepository.save(address);
        ensureDefaultAddress(accountId);
        return mapToResponse(saved);
    }

    @Transactional
    public void deleteAddress(Integer accountId, Long addressId) {
        UserAddress address = getOwnedAddress(accountId, addressId);
        userAddressRepository.delete(address);
        ensureDefaultAddress(accountId);
    }

    @Transactional
    public UserAddressResponse setDefaultAddress(Integer accountId, Long addressId) {
        UserAddress address = getOwnedAddress(accountId, addressId);
        userAddressRepository.clearDefaultByAccountId(accountId.longValue());
        address.setDefault(true);
        address.setUpdatedAt(LocalDateTime.now());
        return mapToResponse(userAddressRepository.save(address));
    }

    private UserAddress getOwnedAddress(Integer accountId, Long addressId) {
        return userAddressRepository.findByIdAndAccountId(addressId, accountId.longValue())
                .orElseThrow(() -> new RuntimeException("Khong tim thay dia chi"));
    }

    private void ensureDefaultAddress(Integer accountId) {
        List<UserAddress> addresses = userAddressRepository.findByAccountIdOrderByIsDefaultDescUpdatedAtDesc(accountId.longValue());
        if (addresses.isEmpty() || addresses.stream().anyMatch(UserAddress::isDefault)) {
            return;
        }

        UserAddress first = addresses.get(0);
        first.setDefault(true);
        first.setUpdatedAt(LocalDateTime.now());
        userAddressRepository.save(first);
    }

    private boolean hasAnotherDefault(Integer accountId, Long addressId) {
        return userAddressRepository.findByAccountIdOrderByIsDefaultDescUpdatedAtDesc(accountId.longValue())
                .stream()
                .anyMatch(address -> !address.getId().equals(addressId) && address.isDefault());
    }

    private UserAddressResponse mapToResponse(UserAddress address) {
        return UserAddressResponse.builder()
                .id(address.getId())
                .fullName(address.getFullName())
                .phone(address.getPhone())
                .addressLine(address.getAddressLine())
                .label(address.getLabel())
                .isDefault(address.isDefault())
                .createdAt(address.getCreatedAt())
                .updatedAt(address.getUpdatedAt())
                .build();
    }
}
