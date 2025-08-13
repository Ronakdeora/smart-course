package com.smart.auth_service.services.serviceImpl;

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

    public String accessTokenForSubject(String uuid) {
        Instant now = Instant.now();
        var claims = JwtClaimsSet.builder()
                .issuer(props.getIssuer()) // issuer in our case auth-service
                .issuedAt(now)
                .expiresAt(now.plus(Duration.ofMinutes(props.getAccessTtlMin())))
                .subject(uuid)
//                .claim("aud", List.of("api")) <-- aud; or List.of("user-service")
//                .claim("scope", "profile.read profile.write") // adjust or remove
                .build();
        return encoder.encode(JwtEncoderParameters.from(claims)).getTokenValue();
    }
}
