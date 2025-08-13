package com.smart.common_libs.entities.responseDTOs.auth_service;


public record TokenRes(String accessToken, long expiresInSec) {}
