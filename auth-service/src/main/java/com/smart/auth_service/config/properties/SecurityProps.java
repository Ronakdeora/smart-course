package com.smart.auth_service.config.properties;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "security.jwt")
@Data
public class SecurityProps {
    private String issuer;
    private int accessTtlMin;
    private String privateKeyPem;
    private String publicKeyPem;
}
