package com.delvex.server.health;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@RestController
@RequestMapping("/api")
public class HealthController {

    @GetMapping("/health")
    public HealthStatus getStatus() {
        return new HealthStatus("ok");
    }

    public record HealthStatus(String status) {
    }

}
