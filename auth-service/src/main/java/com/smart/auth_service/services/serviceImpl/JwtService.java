package com.smart.auth_service.services.serviceImpl;

import com.smart.auth_service.config.properties.SecurityProps;
import com.smart.common_libs.entities.responseDTOs.auth_service.AccountPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;

@Service
@RequiredArgsConstructor
public class JwtService {
    private final JwtEncoder encoder;
    private final SecurityProps props;

    public String accessTokenForSubject(AccountPrincipal account) {
        Instant now = Instant.now();
        var claims = JwtClaimsSet.builder()
                .issuer(props.getIssuer()) // issuer in our case auth-service
                .issuedAt(now)
                .expiresAt(now.plus(Duration.ofMinutes(props.getAccessTtlMin())))
                .subject(String.valueOf(account.id()))
                .claim("email",account.email())
                .claim("full_name",account.fullName())
//                .claim("aud", List.of("api")) <-- aud; or List.of("user-service")
//                .claim("scope", "profile.read profile.write") // adjust or remove
                .build();
        return encoder.encode(JwtEncoderParameters.from(claims)).getTokenValue();
    }
}
