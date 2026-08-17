package com.delvex.server.health;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataAccessException;
import org.springframework.data.redis.connection.RedisConnection;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.stereotype.Component;

@Component
public class RedisReadinessProbe {

    private static final Logger LOGGER = LoggerFactory.getLogger(
            RedisReadinessProbe.class);

    private final RedisConnectionFactory connectionFactory;

    public RedisReadinessProbe(
            RedisConnectionFactory connectionFactory) {
        this.connectionFactory = connectionFactory;
    }

    public boolean isReady() {
        try (RedisConnection connection =
                connectionFactory.getConnection()) {
            return "PONG".equals(connection.ping());
        } catch (DataAccessException exception) {
            LOGGER.warn(
                    "Redis readiness check failed exception={}",
                    exception.getClass().getSimpleName());
            return false;
        }
    }
}
