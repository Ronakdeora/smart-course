package com.smart.auth_service.config;

import com.nimbusds.jose.jwk.JWKSet;
import com.nimbusds.jose.jwk.RSAKey;
import com.smart.auth_service.config.properties.KeyLoader;
import com.smart.auth_service.config.properties.SecurityProps;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

// 1) Central key beans
@Configuration
public class JwtKeyConfig {

    //this is going to create jwk
    @Bean
    RSAKey rsaJwk(SecurityProps p) throws IOException {
        String pemPublic = new String(p.getPublicKeyPem().getInputStream().readAllBytes(), StandardCharsets.UTF_8);
        String pemPrivate = new String(p.getPrivateKeyPem().getInputStream().readAllBytes(), StandardCharsets.UTF_8);
        var pub = KeyLoader.loadPublicKey(pemPublic);
        var prv = KeyLoader.loadPrivateKey(pemPrivate);
        return new RSAKey.Builder(pub)
                .privateKey(prv).keyID("kid-1").build();
    }

    @Bean
    public JwtEncoder jwtEncoder(SecurityProps p) throws IOException {
        var jwk = rsaJwk(p);
        return new NimbusJwtEncoder(new com.nimbusds.jose.jwk.source.ImmutableJWKSet<>(new com.nimbusds.jose.jwk.JWKSet(jwk)));
    }

    @Bean
    JWKSet publicJwkSet(RSAKey rsaJwk) {
        return new JWKSet(rsaJwk.toPublicJWK()); // expose PUBLIC only
    }
}

// 2) JWKS endpoint for exposing public keys
@RestController
class JwksController {
    private final JWKSet jwkSet;

    JwksController(JWKSet jwkSet) {
        this.jwkSet = jwkSet;
    }

    @GetMapping("/.well-known/jwks.json")
    public Map<String, Object> keys() {
        return jwkSet.toJSONObject();
    }
}

// 3) OIDC discovery (we are using issuer-uri this will also validate the issuer, we can also include audiences )
@RestController
class OidcDiscoveryController {
    private final SecurityProps props;

    OidcDiscoveryController(SecurityProps props) {
        this.props = props;
    }

    @GetMapping("/.well-known/openid-configuration")
    Map<String, Object> config() {
        String iss = props.getIssuer();
        return Map.of(
                "issuer", iss,
                "jwks_uri", iss + "/.well-known/jwks.json",
                "id_token_signing_alg_values_supported", List.of("RS256")
        );
    }
}

