package com.delvex.server.shipment;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
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
import com.delvex.server.shipment.dto.ShipmentPageResponse;
import com.delvex.server.shipment.dto.ShipmentResponse;
import com.delvex.server.shipment.dto.UpdateShipmentRequest;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.BDDMockito.then;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ShipmentController.class)
@Import(SecurityConfiguration.class)
class ShipmentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ShipmentService shipmentService;

    @MockitoBean
    private JwtDecoder jwtDecoder;

    @Test
    void shouldCreateShipment() throws Exception {
        UUID userId = UUID.randomUUID();
        ShipmentResponse response = shipmentResponse();

        given(shipmentService.create(
                any(UUID.class),
                any(CreateShipmentRequest.class)))
                .willReturn(response);

        mockMvc.perform(post("/api/shipments")
                .with(jwtFor(userId))
                .contentType(MediaType.APPLICATION_JSON)
                .content(validCreateRequest()))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(response.id().toString()))
                .andExpect(jsonPath("$.referenceNumber")
                        .value(response.referenceNumber()))
                .andExpect(jsonPath("$.status").value("CREATED"));
    }

    @Test
    void shouldReturnDefaultShipmentPage() throws Exception {
        UUID userId = UUID.randomUUID();
        ShipmentResponse response = shipmentResponse();

        given(shipmentService.findAll(userId, 0, 20))
                .willReturn(new ShipmentPageResponse(
                        List.of(response),
                        0,
                        20,
                        1,
                        1));

        mockMvc.perform(get("/api/shipments")
                .with(jwtFor(userId)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].id")
                        .value(response.id().toString()))
                .andExpect(jsonPath("$.content[0].originCity")
                        .value("Legnica"))
                .andExpect(jsonPath("$.content[0].destinationCity")
                        .value("Wroclaw"))
                .andExpect(jsonPath("$.page").value(0))
                .andExpect(jsonPath("$.size").value(20))
                .andExpect(jsonPath("$.totalElements").value(1))
                .andExpect(jsonPath("$.totalPages").value(1));
    }

    @Test
    void shouldApplyShipmentPaginationParameters() throws Exception {
        UUID userId = UUID.randomUUID();

        given(shipmentService.findAll(userId, 2, 10))
                .willReturn(new ShipmentPageResponse(
                        List.of(),
                        2,
                        10,
                        25,
                        3));

        mockMvc.perform(get("/api/shipments")
                .param("page", "2")
                .param("size", "10")
                .with(jwtFor(userId)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isEmpty())
                .andExpect(jsonPath("$.page").value(2))
                .andExpect(jsonPath("$.size").value(10))
                .andExpect(jsonPath("$.totalElements").value(25))
                .andExpect(jsonPath("$.totalPages").value(3));
    }

    @Test
    void shouldRejectInvalidPaginationParameters() throws Exception {
        UUID userId = UUID.randomUUID();

        mockMvc.perform(get("/api/shipments")
                .param("page", "-1")
                .param("size", "101")
                .with(jwtFor(userId)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Validation failed"))
                .andExpect(jsonPath("$.fieldErrors.page").exists())
                .andExpect(jsonPath("$.fieldErrors.size").exists());

        then(shipmentService).shouldHaveNoInteractions();
    }

    @Test
    void shouldReturnShipmentById() throws Exception {
        UUID userId = UUID.randomUUID();
        ShipmentResponse response = shipmentResponse();

        given(shipmentService.findById(userId, response.id()))
                .willReturn(response);

        mockMvc.perform(get("/api/shipments/{shipmentId}", response.id())
                .with(jwtFor(userId)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(response.id().toString()))
                .andExpect(jsonPath("$.weightKg").value(12.50));
    }

    @Test
    void shouldUpdateShipment() throws Exception {
        UUID userId = UUID.randomUUID();
        ShipmentResponse response = shipmentResponse();

        given(shipmentService.update(
                any(UUID.class),
                any(UUID.class),
                any(UpdateShipmentRequest.class)))
                .willReturn(new ShipmentResponse(
                        response.id(),
                        response.referenceNumber(),
                        ShipmentStatus.IN_TRANSIT,
                        response.originCountry(),
                        response.originCity(),
                        response.originPostalCode(),
                        response.originAddress(),
                        response.destinationCountry(),
                        response.destinationCity(),
                        response.destinationPostalCode(),
                        response.destinationAddress(),
                        response.cargoDescription(),
                        response.weightKg(),
                        response.pickupAt(),
                        response.deliveryAt(),
                        response.createdAt(),
                        response.updatedAt()));

        mockMvc.perform(patch("/api/shipments/{shipmentId}", response.id())
                .with(jwtFor(userId))
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {
                          "status": "IN_TRANSIT"
                        }
                        """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("IN_TRANSIT"));
    }

    @Test
    void shouldDeleteShipment() throws Exception {
        UUID userId = UUID.randomUUID();
        UUID shipmentId = UUID.randomUUID();

        mockMvc.perform(delete("/api/shipments/{shipmentId}", shipmentId)
                .with(jwtFor(userId)))
                .andExpect(status().isNoContent())
                .andExpect(content().string(""));

        then(shipmentService).should().delete(userId, shipmentId);
    }

    @Test
    void shouldRejectInvalidCreateRequest() throws Exception {
        UUID userId = UUID.randomUUID();

        mockMvc.perform(post("/api/shipments")
                .with(jwtFor(userId))
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {
                          "originCountry": "POL",
                          "weightKg": 0
                        }
                        """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Validation failed"))
                .andExpect(jsonPath("$.fieldErrors.originCountry").exists())
                .andExpect(jsonPath("$.fieldErrors.weightKg").exists());

        then(shipmentService).shouldHaveNoInteractions();
    }

    @Test
    void shouldRejectEmptyUpdateRequest() throws Exception {
        UUID userId = UUID.randomUUID();
        UUID shipmentId = UUID.randomUUID();

        mockMvc.perform(patch("/api/shipments/{shipmentId}", shipmentId)
                .with(jwtFor(userId))
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Validation failed"));

        then(shipmentService).shouldHaveNoInteractions();
    }

    @Test
    void shouldReturnNotFoundForUnavailableShipment() throws Exception {
        UUID userId = UUID.randomUUID();
        UUID shipmentId = UUID.randomUUID();

        given(shipmentService.findById(userId, shipmentId))
                .willThrow(new ShipmentNotFoundException());

        mockMvc.perform(get("/api/shipments/{shipmentId}", shipmentId)
                .with(jwtFor(userId)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Shipment not found"));
    }

    @Test
    void shouldRequireAuthentication() throws Exception {
        mockMvc.perform(get("/api/shipments"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(get("/api/shipments/{shipmentId}", UUID.randomUUID()))
                .andExpect(status().isUnauthorized());
    }

    private org.springframework.test.web.servlet.request.RequestPostProcessor jwtFor(
            UUID userId) {
        return jwt().jwt(token -> token
                .subject(userId.toString())
                .claim("type", "access"));
    }

    private String validCreateRequest() {
        return """
                {
                  "originCountry": "PL",
                  "originCity": "Legnica",
                  "originPostalCode": "59-220",
                  "originAddress": "Rynek 1",
                  "destinationCountry": "PL",
                  "destinationCity": "Wroclaw",
                  "destinationPostalCode": "50-001",
                  "destinationAddress": "Rynek 2",
                  "cargoDescription": "Electronics",
                  "weightKg": 12.50,
                  "pickupAt": "2026-08-06T10:00:00Z",
                  "deliveryAt": "2026-08-07T10:00:00Z"
                }
                """;
    }

    private ShipmentResponse shipmentResponse() {
        return new ShipmentResponse(
                UUID.randomUUID(),
                "DLX-11111111-1111-1111-1111-111111111111",
                ShipmentStatus.CREATED,
                "PL",
                "Legnica",
                "59-220",
                "Rynek 1",
                "PL",
                "Wroclaw",
                "50-001",
                "Rynek 2",
                "Electronics",
                new BigDecimal("12.50"),
                Instant.parse("2026-08-06T10:00:00Z"),
                Instant.parse("2026-08-07T10:00:00Z"),
                Instant.parse("2026-08-05T10:00:00Z"),
                Instant.parse("2026-08-05T10:00:00Z"));
    }
}
