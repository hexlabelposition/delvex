package com.delvex.server.e2e;

import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;

import com.delvex.server.auth.RefreshCookieService;
import com.delvex.server.auth.RefreshSessionRepository;
import com.delvex.server.shipment.ShipmentRepository;
import com.delvex.server.user.UserRepository;
import com.jayway.jsonpath.JsonPath;

import jakarta.servlet.http.Cookie;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class SmokeE2E {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ShipmentRepository shipmentRepository;

    @Autowired
    private RefreshSessionRepository refreshSessionRepository;

    @Test
    void shouldCompleteCoreUserAndShipmentFlow() throws Exception {
        assertThat(userRepository.count()).isZero();
        assertThat(shipmentRepository.count()).isZero();
        assertThat(refreshSessionRepository.count()).isZero();

        String email = "smoke-" + UUID.randomUUID() + "@example.com";

        MvcResult registration = mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {
                          "email": "%s",
                          "password": "strong-password",
                          "firstName": "Smoke",
                          "lastName": "Test"
                        }
                        """.formatted(email)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.email").value(email))
                .andExpect(jsonPath("$.accessToken").isNotEmpty())
                .andReturn();

        String accessToken = jsonValue(registration, "$.accessToken");
        Cookie refreshCookie = refreshCookie(registration);

        MvcResult creation = mockMvc.perform(post("/api/shipments")
                .header(
                        HttpHeaders.AUTHORIZATION,
                        bearer(accessToken))
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {
                          "originCountry": "PL",
                          "originCity": "Legnica",
                          "originPostalCode": "59-220",
                          "originAddress": "Rynek 1",
                          "destinationCountry": "PL",
                          "destinationCity": "Wroclaw",
                          "destinationPostalCode": "50-001",
                          "destinationAddress": "Rynek 2",
                          "cargoDescription": "Smoke test cargo",
                          "weightKg": 12.50,
                          "pickupAt": "2026-08-07T10:00:00Z",
                          "deliveryAt": "2026-08-08T10:00:00Z"
                        }
                        """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("CREATED"))
                .andReturn();

        String shipmentId = jsonValue(creation, "$.id");

        mockMvc.perform(get(
                "/api/shipments/{shipmentId}",
                shipmentId)
                .header(
                        HttpHeaders.AUTHORIZATION,
                        bearer(accessToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(shipmentId))
                .andExpect(jsonPath("$.status").value("CREATED"));

        MvcResult refresh = mockMvc.perform(post("/api/auth/refresh")
                .cookie(refreshCookie))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").isNotEmpty())
                .andReturn();

        String refreshedAccessToken = jsonValue(
                refresh,
                "$.accessToken");
        Cookie rotatedRefreshCookie = refreshCookie(refresh);

        assertThat(rotatedRefreshCookie.getValue())
                .isNotEqualTo(refreshCookie.getValue());

        mockMvc.perform(patch(
                "/api/shipments/{shipmentId}",
                shipmentId)
                .header(
                        HttpHeaders.AUTHORIZATION,
                        bearer(refreshedAccessToken))
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {
                          "status": "IN_TRANSIT"
                        }
                        """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status")
                        .value("IN_TRANSIT"));

        mockMvc.perform(post("/api/auth/logout")
                .cookie(rotatedRefreshCookie))
                .andExpect(status().isNoContent())
                .andExpect(header().string(
                        HttpHeaders.SET_COOKIE,
                        containsString("Max-Age=0")));

        mockMvc.perform(post("/api/auth/refresh")
                .cookie(rotatedRefreshCookie))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value(
                        "Refresh token is invalid or expired"));

        assertThat(userRepository.count()).isEqualTo(1);
        assertThat(shipmentRepository.count()).isEqualTo(1);
        assertThat(refreshSessionRepository.findAll())
                .hasSize(2)
                .allMatch(session -> session.getRevokedAt() != null);
    }

    private String jsonValue(
            MvcResult result,
            String path) throws Exception {
        return JsonPath.read(
                result.getResponse().getContentAsString(),
                path);
    }

    private Cookie refreshCookie(MvcResult result) {
        String setCookie = result.getResponse()
                .getHeader(HttpHeaders.SET_COOKIE);
        String prefix = RefreshCookieService.COOKIE_NAME + "=";

        assertThat(setCookie).isNotNull().startsWith(prefix);

        int valueEnd = setCookie.indexOf(';');
        String value = setCookie.substring(
                prefix.length(),
                valueEnd);

        return new Cookie(
                RefreshCookieService.COOKIE_NAME,
                value);
    }

    private String bearer(String accessToken) {
        return "Bearer " + accessToken;
    }
}
