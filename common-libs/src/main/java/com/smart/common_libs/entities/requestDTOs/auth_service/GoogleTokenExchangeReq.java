package com.smart.common_libs.entities.requestDTOs.auth_service;

import jakarta.validation.constraints.NotBlank;

public record GoogleTokenExchangeReq(
        @NotBlank(message = "Authorization code is required")
        String code
) {}
