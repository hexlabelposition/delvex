package com.delvex.server.health;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.RedisConnectionFailureException;
import org.springframework.data.redis.connection.RedisConnection;
import org.springframework.data.redis.connection.RedisConnectionFactory;

import static org.mockito.BDDMockito.given;
import static org.mockito.BDDMockito.then;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

@ExtendWith(MockitoExtension.class)
class RedisReadinessProbeTest {

    @Mock
    private RedisConnectionFactory connectionFactory;

    @Mock
    private RedisConnection connection;

    @InjectMocks
    private RedisReadinessProbe readinessProbe;

    @Test
    void shouldReportReadyWhenRedisResponds() {
        given(connectionFactory.getConnection())
                .willReturn(connection);
        given(connection.ping()).willReturn("PONG");

        assertTrue(readinessProbe.isReady());
        then(connection).should().close();
    }

    @Test
    void shouldReportUnavailableWhenRedisConnectionFails() {
        given(connectionFactory.getConnection())
                .willThrow(new RedisConnectionFailureException(
                        "Redis unavailable"));

        assertFalse(readinessProbe.isReady());
    }

    @Test
    void shouldRejectUnexpectedRedisResponse() {
        given(connectionFactory.getConnection())
                .willReturn(connection);
        given(connection.ping()).willReturn("unexpected");

        assertFalse(readinessProbe.isReady());
        then(connection).should().close();
    }
}
