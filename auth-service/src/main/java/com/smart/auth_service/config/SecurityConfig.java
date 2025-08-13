package com.smart.auth_service.config;

import com.smart.auth_service.entities.Account;
import com.smart.auth_service.repositories.AccountRepo;
import com.smart.common_libs.entities.responseDTOs.auth_service.AccountPrincipal;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.ReactiveAuthenticationManager;
import org.springframework.security.authentication.UserDetailsRepositoryReactiveAuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.core.userdetails.ReactiveUserDetailsService;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.server.SecurityWebFilterChain;
import reactor.core.publisher.Mono;

import java.util.Collections;

@Configuration
@EnableWebFluxSecurity
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return PasswordEncoderFactories.createDelegatingPasswordEncoder(); // BCrypt/Argon2
    }

    @Bean
    ReactiveAuthenticationManager authenticationManager(
            AccountRepo accounts, PasswordEncoder encoder) {

        return auth -> {
            String email = auth.getName();
            String raw = String.valueOf(auth.getCredentials());

            return accounts.findByEmail(email)
                    .filter(Account::isActive)
                    .filter(acc -> encoder.matches(raw, acc.getPasswordHash()))
                    .switchIfEmpty(Mono.error(new BadCredentialsException("Invalid credentials")))
                    .map(acc -> new UsernamePasswordAuthenticationToken(
                            new AccountPrincipal(acc.getId(),acc.getEmail(),acc.getFullName()),                      // complete account object
                            null
                    ));
        };
    }

    @Bean
    public SecurityWebFilterChain chain(ServerHttpSecurity http){
        return http.csrf(ServerHttpSecurity.CsrfSpec::disable)
                .authorizeExchange( ex -> ex
                        .pathMatchers("/auth/**","/.well-known/**").permitAll()
                        .anyExchange().permitAll())
                .httpBasic(ServerHttpSecurity.HttpBasicSpec::disable)
                .formLogin(ServerHttpSecurity.FormLoginSpec::disable)
                .build();
    }
}
