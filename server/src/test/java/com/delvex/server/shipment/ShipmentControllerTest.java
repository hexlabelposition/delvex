package com.delvex.server.shipment;

import java.math.BigDecimal;
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
import com.delvex.server.shipment.dto.CreateShipmentRequest;
import com.delvex.server.shipment.dto.ShipmentResponse;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.BDDMockito.then;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ShipmentController.class)
@Import(SecurityConfiguration.class)
class ShipmentControllerTest {
    @Autowired private MockMvc mockMvc;
    @MockitoBean private ShipmentService shipmentService;
    @MockitoBean private JwtDecoder jwtDecoder;

    @Test
    void shouldCreateShipmentWithLocationIds() throws Exception {
        UUID userId = UUID.randomUUID();
        given(shipmentService.create(any(), any(CreateShipmentRequest.class))).willReturn(response());

        mockMvc.perform(post("/api/shipments").with(jwtFor(userId)).contentType(MediaType.APPLICATION_JSON).content("""
                { "originLocationId": "WARSAW", "destinationLocationId": "GDANSK", "cargoDescription": "Books", "weightKg": 1.00 }
                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("CREATED"));
    }

    @Test
    void shouldRejectStatusUpdateFromClient() throws Exception {
        UUID userId = UUID.randomUUID();
        mockMvc.perform(patch("/api/shipments/{shipmentId}", UUID.randomUUID()).with(jwtFor(userId)).contentType(MediaType.APPLICATION_JSON).content("""
                { "status": "IN_TRANSIT" }
                """))
                .andExpect(status().isBadRequest());
        then(shipmentService).shouldHaveNoInteractions();
    }

    private org.springframework.test.web.servlet.request.RequestPostProcessor jwtFor(UUID userId) { return jwt().jwt(token -> token.subject(userId.toString()).claim("type", "access")); }
    private ShipmentResponse response() { return new ShipmentResponse(UUID.randomUUID(), "DLX-11111111-1111-1111-1111-111111111111", ShipmentStatus.CREATED, "PL", "Warszawa", "00-001", "Marszałkowska 1", "PL", "Gdańsk", "80-001", "Długi Targ 1", "Books", new BigDecimal("1.00"), null, null, Instant.now(), Instant.now()); }
}
