package com.smart.user_service.config;

import com.smart.common.security.CommonSecurityConfig;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;

@Configuration
@Import(CommonSecurityConfig.class)
public class SecurityImportConfig {
    // This class imports the shared security configuration
}

