package com.smart.auth_service.config.properties;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "google.oauth")
@Data
public class GoogleOAuthProps {
    private String clientId;
    private String clientSecret;
    private String redirectUri;
}

