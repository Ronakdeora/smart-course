package com.smart.auth_service.controllers;


import com.smart.auth_service.services.IAuthService;
import com.smart.common_libs.entities.requestDTOs.auth_service.GoogleTokenExchangeReq;
import com.smart.common_libs.entities.requestDTOs.auth_service.LoginReq;
import com.smart.common_libs.entities.requestDTOs.auth_service.RegisterReq;
import com.smart.common_libs.entities.responseDTOs.auth_service.GoogleAuthResponse;
import com.smart.common_libs.entities.responseDTOs.auth_service.TokenRes;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

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

    @PostMapping("/google/exchange")
    public Mono<GoogleAuthResponse> googleTokenExchange(@Valid @RequestBody GoogleTokenExchangeReq req) {
        return authService.googleTokenExchange(req);
    }
}
