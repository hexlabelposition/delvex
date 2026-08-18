package com.delvex.server.auth;

import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.delvex.server.auth.dto.LoginRequest;
import com.delvex.server.auth.dto.LoginResponse;
import com.delvex.server.auth.dto.RefreshResponse;
import com.delvex.server.auth.dto.RegisterRequest;
import com.delvex.server.auth.dto.RegisterResponse;
import com.delvex.server.user.UserRole;

import jakarta.servlet.http.Cookie;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.BDDMockito.then;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.cookie;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@AutoConfigureMockMvc(addFilters = false)
@WebMvcTest(AuthController.class)
class AuthControllerTest {

    private static final String REFRESH_COOKIE =
            "refresh_token=refresh-token; Path=/api/auth; HttpOnly; SameSite=Lax";
    private static final String NEW_REFRESH_COOKIE =
            "refresh_token=new-refresh-token; Path=/api/auth; HttpOnly; SameSite=Lax";
    private static final String CLEARED_REFRESH_COOKIE =
            "refresh_token=; Path=/api/auth; Max-Age=0; HttpOnly; SameSite=Lax";

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private AuthService authService;

    @MockitoBean
    private RefreshCookieService refreshCookieService;

    @Test
    void shouldRegisterUserAndSetRefreshCookie() throws Exception {
        UUID userId = UUID.randomUUID();

        given(authService.register(any(RegisterRequest.class)))
                .willReturn(new RegisterResponse(
                        userId,
                        "john@example.com",
                        "John",
                        "Doe",
                        UserRole.CUSTOMER,
                        "access-token",
                        "refresh-token"));
        given(refreshCookieService.create("refresh-token"))
                .willReturn(REFRESH_COOKIE);

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
                .andExpect(header().string(
                        HttpHeaders.SET_COOKIE,
                        REFRESH_COOKIE))
                .andExpect(jsonPath("$.id").value(userId.toString()))
                .andExpect(jsonPath("$.email").value("john@example.com"))
                .andExpect(jsonPath("$.firstName").value("John"))
                .andExpect(jsonPath("$.lastName").value("Doe"))
                .andExpect(jsonPath("$.role").value("CUSTOMER"))
                .andExpect(jsonPath("$.accessToken").value("access-token"))
                .andExpect(jsonPath("$.refreshToken").doesNotExist());
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
    void shouldLoginUserAndSetRefreshCookie() throws Exception {
        UUID userId = UUID.randomUUID();

        given(authService.login(any(LoginRequest.class)))
                .willReturn(new LoginResponse(
                        userId,
                        "john@example.com",
                        "John",
                        "Doe",
                        UserRole.EMPLOYEE,
                        "access-token",
                        "refresh-token"));
        given(refreshCookieService.create("refresh-token"))
                .willReturn(REFRESH_COOKIE);

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {
                          "email": "john@example.com",
                          "password": "strong-password"
                        }
                        """))
                .andExpect(status().isOk())
                .andExpect(header().string(
                        HttpHeaders.SET_COOKIE,
                        REFRESH_COOKIE))
                .andExpect(jsonPath("$.id").value(userId.toString()))
                .andExpect(jsonPath("$.email").value("john@example.com"))
                .andExpect(jsonPath("$.firstName").value("John"))
                .andExpect(jsonPath("$.lastName").value("Doe"))
                .andExpect(jsonPath("$.role").value("EMPLOYEE"))
                .andExpect(jsonPath("$.accessToken").value("access-token"))
                .andExpect(jsonPath("$.refreshToken").doesNotExist());
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
    void shouldRefreshTokensUsingCookie() throws Exception {
        given(authService.refresh("refresh-token"))
                .willReturn(new RefreshResponse(
                        "new-access-token",
                        "new-refresh-token"));
        given(refreshCookieService.create("new-refresh-token"))
                .willReturn(NEW_REFRESH_COOKIE);

        mockMvc.perform(post("/api/auth/refresh")
                .cookie(new Cookie(
                        RefreshCookieService.COOKIE_NAME,
                        "refresh-token")))
                .andExpect(status().isOk())
                .andExpect(header().string(
                        HttpHeaders.SET_COOKIE,
                        NEW_REFRESH_COOKIE))
                .andExpect(jsonPath("$.accessToken")
                        .value("new-access-token"))
                .andExpect(jsonPath("$.refreshToken").doesNotExist());
    }

    @Test
    void shouldReturnUnauthorizedWhenRefreshCookieIsMissing() throws Exception {
        given(authService.refresh(null))
                .willThrow(new InvalidRefreshTokenException());

        mockMvc.perform(post("/api/auth/refresh"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message")
                        .value("Refresh token is invalid or expired"));
    }

    @Test
    void shouldReturnUnauthorizedWhenRefreshCookieIsInvalid() throws Exception {
        given(authService.refresh("invalid-refresh-token"))
                .willThrow(new InvalidRefreshTokenException());

        mockMvc.perform(post("/api/auth/refresh")
                .cookie(new Cookie(
                        RefreshCookieService.COOKIE_NAME,
                        "invalid-refresh-token")))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message")
                        .value("Refresh token is invalid or expired"));
    }

    @Test
    void shouldLogoutUserAndClearRefreshCookie() throws Exception {
        given(refreshCookieService.clear())
                .willReturn(CLEARED_REFRESH_COOKIE);

        mockMvc.perform(post("/api/auth/logout")
                .cookie(new Cookie(
                        RefreshCookieService.COOKIE_NAME,
                        "refresh-token")))
                .andExpect(status().isNoContent())
                .andExpect(cookie().value(
                        RefreshCookieService.COOKIE_NAME,
                        ""))
                .andExpect(cookie().maxAge(
                        RefreshCookieService.COOKIE_NAME,
                        0))
                .andExpect(cookie().path(
                        RefreshCookieService.COOKIE_NAME,
                        "/api/auth"))
                .andExpect(cookie().httpOnly(
                        RefreshCookieService.COOKIE_NAME,
                        true))
                .andExpect(content().string(""));

        then(authService)
                .should()
                .logout("refresh-token");
    }

    @Test
    void shouldClearRefreshCookieWhenSessionIsMissing() throws Exception {
        given(refreshCookieService.clear())
                .willReturn(CLEARED_REFRESH_COOKIE);

        mockMvc.perform(post("/api/auth/logout"))
                .andExpect(status().isNoContent())
                .andExpect(cookie().value(
                        RefreshCookieService.COOKIE_NAME,
                        ""))
                .andExpect(cookie().maxAge(
                        RefreshCookieService.COOKIE_NAME,
                        0))
                .andExpect(cookie().path(
                        RefreshCookieService.COOKIE_NAME,
                        "/api/auth"))
                .andExpect(cookie().httpOnly(
                        RefreshCookieService.COOKIE_NAME,
                        true));

        then(authService)
                .should()
                .logout(null);
    }

}

