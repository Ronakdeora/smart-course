package com.smart.auth_service.services;

import com.smart.auth_service.config.properties.SecurityProps;
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

    public String accessTokenForSubject(String email) {
        Instant now = Instant.now();
        var claims = JwtClaimsSet.builder()
                .issuer(props.getIssuer())
                .issuedAt(now)
                .expiresAt(now.plus(Duration.ofMinutes(props.getAccessTtlMin())))
                .subject(email)
//                .claim("scope", "profile.read profile.write") // adjust or remove
                .build();
        return encoder.encode(JwtEncoderParameters.from(claims)).getTokenValue();
    }
}
