package com.smart.auth_service.services.serviceImpl;

import com.smart.auth_service.config.properties.SecurityProps;
import com.smart.auth_service.utils.entities.Account;
import com.smart.auth_service.utils.repositories.AccountRepo;
import com.smart.auth_service.services.IAuthService;
import com.smart.auth_service.services.rabbitmq.publishers.MQPublisher;
import com.smart.common_libs.entities.requestDTOs.auth_service.GoogleTokenExchangeReq;
import com.smart.common_libs.entities.requestDTOs.auth_service.LoginReq;
import com.smart.common_libs.entities.requestDTOs.auth_service.RegisterReq;
import com.smart.common_libs.entities.responseDTOs.auth_service.AccountPrincipal;
import com.smart.common_libs.entities.responseDTOs.auth_service.GoogleAuthResponse;
import com.smart.common_libs.entities.responseDTOs.auth_service.TokenRes;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
@Slf4j
public class AuthService implements IAuthService {

    private final AccountRepo accounts;
    private final PasswordEncoder encoder;
    private final JwtService jwt;
    private final MQPublisher publisher;
    private final ReactiveAuthenticationManager authenticationManager;
    private final SecurityProps securityProps;
    private final GoogleOAuthService googleOAuthService;


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

    @Override
    public Mono<GoogleAuthResponse> googleTokenExchange(GoogleTokenExchangeReq req) {
        log.info("Starting Google OAuth token exchange");

        return googleOAuthService.exchangeAuthorizationCode(req.code())
                .flatMap(tokenResponse ->
                    googleOAuthService.verifyAndExtractUserInfo(tokenResponse.getIdToken())
                        .flatMap(googleUserInfo ->
                            findOrCreateGoogleUser(googleUserInfo)
                                .map(account -> {
                                    // Generate JWT token
                                    AccountPrincipal principal = new AccountPrincipal(
                                            account.getId(),
                                            account.getEmail(),
                                            account.getFullName()
                                    );
                                    String jwtToken = jwt.accessTokenForSubject(principal);

                                    // Build response with user info
                                    GoogleAuthResponse.UserInfo userInfo = new GoogleAuthResponse.UserInfo(
                                            account.getId(),
                                            account.getEmail(),
                                            account.getFullName(),
                                            false,  // profileCompleted - can be enhanced later
                                            false   // onboardingCompleted - can be enhanced later
                                    );

                                    log.info("Successfully authenticated Google user: {}", account.getEmail());

                                    return new GoogleAuthResponse(
                                            jwtToken,
                                            securityProps.getAccessTtlMin() * 60L,
                                            userInfo
                                    );
                                })
                        )
                )
                .onErrorResume(Exception.class, e -> {
                    log.error("Error during Google OAuth token exchange: {}", e.getMessage(), e);
                    return Mono.error(new ResponseStatusException(
                            HttpStatus.UNAUTHORIZED,
                            "Google authentication failed: " + e.getMessage()
                    ));
                });
    }

    /**
     * Find existing user by Google ID or email, or create a new one
     */
    private Mono<Account> findOrCreateGoogleUser(GoogleOAuthService.GoogleUserInfo googleUserInfo) {
        // First, try to find by Google ID
        return accounts.findByGoogleId(googleUserInfo.googleId())
                .switchIfEmpty(
                    // If not found by Google ID, try to find by email
                    accounts.findByEmail(googleUserInfo.email())
                            .flatMap(existingAccount -> {
                                // Link Google account to existing email account
                                log.info("Linking Google account to existing user: {}", existingAccount.getEmail());
                                existingAccount.setGoogleId(googleUserInfo.googleId());
                                existingAccount.setProfilePictureUrl(googleUserInfo.pictureUrl());
                                existingAccount.setEmailVerifiedAt(Instant.now());
                                return accounts.save(existingAccount);
                            })
                            .switchIfEmpty(
                                // Create new account
                                createNewGoogleUser(googleUserInfo)
                            )
                );
    }

    /**
     * Create a new user account from Google OAuth information
     */
    private Mono<Account> createNewGoogleUser(GoogleOAuthService.GoogleUserInfo googleUserInfo) {
        log.info("Creating new user from Google OAuth: {}", googleUserInfo.email());

        Account newAccount = Account.builder()
                .email(googleUserInfo.email())
                .fullName(googleUserInfo.name())
                .googleId(googleUserInfo.googleId())
                .profilePictureUrl(googleUserInfo.pictureUrl())
                .passwordHash(null)  // No password for OAuth users
                .isActive(true)
                .emailVerifiedAt(Instant.now())  // Email verified by Google
                .createdAt(Instant.now())
                .build();

        return accounts.save(newAccount)
                .doOnNext(account -> {
                    // Publish user registration event to RabbitMQ
                    publisher.userRegistered(account.getId(), account.getEmail(), account.getFullName());
                    log.info("New Google user created and event published: {}", account.getEmail());
                });
    }
}
