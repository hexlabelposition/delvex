package com.delvex.server.user;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import com.delvex.server.auth.RefreshSessionRepository;
import com.delvex.server.user.dto.ChangePasswordRequest;
import com.delvex.server.user.dto.UpdateUserRequest;
import com.delvex.server.user.dto.UserResponse;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private RefreshSessionRepository refreshSessionRepository;

    private final Clock clock = Clock.fixed(
            Instant.parse("2026-08-05T12:00:00Z"),
            ZoneOffset.UTC);

    private UserService userService;

    @BeforeEach
    void setUp() {
        userService = new UserService(
                userRepository,
                refreshSessionRepository,
                passwordEncoder,
                clock);
    }

    @Test
    void shouldReturnCurrentUser() {
        UUID userId = UUID.randomUUID();
        User user = createUser(userId);

        given(userRepository.findById(userId))
                .willReturn(Optional.of(user));

        UserResponse response = userService.getCurrentUser(userId);

        assertThat(response.id()).isEqualTo(userId);
        assertThat(response.email()).isEqualTo("john@example.com");
        assertThat(response.firstName()).isEqualTo("John");
        assertThat(response.lastName()).isEqualTo("Doe");
    }

    @Test
    void shouldPartiallyUpdateCurrentUser() {
        UUID userId = UUID.randomUUID();
        User user = createUser(userId);

        given(userRepository.findById(userId))
                .willReturn(Optional.of(user));

        UserResponse response = userService.updateCurrentUser(
                userId,
                new UpdateUserRequest("  Jonathan  ", null));

        assertThat(response.firstName()).isEqualTo("Jonathan");
        assertThat(response.lastName()).isEqualTo("Doe");
        assertThat(user.getFirstName()).isEqualTo("Jonathan");
        assertThat(user.getLastName()).isEqualTo("Doe");
    }

    @Test
    void shouldRejectMissingUser() {
        UUID userId = UUID.randomUUID();

        given(userRepository.findById(userId))
                .willReturn(Optional.empty());

        assertThatThrownBy(() -> userService.getCurrentUser(userId))
                .isInstanceOf(UserNotFoundException.class)
                .hasMessage("User not found");
    }

    @Test
    void shouldRevokeActiveSessionsAfterPasswordChange() {
        UUID userId = UUID.randomUUID();
        User user = createUser(userId);

        given(userRepository.findById(userId))
                .willReturn(Optional.of(user));
        given(passwordEncoder.matches(
                "current-password",
                "password-hash"))
                .willReturn(true);
        given(passwordEncoder.encode("new-password"))
                .willReturn("new-password-hash");

        userService.changePassword(
                userId,
                new ChangePasswordRequest(
                        "current-password",
                        "new-password"));

        assertThat(user.getPasswordHash())
                .isEqualTo("new-password-hash");
        verify(refreshSessionRepository)
                .revokeActiveByUserId(
                        userId,
                        clock.instant());
    }

    private User createUser(UUID userId) {
        User user = new User(
                "john@example.com",
                "password-hash",
                "John",
                "Doe");

        ReflectionTestUtils.setField(user, "id", userId);
        ReflectionTestUtils.setField(
                user,
                "createdAt",
                Instant.parse("2026-08-05T10:00:00Z"));
        ReflectionTestUtils.setField(
                user,
                "updatedAt",
                Instant.parse("2026-08-05T11:00:00Z"));

        return user;
    }
}
