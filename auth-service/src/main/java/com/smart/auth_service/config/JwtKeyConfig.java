package com.smart.auth_service.config;

import com.nimbusds.jose.jwk.JWKSet;
import com.nimbusds.jose.jwk.RSAKey;
import com.nimbusds.jose.jwk.source.ImmutableJWKSet;
import com.smart.auth_service.config.properties.KeyLoader;
import com.smart.auth_service.config.properties.SecurityProps;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.util.List;
import java.util.Map;

// 1) Central key beans
@Configuration
public class JwtKeyConfig {
    @Bean
    RSAKey rsaJwk(SecurityProps p) {
        var pub = KeyLoader.loadPublicKey(p.getPublicKeyPem());
        var prv = KeyLoader.loadPrivateKey(p.getPrivateKeyPem());
        return new com.nimbusds.jose.jwk.RSAKey.Builder(pub)
                .privateKey(prv).keyID("kid-1").build();
    }

    @Bean
    public JwtEncoder jwtEncoder(SecurityProps p) {
        RSAPublicKey pub = KeyLoader.loadPublicKey(p.getPublicKeyPem());
        RSAPrivateKey prv = KeyLoader.loadPrivateKey(p.getPrivateKeyPem());
        var jwk = new com.nimbusds.jose.jwk.RSAKey.Builder(pub)
                .privateKey(prv).keyID("kid-1").build();
        return new NimbusJwtEncoder(new com.nimbusds.jose.jwk.source.ImmutableJWKSet<>(new com.nimbusds.jose.jwk.JWKSet(jwk)));
    }

    @Bean
    JWKSet publicJwkSet(RSAKey rsaJwk) {
        return new JWKSet(rsaJwk.toPublicJWK()); // expose PUBLIC only
    }
}

// 2) JWKS endpoint (keep this)
@RestController
class JwksController {
    private final JWKSet jwkSet;
    JwksController(JWKSet jwkSet) { this.jwkSet = jwkSet; }

    @GetMapping("/.well-known/jwks.json")
    public Map<String, Object> keys() { return jwkSet.toJSONObject(); }
}

// 3) OIDC discovery (you just added this; keep if using issuer-uri)
@RestController
class OidcDiscoveryController {
    private final SecurityProps props;
    OidcDiscoveryController(SecurityProps props) { this.props = props; }

    @GetMapping("/.well-known/openid-configuration")
    Map<String, Object> config() {
        String iss = props.getIssuer(); // e.g., http://localhost:9000
        return Map.of(
                "issuer", iss,
                "jwks_uri", iss + "/.well-known/jwks.json",
                "id_token_signing_alg_values_supported", List.of("RS256")
        );
    }
}

