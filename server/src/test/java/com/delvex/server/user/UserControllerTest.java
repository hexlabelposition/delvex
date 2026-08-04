package com.delvex.server.user;

import java.time.Instant;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.delvex.server.auth.SecurityConfiguration;
import com.delvex.server.user.dto.UpdateUserRequest;
import com.delvex.server.user.dto.UserResponse;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.BDDMockito.then;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(UserController.class)
@Import(SecurityConfiguration.class)
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private UserService userService;

    @MockitoBean
    private JwtDecoder jwtDecoder;

    @Test
    void shouldReturnCurrentUser() throws Exception {
        UUID userId = UUID.randomUUID();
        Instant createdAt = Instant.parse("2026-08-05T10:00:00Z");
        Instant updatedAt = Instant.parse("2026-08-05T11:00:00Z");

        given(userService.getCurrentUser(userId))
                .willReturn(new UserResponse(
                        userId,
                        "john@example.com",
                        "John",
                        "Doe",
                        createdAt,
                        updatedAt));

        mockMvc.perform(get("/api/users/me")
                .with(jwt().jwt(token -> token
                        .subject(userId.toString())
                        .claim("type", "access"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(userId.toString()))
                .andExpect(jsonPath("$.email").value("john@example.com"))
                .andExpect(jsonPath("$.firstName").value("John"))
                .andExpect(jsonPath("$.lastName").value("Doe"))
                .andExpect(jsonPath("$.createdAt").value(createdAt.toString()))
                .andExpect(jsonPath("$.updatedAt").value(updatedAt.toString()));
    }

    @Test
    void shouldUpdateCurrentUser() throws Exception {
        UUID userId = UUID.randomUUID();

        given(userService.updateCurrentUser(
                any(UUID.class),
                any(UpdateUserRequest.class)))
                .willReturn(new UserResponse(
                        userId,
                        "john@example.com",
                        "Jonathan",
                        "Doe",
                        null,
                        null));

        mockMvc.perform(patch("/api/users/me")
                .with(jwt().jwt(token -> token
                        .subject(userId.toString())
                        .claim("type", "access")))
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {
                          "firstName": "Jonathan"
                        }
                        """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.firstName").value("Jonathan"))
                .andExpect(jsonPath("$.lastName").value("Doe"));

        then(userService).should().updateCurrentUser(
                userId,
                new UpdateUserRequest("Jonathan", null));
    }

    @Test
    void shouldRejectInvalidProfileUpdate() throws Exception {
        UUID userId = UUID.randomUUID();

        mockMvc.perform(patch("/api/users/me")
                .with(jwt().jwt(token -> token
                        .subject(userId.toString())
                        .claim("type", "access")))
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {
                          "firstName": "   "
                        }
                        """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Validation failed"))
                .andExpect(jsonPath("$.fieldErrors.firstName").exists());

        then(userService).shouldHaveNoInteractions();
    }

    @Test
    void shouldRejectEmptyProfileUpdate() throws Exception {
        UUID userId = UUID.randomUUID();

        mockMvc.perform(patch("/api/users/me")
                .with(jwt().jwt(token -> token
                        .subject(userId.toString())
                        .claim("type", "access")))
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Validation failed"));

        then(userService).shouldHaveNoInteractions();
    }

    @Test
    void shouldRequireAuthentication() throws Exception {
        mockMvc.perform(get("/api/users/me"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(patch("/api/users/me")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {
                          "firstName": "Jonathan"
                        }
                        """))
                .andExpect(status().isUnauthorized());
    }
}
