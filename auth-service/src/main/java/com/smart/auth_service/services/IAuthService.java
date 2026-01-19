package com.smart.auth_service.services;

import com.smart.common_libs.entities.requestDTOs.auth_service.GoogleTokenExchangeReq;
import com.smart.common_libs.entities.requestDTOs.auth_service.LoginReq;
import com.smart.common_libs.entities.requestDTOs.auth_service.RegisterReq;
import com.smart.common_libs.entities.responseDTOs.auth_service.GoogleAuthResponse;
import com.smart.common_libs.entities.responseDTOs.auth_service.TokenRes;
import org.springframework.http.ResponseEntity;
import reactor.core.publisher.Mono;

public interface IAuthService {
    Mono<ResponseEntity<Void>> registerNewUser(RegisterReq req);

    Mono<TokenRes> authenticateLogin(LoginReq req);

    Mono<GoogleAuthResponse> googleTokenExchange(GoogleTokenExchangeReq req);
}
