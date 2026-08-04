package com.delvex.server.auth;

import com.delvex.server.auth.dto.LoginRequest;
import com.delvex.server.auth.dto.LoginResponse;
import com.delvex.server.auth.dto.RefreshRequest;
import com.delvex.server.auth.dto.RefreshResponse;
import com.delvex.server.auth.dto.RegisterRequest;
import com.delvex.server.auth.dto.RegisterResponse;
import com.delvex.server.user.User;
import com.delvex.server.user.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.BDDMockito.then;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verifyNoInteractions;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private TokenService tokenService;

    @Mock
    private RefreshTokenService refreshTokenService;

    @InjectMocks
    private AuthService authService;

    @Test
    void shouldRegisterUser() {
        RegisterRequest request = new RegisterRequest(
                "John@Example.COM",
                "strong-password",
                " John ",
                " Doe ");

        UUID userId = UUID.randomUUID();
        User savedUser = org.mockito.Mockito.mock(User.class);

        given(userRepository.existsByEmailIgnoreCase("john@example.com"))
                .willReturn(false);
        given(passwordEncoder.encode("strong-password"))
                .willReturn("{bcrypt}encoded-password");
        given(userRepository.saveAndFlush(any(User.class)))
                .willReturn(savedUser);

        given(savedUser.getId()).willReturn(userId);
        given(savedUser.getEmail()).willReturn("john@example.com");
        given(savedUser.getFirstName()).willReturn("John");
        given(savedUser.getLastName()).willReturn("Doe");

        given(tokenService.createAccessToken(userId))
                .willReturn("access-token");
        given(refreshTokenService.issue(userId))
                .willReturn("refresh-token");

        RegisterResponse response = authService.register(request);

        assertThat(response.id()).isEqualTo(userId);
        assertThat(response.email()).isEqualTo("john@example.com");
        assertThat(response.firstName()).isEqualTo("John");
        assertThat(response.lastName()).isEqualTo("Doe");
        assertThat(response.accessToken()).isEqualTo("access-token");
        assertThat(response.refreshToken()).isEqualTo("refresh-token");

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);

        then(userRepository)
                .should()
                .saveAndFlush(userCaptor.capture());

        User userToSave = userCaptor.getValue();

        assertThat(userToSave.getEmail()).isEqualTo("john@example.com");
        assertThat(userToSave.getPasswordHash())
                .isEqualTo("{bcrypt}encoded-password");
        assertThat(userToSave.getFirstName()).isEqualTo("John");
        assertThat(userToSave.getLastName()).isEqualTo("Doe");
    }

    @Test
    void shouldRejectExistingEmail() {
        RegisterRequest request = new RegisterRequest(
                "john@example.com",
                "strong-password",
                "John",
                "Doe");

        given(userRepository.existsByEmailIgnoreCase("john@example.com"))
                .willReturn(true);

        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(EmailAlreadyExistsException.class)
                .hasMessage("Email is already registered");

        verifyNoInteractions(passwordEncoder);

        then(userRepository)
                .should(never())
                .saveAndFlush(any(User.class));

        verifyNoInteractions(tokenService);
    }

    @Test
    void shouldRejectEmailWhenDatabaseConstraintIsViolated() {
        RegisterRequest request = new RegisterRequest(
                "john@example.com",
                "strong-password",
                "John",
                "Doe");

        given(userRepository.existsByEmailIgnoreCase("john@example.com"))
                .willReturn(false);
        given(passwordEncoder.encode("strong-password"))
                .willReturn("{bcrypt}encoded-password");
        given(userRepository.saveAndFlush(any(User.class)))
                .willThrow(new DataIntegrityViolationException(
                        "Unique constraint violated"));

        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(EmailAlreadyExistsException.class)
                .hasMessage("Email is already registered");

        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(EmailAlreadyExistsException.class)
                .hasMessage("Email is already registered")
                .hasCauseInstanceOf(DataIntegrityViolationException.class);

        verifyNoInteractions(tokenService);
    }

    @Test
    void shouldLoginUser() {
        LoginRequest request = new LoginRequest(
                " John@Example.COM ",
                "strong-password");
        UUID userId = UUID.randomUUID();
        User user = org.mockito.Mockito.mock(User.class);

        given(userRepository.findByEmailIgnoreCase("john@example.com"))
                .willReturn(Optional.of(user));
        given(user.getPasswordHash())
                .willReturn("{bcrypt}encoded-password");
        given(passwordEncoder.matches(
                "strong-password",
                "{bcrypt}encoded-password"))
                .willReturn(true);
        given(user.getId()).willReturn(userId);
        given(user.getEmail()).willReturn("john@example.com");
        given(user.getFirstName()).willReturn("John");
        given(user.getLastName()).willReturn("Doe");
        given(tokenService.createAccessToken(userId))
                .willReturn("access-token");
        given(refreshTokenService.issue(userId))
                .willReturn("refresh-token");

        LoginResponse response = authService.login(request);

        assertThat(response.id()).isEqualTo(userId);
        assertThat(response.email()).isEqualTo("john@example.com");
        assertThat(response.firstName()).isEqualTo("John");
        assertThat(response.lastName()).isEqualTo("Doe");
        assertThat(response.accessToken()).isEqualTo("access-token");
        assertThat(response.refreshToken()).isEqualTo("refresh-token");
    }

    @Test
    void shouldRejectUnknownEmail() {
        LoginRequest request = new LoginRequest(
                "john@example.com",
                "strong-password");

        given(userRepository.findByEmailIgnoreCase("john@example.com"))
                .willReturn(Optional.empty());

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(InvalidCredentialsException.class)
                .hasMessage("Invalid email or password");

        verifyNoInteractions(passwordEncoder);
        verifyNoInteractions(tokenService);
    }

    @Test
    void shouldRejectInvalidPassword() {
        LoginRequest request = new LoginRequest(
                "john@example.com",
                "wrong-password");
        User user = org.mockito.Mockito.mock(User.class);

        given(userRepository.findByEmailIgnoreCase("john@example.com"))
                .willReturn(Optional.of(user));
        given(user.getPasswordHash())
                .willReturn("{bcrypt}encoded-password");
        given(passwordEncoder.matches(
                "wrong-password",
                "{bcrypt}encoded-password"))
                .willReturn(false);

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(InvalidCredentialsException.class)
                .hasMessage("Invalid email or password");

        verifyNoInteractions(tokenService);
    }
    @Test
    void shouldRefreshTokens() {
        RefreshRequest request = new RefreshRequest("refresh-token");
        UUID userId = UUID.randomUUID();

        given(refreshTokenService.rotate("refresh-token"))
                .willReturn(new RefreshTokenService.RotatedRefreshToken(
                        userId,
                        "new-refresh-token"));
        given(tokenService.createAccessToken(userId))
                .willReturn("new-access-token");

        RefreshResponse response = authService.refresh(request);

        assertThat(response.accessToken()).isEqualTo("new-access-token");
        assertThat(response.refreshToken()).isEqualTo("new-refresh-token");
    }

    @Test
    void shouldRejectInvalidRefreshToken() {
        RefreshRequest request = new RefreshRequest("invalid-refresh-token");

        given(refreshTokenService.rotate("invalid-refresh-token"))
                .willThrow(new InvalidRefreshTokenException());

        assertThatThrownBy(() -> authService.refresh(request))
                .isInstanceOf(InvalidRefreshTokenException.class)
                .hasMessage("Refresh token is invalid or expired");

        verifyNoInteractions(tokenService);
    }

}
