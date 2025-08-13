package com.smart.common_libs.entities.requestDTOs.auth_service;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record RegisterReq(@Email String email, @NotBlank String password, @NotBlank String full_name) {}