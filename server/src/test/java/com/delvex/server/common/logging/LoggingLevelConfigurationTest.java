package com.delvex.server.common.logging;

import org.junit.jupiter.api.Test;
import org.slf4j.LoggerFactory;
import org.springframework.boot.test.context.SpringBootTest;

import ch.qos.logback.classic.Level;
import ch.qos.logback.classic.Logger;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(properties = "LOG_LEVEL=DEBUG")
class LoggingLevelConfigurationTest {

    @Test
    void shouldConfigureApplicationLogLevelFromEnvironment() {
        Logger applicationLogger = (Logger) LoggerFactory.getLogger(
                "com.delvex.server");

        assertThat(applicationLogger.getEffectiveLevel())
                .isEqualTo(Level.DEBUG);
    }
}
