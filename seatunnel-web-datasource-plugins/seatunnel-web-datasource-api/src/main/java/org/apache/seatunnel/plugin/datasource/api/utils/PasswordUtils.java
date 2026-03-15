
package org.apache.seatunnel.plugin.datasource.api.utils;


import lombok.extern.slf4j.Slf4j;
import org.apache.commons.codec.binary.Base64;
import org.apache.commons.lang3.StringUtils;

import java.nio.charset.StandardCharsets;

@Slf4j
public class PasswordUtils {
    public static final String DATASOURCE_ENCRYPTION_SALT_DEFAULT = "!@#$%^&*";
    private static final Base64 BASE64 = new Base64();

    private PasswordUtils() {
        throw new UnsupportedOperationException("Construct PasswordUtils");
    }

    /**
     * encode password
     */
    public static String encodePassword(String password) {
        if (StringUtils.isEmpty(password)) {
            return StringUtils.EMPTY;
        }

        // Using Base64 + salt to process password
        String passwordWithSalt = DATASOURCE_ENCRYPTION_SALT_DEFAULT + new String(BASE64.encode(password.getBytes(
                StandardCharsets.UTF_8)));
        return new String(BASE64.encode(passwordWithSalt.getBytes(StandardCharsets.UTF_8)));
    }

    /**
     * decode password
     */
    public static String decodePassword(String password) {
        if (StringUtils.isEmpty(password)) {
            return StringUtils.EMPTY;
        }
        // Using Base64 + salt to process password
        String passwordWithSalt = new String(BASE64.decode(password), StandardCharsets.UTF_8);
        if (!passwordWithSalt.startsWith(DATASOURCE_ENCRYPTION_SALT_DEFAULT)) {
            log.warn("There is a password and salt mismatch: {} ", password);
            return password;
        }
        return new String(BASE64.decode(passwordWithSalt.substring(DATASOURCE_ENCRYPTION_SALT_DEFAULT.length())), StandardCharsets.UTF_8);
    }

    public static void main(String[] args) {
        String s = encodePassword("123456"); // IUAjJCVeJipNVEl6TkRVMg==
        System.out.println(s);
    }

}
