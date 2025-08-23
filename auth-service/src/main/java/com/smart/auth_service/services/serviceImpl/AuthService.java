package com.smart.auth_service.services.serviceImpl;

import com.smart.auth_service.config.properties.SecurityProps;
import com.smart.auth_service.utils.entities.Account;
import com.smart.auth_service.utils.repositories.AccountRepo;
import com.smart.auth_service.services.IAuthService;
import com.smart.auth_service.services.rabbitmq.publishers.MQPublisher;
import com.smart.common_libs.entities.requestDTOs.auth_service.LoginReq;
import com.smart.common_libs.entities.requestDTOs.auth_service.RegisterReq;
import com.smart.common_libs.entities.responseDTOs.auth_service.AccountPrincipal;
import com.smart.common_libs.entities.responseDTOs.auth_service.TokenRes;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.ReactiveAuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Mono;

import java.time.Instant;

@Service
@AllArgsConstructor
public class AuthService implements IAuthService {

    private final AccountRepo accounts;
    private final PasswordEncoder encoder;
    private final JwtService jwt;
    private MQPublisher publisher;
    private final ReactiveAuthenticationManager authenticationManager;
    private SecurityProps securityProps;


    @Override
    public Mono<ResponseEntity<Void>> registerNewUser(RegisterReq req) {
        var acc = Account.builder()
                .email(req.email())
                .passwordHash(encoder.encode(req.password()))
                .fullName(req.full_name())
                .isActive(true)
                .createdAt(Instant.now()).build();

        return accounts.findByEmail(req.email())
                // If found -> 409
                .flatMap(existing -> Mono.<ResponseEntity<Void>>error(
                        new ResponseStatusException(HttpStatus.CONFLICT, "Email already exists")))
                // If empty -> save and return 201
                .switchIfEmpty(
                        accounts.save(acc)
                                .doOnNext(account -> publisher.userRegistered(account.getId(), account.getEmail(), account.getFullName()))
                                .then(Mono.just(ResponseEntity.status(HttpStatus.CREATED).build()))
                )
                // Handle concurrent duplicate insert (DB unique index on email)
                .onErrorResume(org.springframework.dao.DuplicateKeyException.class, ex ->
                        Mono.error(new ResponseStatusException(HttpStatus.CONFLICT, "Email already exists")));
    }


    @Override
    public Mono<TokenRes> authenticateLogin(LoginReq req) {
        var unauth = UsernamePasswordAuthenticationToken.unauthenticated(req.email(), req.password());

        return authenticationManager.authenticate(unauth)
                .map(auth -> (AccountPrincipal) auth.getPrincipal())        // userId as String
                .map(user -> {
                    var token = jwt.accessTokenForSubject(user);
                    return new TokenRes(token, securityProps.getAccessTtlMin()*60L);
                })
                .onErrorResume(e ->
                        Mono.error(new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials")));
    }
}
