package com.smart.auth_service.services.serviceImpl;

import com.google.api.client.googleapis.auth.oauth2.GoogleAuthorizationCodeTokenRequest;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.googleapis.auth.oauth2.GoogleTokenResponse;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.smart.auth_service.config.properties.GoogleOAuthProps;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

import java.util.Collections;

@Service
@RequiredArgsConstructor
@Slf4j
public class GoogleOAuthService {

    private final GoogleOAuthProps googleOAuthProps;
    private final NetHttpTransport httpTransport = new NetHttpTransport();
    private final GsonFactory jsonFactory = GsonFactory.getDefaultInstance();

    /**
     * Exchange authorization code for Google tokens
     */
    public Mono<GoogleTokenResponse> exchangeAuthorizationCode(String authorizationCode) {
        return Mono.fromCallable(() -> {
            log.debug("Exchanging authorization code with Google");

            GoogleTokenResponse tokenResponse = new GoogleAuthorizationCodeTokenRequest(
                    httpTransport,
                    jsonFactory,
                    "https://oauth2.googleapis.com/token",
                    googleOAuthProps.getClientId(),
                    googleOAuthProps.getClientSecret(),
                    authorizationCode,
                    googleOAuthProps.getRedirectUri()
            ).execute();

            log.debug("Successfully exchanged authorization code for tokens");
            return tokenResponse;
        }).subscribeOn(Schedulers.boundedElastic());
    }

    /**
     * Verify and extract user info from Google ID token
     */
    public Mono<GoogleUserInfo> verifyAndExtractUserInfo(String idTokenString) {
        return Mono.fromCallable(() -> {
            log.debug("Verifying Google ID token");

            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(httpTransport, jsonFactory)
                    .setAudience(Collections.singletonList(googleOAuthProps.getClientId()))
                    .build();

            GoogleIdToken idToken = verifier.verify(idTokenString);
            if (idToken == null) {
                throw new IllegalArgumentException("Invalid ID token");
            }

            GoogleIdToken.Payload payload = idToken.getPayload();

            String email = payload.getEmail();
            boolean emailVerified = payload.getEmailVerified();
            String name = (String) payload.get("name");
            String pictureUrl = (String) payload.get("picture");
            String googleId = payload.getSubject();

            if (!emailVerified) {
                throw new IllegalArgumentException("Email not verified by Google");
            }

            log.debug("Successfully verified ID token for email: {}", email);

            return new GoogleUserInfo(googleId, email, name, pictureUrl, emailVerified);
        }).subscribeOn(Schedulers.boundedElastic());
    }

    /**
     * DTO for Google user information
     */
    public record GoogleUserInfo(
            String googleId,
            String email,
            String name,
            String pictureUrl,
            boolean emailVerified
    ) {}
}

