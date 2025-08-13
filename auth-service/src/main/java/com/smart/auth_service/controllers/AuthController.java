package com.smart.auth_service.controllers;


import com.smart.auth_service.entities.Account;
import com.smart.auth_service.repositories.AccountRepo;
import com.smart.auth_service.services.IAuthService;
import com.smart.auth_service.services.serviceImpl.JwtService;
import com.smart.auth_service.services.rabbitmq.publishers.MQPublisher;
import com.smart.common_libs.entities.requestDTOs.auth_service.LoginReq;
import com.smart.common_libs.entities.requestDTOs.auth_service.RegisterReq;
import com.smart.common_libs.entities.responseDTOs.auth_service.TokenRes;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.ReactiveAuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Mono;

import java.time.Instant;

@RestController
@RequestMapping("/auth")
@AllArgsConstructor
public class AuthController {

    private IAuthService authService;

    @PostMapping("/register")
    public Mono<ResponseEntity<Void>> register(@Valid @RequestBody RegisterReq req) {
        return authService.registerNewUser(req);
    }

    @PostMapping("/login")
    public Mono<TokenRes> login(@RequestBody LoginReq req) {
        return authService.authenticateLogin(req);
    }
}
