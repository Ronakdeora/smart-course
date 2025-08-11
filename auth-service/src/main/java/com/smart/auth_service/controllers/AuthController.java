package com.smart.auth_service.controllers;


import com.smart.auth_service.entities.Account;
import com.smart.auth_service.repositories.AccountRepo;
import com.smart.auth_service.services.JwtService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Mono;

import java.time.Instant;
import java.util.UUID;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AccountRepo accounts;
    private final PasswordEncoder encoder;
    private final JwtService jwt;

    // DTOs
    public record RegisterReq(@Email String email, @NotBlank String password) {}
    public record LoginReq(String email, String password) {}
    public record TokenRes(String accessToken, long expiresInSec) {}

    @PostMapping("/register")
    public Mono<ResponseEntity<Void>> register(@Valid @RequestBody RegisterReq req) {
        var acc = Account.builder()
                .email(req.email)
                .passwordHash(encoder.encode(req.password()))
                .isActive(true)
                .createdAt(Instant.now()).build();
//        var acc = new Account(
//                null,
//                req.email(),
//                encoder.encode(req.password()),
//                true, null, null, null
//        );

        return accounts.findByEmail(req.email())
                // If found -> 409
                .flatMap(existing -> Mono.<ResponseEntity<Void>>error(
                        new ResponseStatusException(HttpStatus.CONFLICT, "Email already exists")))
                // If empty -> save and return 201
                .switchIfEmpty(
                        accounts.save(acc)
                                .then(Mono.just(ResponseEntity.status(HttpStatus.CREATED).build()))
                )
                // Handle concurrent duplicate insert (DB unique index on email)
                .onErrorResume(org.springframework.dao.DuplicateKeyException.class, ex ->
                        Mono.error(new ResponseStatusException(HttpStatus.CONFLICT, "Email already exists")));
    }


    @PostMapping("/login")
    public Mono<TokenRes> login(@RequestBody LoginReq req) {
        return accounts.findByEmail(req.email())
                .switchIfEmpty(Mono.error(new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials")))
                .flatMap(acc -> {
                    if (!acc.isActive() || !encoder.matches(req.password(), acc.getPasswordHash())) {
                        return Mono.error(new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));
                    }
                    var token = jwt.accessTokenForSubject(acc.getId().toString());
                    return Mono.just(new TokenRes(token, 60L * 15)); // match access-ttl-min
                });
    }
}
