package com.smart.user_service.security;

import org.springframework.security.core.context.ReactiveSecurityContextHolder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.util.UUID;

@Service
public final class SecurityUtils {

    public static Mono<UUID> getUserId(){
        return ReactiveSecurityContextHolder.getContext()
                .map(ctx -> (JwtAuthenticationToken) ctx.getAuthentication())
                .map(auth -> UUID.fromString(auth.getToken().getSubject()));
    }

    public static Mono<String> getUserName(){
        return ReactiveSecurityContextHolder.getContext()
                .map(ctx -> (JwtAuthenticationToken) ctx.getAuthentication())
                .map(auth -> auth.getToken().getClaimAsString("full_name"));
    }

    public static Mono<String> getUserEmail(){
        return ReactiveSecurityContextHolder.getContext()
                .map(ctx -> (JwtAuthenticationToken) ctx.getAuthentication())
                .map(auth -> auth.getToken().getClaimAsString("email"));
    }
}
