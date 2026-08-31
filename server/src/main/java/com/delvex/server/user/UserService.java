package com.delvex.server.user;

import java.time.Clock;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.delvex.server.auth.RefreshSessionRepository;
import com.delvex.server.user.dto.ChangePasswordRequest;
import com.delvex.server.user.dto.UpdateUserRequest;
import com.delvex.server.user.dto.UserResponse;

@Service
public class UserService {

    private static final Logger LOGGER = LoggerFactory.getLogger(
            UserService.class);

    private final UserRepository userRepository;
    private final RefreshSessionRepository refreshSessionRepository;
    private final PasswordEncoder passwordEncoder;
    private final Clock clock;

    public UserService(
            UserRepository userRepository,
            RefreshSessionRepository refreshSessionRepository,
            PasswordEncoder passwordEncoder,
            Clock clock) {
        this.userRepository = userRepository;
        this.refreshSessionRepository = refreshSessionRepository;
        this.passwordEncoder = passwordEncoder;
        this.clock = clock;
    }

    @Transactional(readOnly = true)
    public UserResponse getCurrentUser(UUID userId) {
        UserResponse response = UserResponse.from(findUser(userId));

        LOGGER.debug("user profile loaded userId={}", userId);

        return response;
    }

    @Transactional
    public UserResponse updateCurrentUser(
            UUID userId,
            UpdateUserRequest request) {
        User user = findUser(userId);

        user.updateProfile(
                strip(request.firstName()),
                strip(request.lastName()));

        LOGGER.info("user profile updated userId={}", userId);

        return UserResponse.from(user);
    }

    @Transactional
    public void changePassword(UUID userId, ChangePasswordRequest request) {
        User user = findUser(userId);
        if (!passwordEncoder.matches(
                request.currentPassword(),
                user.getPasswordHash())) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.BAD_REQUEST,
                    "Current password is incorrect");
        }
        user.changePassword(passwordEncoder.encode(request.newPassword()));
        refreshSessionRepository.revokeActiveByUserId(
                userId,
                clock.instant());
        LOGGER.info("user password changed userId={}", userId);
    }

    private User findUser(UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(UserNotFoundException::new);
    }

    private String strip(String value) {
        return value == null ? null : value.strip();
    }
}
