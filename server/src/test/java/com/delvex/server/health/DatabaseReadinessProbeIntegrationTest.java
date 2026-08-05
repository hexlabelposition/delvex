package com.delvex.server.health;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
class DatabaseReadinessProbeIntegrationTest {

    @Autowired
    private DatabaseReadinessProbe readinessProbe;

    @Test
    void shouldReachPostgreSql() {
        assertTrue(readinessProbe.isReady());
    }
}
