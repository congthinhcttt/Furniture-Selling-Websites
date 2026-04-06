package bai4_qlsp_LeBinh.demo.service;

import bai4_qlsp_LeBinh.demo.repository.AccountRepository;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

class ReferralCodeGeneratorTests {

    @Test
    void generateUniqueCode_shouldGenerate8UppercaseLetters() {
        AccountRepository accountRepository = Mockito.mock(AccountRepository.class);
        Mockito.when(accountRepository.existsByReferralCode(Mockito.anyString())).thenReturn(false);

        ReferralCodeGenerator generator = new ReferralCodeGenerator(accountRepository);
        String code = generator.generateUniqueCode();

        Assertions.assertEquals(8, code.length());
        Assertions.assertTrue(code.matches("^[A-Z]{8}$"));
    }
}
