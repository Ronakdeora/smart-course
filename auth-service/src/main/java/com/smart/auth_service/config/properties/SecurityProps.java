package com.smart.auth_service.config.properties;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.core.io.Resource;

@ConfigurationProperties(prefix = "security.jwt")
@Data
public class SecurityProps {
    private String issuer;
    private int accessTtlMin;
    private Resource privateKeyPem;
    private Resource publicKeyPem;
}
