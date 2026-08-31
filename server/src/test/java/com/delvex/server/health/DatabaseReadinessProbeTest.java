package com.delvex.server.health;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataAccessResourceFailureException;
import org.springframework.jdbc.core.JdbcTemplate;

import static org.mockito.BDDMockito.given;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

@ExtendWith(MockitoExtension.class)
class DatabaseReadinessProbeTest {

    @Mock
    private JdbcTemplate jdbcTemplate;

    @InjectMocks
    private DatabaseReadinessProbe readinessProbe;

    @Test
    void shouldReportReadyWhenDatabaseResponds() {
        given(jdbcTemplate.queryForObject(
                "SELECT 1",
                Integer.class))
                .willReturn(1);

        assertTrue(readinessProbe.isReady());
    }

    @Test
    void shouldReportUnavailableWhenDatabaseRequestFails() {
        given(jdbcTemplate.queryForObject(
                "SELECT 1",
                Integer.class))
                .willThrow(new DataAccessResourceFailureException(
                        "Database unavailable"));

        assertFalse(readinessProbe.isReady());
    }

    @Test
    void shouldRejectUnexpectedDatabaseResponse() {
        given(jdbcTemplate.queryForObject(
                "SELECT 1",
                Integer.class))
                .willReturn(0);

        assertFalse(readinessProbe.isReady());
    }
}
