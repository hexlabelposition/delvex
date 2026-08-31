package com.delvex.server.health;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class DatabaseReadinessProbe {

    private static final Logger LOGGER = LoggerFactory.getLogger(
            DatabaseReadinessProbe.class);
    private static final String READINESS_QUERY = "SELECT 1";

    private final JdbcTemplate jdbcTemplate;

    public DatabaseReadinessProbe(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public boolean isReady() {
        try {
            Integer result = jdbcTemplate.queryForObject(
                    READINESS_QUERY,
                    Integer.class);

            return result != null && result == 1;
        } catch (DataAccessException exception) {
            LOGGER.warn(
                    "database readiness check failed exception={}",
                    exception.getClass().getSimpleName());
            return false;
        }
    }
}
