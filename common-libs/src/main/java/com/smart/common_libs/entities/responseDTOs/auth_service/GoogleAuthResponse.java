package com.smart.common_libs.entities.responseDTOs.auth_service;

import java.util.UUID;

public record GoogleAuthResponse(
        String accessToken,
        long expiresInSec,
        UserInfo user
) {
    public record UserInfo(
            UUID id,
            String email,
            String fullName,
            boolean profileCompleted,
            boolean onboardingCompleted
    ) {}
}

