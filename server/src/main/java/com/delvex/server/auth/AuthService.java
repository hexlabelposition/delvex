package com.delvex.server.auth;

import java.util.Locale;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.delvex.server.auth.dto.LoginRequest;
import com.delvex.server.auth.dto.LoginResponse;
import com.delvex.server.auth.dto.RefreshResponse;
import com.delvex.server.auth.dto.RegisterRequest;
import com.delvex.server.auth.dto.RegisterResponse;
import com.delvex.server.user.User;
import com.delvex.server.user.UserRepository;

@Service
public class AuthService {

    private static final Logger LOGGER = LoggerFactory.getLogger(
            AuthService.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final TokenService tokenService;
    private final RefreshTokenService refreshTokenService;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            TokenService tokenService,
            RefreshTokenService refreshTokenService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenService = tokenService;
        this.refreshTokenService = refreshTokenService;
    }

    @Transactional
    public RegisterResponse register(RegisterRequest request) {
        String email = request.email()
                .strip()
                .toLowerCase(Locale.ROOT);

        // This pre-check returns a friendly error in the common case. The
        // database unique constraint below still closes the concurrent
        // registration race between this query and the insert.
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new EmailAlreadyExistsException();
        }

        String passwordHash = passwordEncoder.encode(request.password());

        User user = new User(
                email,
                passwordHash,
                request.firstName().strip(),
                request.lastName().strip());

        User savedUser;

        try {
            savedUser = userRepository.saveAndFlush(user);
        } catch (DataIntegrityViolationException exception) {
            throw new EmailAlreadyExistsException(exception);
        }

        String accessToken = tokenService.createAccessToken(
                savedUser.getId(),
                savedUser.getRole());
        String refreshToken = refreshTokenService.issue(
                savedUser.getId());

        LOGGER.info("user registered userId={}", savedUser.getId());

        return new RegisterResponse(
                savedUser.getId(),
                savedUser.getEmail(),
                savedUser.getFirstName(),
                savedUser.getLastName(),
                savedUser.getRole(),
                accessToken,
                refreshToken);
    }

    @Transactional
    public LoginResponse login(LoginRequest request) {
        String email = request.email()
                .strip()
                .toLowerCase(Locale.ROOT);

        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(InvalidCredentialsException::new);

        if (!passwordEncoder.matches(
                request.password(),
                user.getPasswordHash())) {
            throw new InvalidCredentialsException();
        }

        String accessToken = tokenService.createAccessToken(
                user.getId(),
                user.getRole());
        String refreshToken = refreshTokenService.issue(
                user.getId());

        LOGGER.info("user authenticated userId={}", user.getId());

        return new LoginResponse(
                user.getId(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getRole(),
                accessToken,
                refreshToken);
    }

    @Transactional
    public RefreshResponse refresh(String refreshToken) {
        if (refreshToken == null
                || refreshToken.isBlank()
                || refreshToken.length() > 512) {
            throw new InvalidRefreshTokenException();
        }

        RefreshTokenService.RotatedRefreshToken rotatedToken = refreshTokenService
                .rotate(refreshToken);

        User user = userRepository.findById(rotatedToken.userId())
                .orElseThrow(InvalidRefreshTokenException::new);

        String accessToken = tokenService.createAccessToken(
                user.getId(),
                user.getRole());

        LOGGER.info(
                "refresh token rotated userId={}",
                rotatedToken.userId());

        return new RefreshResponse(
                accessToken,
                rotatedToken.refreshToken());
    }

    @Transactional
    public void logout(String refreshToken) {
        if (refreshToken == null
                || refreshToken.isBlank()
                || refreshToken.length() > 512) {
            LOGGER.debug("logout skipped reason=missing_or_invalid_cookie");
            return;
        }

        refreshTokenService.revoke(refreshToken);
        LOGGER.info("logout processed");
    }

}
