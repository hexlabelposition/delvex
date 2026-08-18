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
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.delvex.server.auth.SecurityConfiguration;
import com.delvex.server.shipment.dto.EmployeeShipmentPageResponse;
import com.delvex.server.shipment.dto.EmployeeShipmentResponse;
import com.delvex.server.shipment.dto.EmployeeShipmentResponse.CustomerSummary;
import com.delvex.server.shipment.dto.ShipmentResponse;
import com.delvex.server.shipment.dto.UpdateShipmentStatusRequest;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.BDDMockito.then;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(EmployeeShipmentController.class)
@Import(SecurityConfiguration.class)
class EmployeeShipmentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private EmployeeShipmentService shipmentService;

    @MockitoBean
    private JwtDecoder jwtDecoder;

    @Test
    void shouldAllowEmployeeToListAllShipments() throws Exception {
        EmployeeShipmentResponse shipment = response(
                ShipmentStatus.ACCEPTED,
                1);
        given(shipmentService.findAll(
                ShipmentStatus.ACCEPTED,
                "DLX-12",
                0,
                20))
                .willReturn(new EmployeeShipmentPageResponse(
                        List.of(shipment),
                        0,
                        20,
                        1,
                        1));

        mockMvc.perform(get("/api/employee/shipments")
                .param("status", "ACCEPTED")
                .param("reference", "DLX-12")
                .with(employeeJwt(UUID.randomUUID())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].shipment.status")
                        .value("ACCEPTED"))
                .andExpect(jsonPath("$.content[0].customer.email")
                        .value("john@example.com"));
    }

    @Test
    void shouldAllowEmployeeToChangeShipmentStatus() throws Exception {
        UUID employeeId = UUID.randomUUID();
        UUID shipmentId = UUID.randomUUID();
        given(shipmentService.updateStatus(
                any(UUID.class),
                any(UUID.class),
                any(UpdateShipmentStatusRequest.class)))
                .willReturn(response(ShipmentStatus.ACCEPTED, 1));

        mockMvc.perform(patch(
                "/api/employee/shipments/{shipmentId}/status",
                shipmentId)
                .with(employeeJwt(employeeId))
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {
                          "status": "ACCEPTED",
                          "version": 0
                        }
                        """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.shipment.status").value("ACCEPTED"))
                .andExpect(jsonPath("$.shipment.version").value(1));

        then(shipmentService).should().updateStatus(
                employeeId,
                shipmentId,
                new UpdateShipmentStatusRequest(
                        ShipmentStatus.ACCEPTED,
                        0L));
    }

    @Test
    void shouldRejectCustomerFromEmployeeRoutes() throws Exception {
        mockMvc.perform(get("/api/employee/shipments")
                .with(customerJwt(UUID.randomUUID())))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message")
                        .value("Access is denied"));

        then(shipmentService).shouldHaveNoInteractions();
    }

    @Test
    void shouldRequireAuthenticationForEmployeeRoutes() throws Exception {
        mockMvc.perform(get("/api/employee/shipments"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message")
                        .value("Authentication is required"));
    }

    @Test
    void shouldRejectUnknownStatusFilter() throws Exception {
        mockMvc.perform(get("/api/employee/shipments")
                .param("status", "UNKNOWN")
                .with(employeeJwt(UUID.randomUUID())))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Validation failed"))
                .andExpect(jsonPath("$.fieldErrors.status")
                        .value("Must be one of: CREATED, ACCEPTED, IN_TRANSIT, DELIVERED, CANCELLED"));

        then(shipmentService).shouldHaveNoInteractions();
    }

    private org.springframework.test.web.servlet.request.RequestPostProcessor
            employeeJwt(UUID userId) {
        return jwt()
                .jwt(token -> token
                        .subject(userId.toString())
                        .claim("type", "access")
                        .claim("role", "EMPLOYEE"))
                .authorities(new SimpleGrantedAuthority("ROLE_EMPLOYEE"));
    }

    private org.springframework.test.web.servlet.request.RequestPostProcessor
            customerJwt(UUID userId) {
        return jwt()
                .jwt(token -> token
                        .subject(userId.toString())
                        .claim("type", "access")
                        .claim("role", "CUSTOMER"))
                .authorities(new SimpleGrantedAuthority("ROLE_CUSTOMER"));
    }

    private EmployeeShipmentResponse response(
            ShipmentStatus status,
            long version) {
        ShipmentResponse shipment = new ShipmentResponse(
                UUID.randomUUID(),
                "DLX-11111111-1111-1111-1111-111111111111",
                status,
                "PL",
                "Warszawa",
                "00-001",
                "Marszałkowska 1",
                "PL",
                "Gdańsk",
                "80-001",
                "Długi Targ 1",
                "Books",
                new BigDecimal("1.00"),
                null,
                null,
                version,
                Instant.now(),
                Instant.now());
        CustomerSummary customer = new CustomerSummary(
                UUID.randomUUID(),
                "john@example.com",
                "John",
                "Doe");

        return new EmployeeShipmentResponse(shipment, customer);
    }
}
