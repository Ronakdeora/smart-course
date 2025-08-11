package com.smart.auth_service.config.properties;

import java.security.KeyFactory;
import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;

public final class KeyLoader {
    public static RSAPrivateKey loadPrivateKey(String pem) {
        String clean = pem.replaceAll("-----\\w+ PRIVATE KEY-----", "").replaceAll("\\s", "");
        byte[] der = Base64.getDecoder().decode(clean);
        try {
            return (RSAPrivateKey) KeyFactory.getInstance("RSA")
                    .generatePrivate(new PKCS8EncodedKeySpec(der));
        } catch (Exception e) { throw new IllegalStateException("Bad private key", e); }
    }
    public static RSAPublicKey loadPublicKey(String pem) {
        String clean = pem.replaceAll("-----\\w+ PUBLIC KEY-----", "").replaceAll("\\s", "");
        byte[] der = Base64.getDecoder().decode(clean);
        try {
            return (RSAPublicKey) KeyFactory.getInstance("RSA")
                    .generatePublic(new X509EncodedKeySpec(der));
        } catch (Exception e) { throw new IllegalStateException("Bad public key", e); }
    }
}
