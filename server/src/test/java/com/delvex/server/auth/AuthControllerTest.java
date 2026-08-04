package com.delvex.server.auth;

import com.delvex.server.auth.dto.LoginRequest;
import com.delvex.server.auth.dto.LoginResponse;
import com.delvex.server.auth.dto.RefreshRequest;
import com.delvex.server.auth.dto.RefreshResponse;
import com.delvex.server.auth.dto.RegisterRequest;
import com.delvex.server.auth.dto.RegisterResponse;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.BDDMockito.then;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AuthController.class)
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private AuthService authService;

    @Test
    void shouldRegisterUser() throws Exception {
        UUID userId = UUID.randomUUID();

        given(authService.register(any(RegisterRequest.class)))
                .willReturn(new RegisterResponse(
                        userId,
                        "john@example.com",
                        "John",
                        "Doe",
                        "access-token",
                        "refresh-token"));

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {
                          "email": "john@example.com",
                          "password": "strong-password",
                          "firstName": "John",
                          "lastName": "Doe"
                        }
                        """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(userId.toString()))
                .andExpect(jsonPath("$.email").value("john@example.com"))
                .andExpect(jsonPath("$.firstName").value("John"))
                .andExpect(jsonPath("$.lastName").value("Doe"))
                .andExpect(jsonPath("$.accessToken").value("access-token"))
                .andExpect(jsonPath("$.refreshToken").value("refresh-token"));
    }

    @Test
    void shouldRejectInvalidRegistrationRequest() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {
                          "email": "invalid-email",
                          "password": "short",
                          "firstName": "",
                          "lastName": "Doe"
                        }
                        """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Validation failed"))
                .andExpect(jsonPath("$.fieldErrors.email").exists())
                .andExpect(jsonPath("$.fieldErrors.password").exists())
                .andExpect(jsonPath("$.fieldErrors.firstName").exists());
    }

    @Test
    void shouldReturnConflictWhenEmailExists() throws Exception {
        given(authService.register(any(RegisterRequest.class)))
                .willThrow(new EmailAlreadyExistsException());

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {
                          "email": "john@example.com",
                          "password": "strong-password",
                          "firstName": "John",
                          "lastName": "Doe"
                        }
                        """))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message")
                        .value("Email is already registered"));
    }

    @Test
    void shouldLoginUser() throws Exception {
        UUID userId = UUID.randomUUID();

        given(authService.login(any(LoginRequest.class)))
                .willReturn(new LoginResponse(
                        userId,
                        "john@example.com",
                        "John",
                        "Doe",
                        "access-token",
                        "refresh-token"));

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {
                          "email": "john@example.com",
                          "password": "strong-password"
                        }
                        """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(userId.toString()))
                .andExpect(jsonPath("$.email").value("john@example.com"))
                .andExpect(jsonPath("$.firstName").value("John"))
                .andExpect(jsonPath("$.lastName").value("Doe"))
                .andExpect(jsonPath("$.accessToken").value("access-token"))
                .andExpect(jsonPath("$.refreshToken").value("refresh-token"));
    }

    @Test
    void shouldRejectInvalidLoginRequest() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {
                          "email": "invalid-email",
                          "password": "short"
                        }
                        """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Validation failed"))
                .andExpect(jsonPath("$.fieldErrors.email").exists())
                .andExpect(jsonPath("$.fieldErrors.password").exists());
    }

    @Test
    void shouldReturnUnauthorizedWhenCredentialsAreInvalid() throws Exception {
        given(authService.login(any(LoginRequest.class)))
                .willThrow(new InvalidCredentialsException());

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {
                          "email": "john@example.com",
                          "password": "wrong-password"
                        }
                        """))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message")
                        .value("Invalid email or password"));
    }

    @Test
    void shouldRefreshTokens() throws Exception {
        given(authService.refresh(any(RefreshRequest.class)))
                .willReturn(new RefreshResponse(
                        "new-access-token",
                        "new-refresh-token"));

        mockMvc.perform(post("/api/auth/refresh")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {
                          "refreshToken": "refresh-token"
                        }
                        """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken")
                        .value("new-access-token"))
                .andExpect(jsonPath("$.refreshToken")
                        .value("new-refresh-token"));
    }

    @Test
    void shouldRejectInvalidRefreshRequest() throws Exception {
        mockMvc.perform(post("/api/auth/refresh")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {
                          "refreshToken": ""
                        }
                        """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message")
                        .value("Validation failed"))
                .andExpect(jsonPath("$.fieldErrors.refreshToken").exists());
    }

    @Test
    void shouldReturnUnauthorizedWhenRefreshTokenIsInvalid() throws Exception {
        given(authService.refresh(any(RefreshRequest.class)))
                .willThrow(new InvalidRefreshTokenException());

        mockMvc.perform(post("/api/auth/refresh")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {
                          "refreshToken": "invalid-refresh-token"
                        }
                        """))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message")
                        .value("Refresh token is invalid or expired"));
    }

    @Test
    void shouldLogoutUser() throws Exception {
        mockMvc.perform(post("/api/auth/logout")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {
                          "refreshToken": "refresh-token"
                        }
                        """))
                .andExpect(status().isNoContent())
                .andExpect(content().string(""));

        then(authService)
                .should()
                .logout(any(RefreshRequest.class));
    }

    @Test
    void shouldRejectInvalidLogoutRequest() throws Exception {
        mockMvc.perform(post("/api/auth/logout")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {
                          "refreshToken": ""
                        }
                        """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message")
                        .value("Validation failed"))
                .andExpect(jsonPath("$.fieldErrors.refreshToken").exists());

        then(authService).shouldHaveNoInteractions();
    }

}
