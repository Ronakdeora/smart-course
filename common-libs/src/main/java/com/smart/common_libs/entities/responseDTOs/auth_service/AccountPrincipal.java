package com.smart.common_libs.entities.responseDTOs.auth_service;

import java.util.UUID;

public record AccountPrincipal(
        UUID id,
        String email,
        String fullName
) {}