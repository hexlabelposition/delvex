package com.delvex.server.health;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/health")
public class HealthController {

    private final DatabaseReadinessProbe databaseReadinessProbe;
    private final RedisReadinessProbe redisReadinessProbe;

    public HealthController(
            DatabaseReadinessProbe databaseReadinessProbe,
            RedisReadinessProbe redisReadinessProbe) {
        this.databaseReadinessProbe = databaseReadinessProbe;
        this.redisReadinessProbe = redisReadinessProbe;
    }

    @GetMapping("/live")
    public HealthStatus liveness() {
        return new HealthStatus("ok");
    }

    @GetMapping({"", "/ready"})
    public ResponseEntity<HealthStatus> readiness() {
        if (databaseReadinessProbe.isReady()
                && redisReadinessProbe.isReady()) {
            return ResponseEntity.ok(new HealthStatus("ok"));
        }

        return ResponseEntity
                .status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(new HealthStatus("unavailable"));
    }

    public record HealthStatus(String status) {
    }
}
