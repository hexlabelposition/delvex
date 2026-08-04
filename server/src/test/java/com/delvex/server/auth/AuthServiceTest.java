package com.delvex.server.auth;

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
import org.springframework.security.crypto.password.PasswordEncoder;

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
        given(userRepository.save(any(User.class)))
                .willReturn(savedUser);

        given(savedUser.getId()).willReturn(userId);
        given(savedUser.getEmail()).willReturn("john@example.com");
        given(savedUser.getFirstName()).willReturn("John");
        given(savedUser.getLastName()).willReturn("Doe");

        given(tokenService.createAccessToken(userId))
                .willReturn("access-token");

        RegisterResponse response = authService.register(request);

        assertThat(response.id()).isEqualTo(userId);
        assertThat(response.email()).isEqualTo("john@example.com");
        assertThat(response.firstName()).isEqualTo("John");
        assertThat(response.lastName()).isEqualTo("Doe");
        assertThat(response.accessToken()).isEqualTo("access-token");

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        then(userRepository).should().save(userCaptor.capture());

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
        then(userRepository).should(never()).save(any(User.class));

        verifyNoInteractions(tokenService);
    }
}