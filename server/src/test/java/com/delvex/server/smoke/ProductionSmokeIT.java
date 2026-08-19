package com.delvex.server.smoke;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Duration;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.TimeUnit;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.fail;

class ProductionSmokeIT {

    private static final Duration REQUEST_TIMEOUT = Duration.ofSeconds(10);
    private static final Pattern REFRESH_COOKIE_PATTERN = Pattern.compile(
            "(?:^|;\\s*)refresh_token=([^;]+)",
            Pattern.CASE_INSENSITIVE);

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(REQUEST_TIMEOUT)
            .build();
    private final URI baseUri = URI.create(environmentOrDefault(
            "SERVER_URL",
            "http://127.0.0.1:8080"));
    private final Path logFile = Path.of(environmentOrDefault(
            "SERVER_LOG_FILE",
            "target/production-smoke.log"));

    @Test
    void shouldCompleteProductionJarHttpFlow() throws Throwable {
        Path jar = findProductionJar();
        Process server = startServer(jar);

        try {
            waitUntilReady(server);
            runHttpFlow();
        } catch (Throwable failure) {
            printServerLog();
            throw failure;
        } finally {
            stopServer(server);
        }
    }

    private void runHttpFlow() throws Exception {
        String runId = environmentOrDefault("GITHUB_RUN_ID", "local");
        String uniqueSuffix = UUID.randomUUID().toString().substring(0, 8);
        String email = "production-smoke-%s-%s@example.com"
                .formatted(runId, uniqueSuffix);
        String registrationPayload = """
                {
                  "email": "%s",
                  "password": "strong-password",
                  "firstName": "Production",
                  "lastName": "Smoke"
                }
                """.formatted(email);

        HttpResponse<String> registration = send(
                "POST",
                "/api/auth/register",
                registrationPayload,
                Map.of("Content-Type", "application/json"));
        expectStatus(registration, 201, "Registration");
        assertJsonString(registration.body(), "email", email);

        String accessToken = jsonString(registration.body(), "accessToken");
        String registrationCookie = refreshCookie(registration);
        assertTrue(hasCookieAttribute(registrationCookie, "Secure"),
                "Registration refresh cookie is not Secure");
        String refreshToken = cookieValue(registrationCookie);

        String shipmentPayload = """
                {
                  "originLocationId": "WROCLAW",
                  "destinationLocationId": "WARSAW",
                  "cargoDescription": "Production smoke cargo",
                  "weightKg": 12.50
                }
                """;
        HttpResponse<String> creation = send(
                "POST",
                "/api/shipments",
                shipmentPayload,
                Map.of(
                        "Authorization", bearer(accessToken),
                        "Content-Type", "application/json"));
        expectStatus(creation, 201, "Shipment creation");
        assertJsonString(creation.body(), "status", "CREATED");
        String shipmentId = jsonString(creation.body(), "id");

        HttpResponse<String> retrieval = send(
                "GET",
                "/api/shipments/" + shipmentId,
                null,
                Map.of("Authorization", bearer(accessToken)));
        expectStatus(retrieval, 200, "Shipment retrieval");
        assertJsonString(retrieval.body(), "id", shipmentId);
        assertJsonString(retrieval.body(), "status", "CREATED");

        // The prod cookie is Secure while this loopback smoke intentionally
        // uses HTTP, so send its captured value explicitly.
        HttpResponse<String> refresh = send(
                "POST",
                "/api/auth/refresh",
                null,
                Map.of("Cookie", "refresh_token=" + refreshToken));
        expectStatus(refresh, 200, "Token refresh");
        String refreshedAccessToken = jsonString(refresh.body(), "accessToken");
        String rotatedRefreshToken = cookieValue(refreshCookie(refresh));
        assertFalse(rotatedRefreshToken.isBlank(), "Rotated refresh token is missing");
        assertNotEquals(refreshToken, rotatedRefreshToken,
                "Refresh token was not rotated");

        HttpResponse<String> update = send(
                "PATCH",
                "/api/shipments/" + shipmentId,
                "{\"cargoDescription\":\"Updated production smoke cargo\"}",
                Map.of(
                        "Authorization", bearer(refreshedAccessToken),
                        "Content-Type", "application/json"));
        expectStatus(update, 200, "Shipment update");
        assertJsonString(update.body(), "status", "CREATED");
        assertJsonString(
                update.body(),
                "cargoDescription",
                "Updated production smoke cargo");

        // A valid JWT bypasses the default-deny 401 and proves that springdoc
        // did not generate an authenticated documentation resource in prod.
        for (String path : List.of("/docs", "/docs/openapi.json")) {
            HttpResponse<String> documentation = send(
                    "GET",
                    path,
                    null,
                    Map.of("Authorization", bearer(refreshedAccessToken)));
            expectStatus(documentation, 404, "Production documentation check");
        }

        HttpResponse<String> logout = send(
                "POST",
                "/api/auth/logout",
                null,
                Map.of("Cookie", "refresh_token=" + rotatedRefreshToken));
        expectStatus(logout, 204, "Logout");
        String clearedCookie = refreshCookie(logout);
        assertTrue(hasCookieAttribute(clearedCookie, "Max-Age=0"),
                "Logout did not expire the refresh cookie");
        assertTrue(hasCookieAttribute(clearedCookie, "Secure"),
                "Logout did not preserve the Secure cookie attribute");

        HttpResponse<String> revoked = send(
                "POST",
                "/api/auth/refresh",
                null,
                Map.of("Cookie", "refresh_token=" + rotatedRefreshToken));
        expectStatus(revoked, 401, "Revoked token reuse");
        assertJsonString(
                revoked.body(),
                "message",
                "Refresh token is invalid or expired");

        assertReady(send("GET", "/api/health/ready", null, Map.of()));
        System.out.println("Production JAR smoke flow completed successfully");
    }

    private Process startServer(Path jar) throws IOException {
        Path parent = logFile.getParent();
        if (parent != null) {
            Files.createDirectories(parent);
        }

        Path javaExecutable = Path.of(
                System.getProperty("java.home"),
                "bin",
                isWindows() ? "java.exe" : "java");
        return new ProcessBuilder(javaExecutable.toString(), "-jar", jar.toString())
                .redirectErrorStream(true)
                .redirectOutput(logFile.toFile())
                .start();
    }

    private void waitUntilReady(Process server) throws Exception {
        for (int attempt = 0; attempt < 60; attempt++) {
            assertTrue(server.isAlive(),
                    "Production server stopped before becoming ready");

            try {
                HttpResponse<String> response = send(
                        "GET",
                        "/api/health/ready",
                        null,
                        Map.of());
                if (response.statusCode() == 200
                        && "ok".equals(jsonStringOrNull(response.body(), "status"))) {
                    return;
                }
            } catch (IOException ignored) {
                // The socket is expected to refuse connections during startup.
            }

            Thread.sleep(1_000);
        }

        fail("Production server did not become ready");
    }

    private HttpResponse<String> send(
            String method,
            String path,
            String body,
            Map<String, String> headers) throws IOException, InterruptedException {
        HttpRequest.Builder request = HttpRequest.newBuilder(baseUri.resolve(path))
                .timeout(REQUEST_TIMEOUT);
        headers.forEach(request::header);
        request.method(
                method,
                body == null
                        ? HttpRequest.BodyPublishers.noBody()
                        : HttpRequest.BodyPublishers.ofString(body));
        return httpClient.send(request.build(), HttpResponse.BodyHandlers.ofString());
    }

    private static void expectStatus(
            HttpResponse<String> response,
            int expected,
            String operation) {
        assertEquals(
                expected,
                response.statusCode(),
                () -> "%s returned HTTP %d, expected %d%n%s".formatted(
                        operation,
                        response.statusCode(),
                        expected,
                        response.body()));
    }

    private static void assertReady(HttpResponse<String> response) {
        expectStatus(response, 200, "Final readiness check");
        assertJsonString(response.body(), "status", "ok");
    }

    private static void assertJsonString(String json, String field, String expected) {
        assertEquals(expected, jsonString(json, field),
                () -> "Unexpected JSON field '%s' in:%n%s".formatted(field, json));
    }

    private static String jsonString(String json, String field) {
        String value = jsonStringOrNull(json, field);
        assertTrue(value != null,
                () -> "JSON field '%s' is missing in:%n%s".formatted(field, json));
        return value;
    }

    private static String jsonStringOrNull(String json, String field) {
        Pattern pattern = Pattern.compile(
                "\\\"" + Pattern.quote(field)
                        + "\\\"\\s*:\\s*\\\"((?:\\\\.|[^\\\"\\\\])*)\\\"");
        Matcher matcher = pattern.matcher(json);
        return matcher.find() ? matcher.group(1) : null;
    }

    private static String refreshCookie(HttpResponse<?> response) {
        return response.headers().allValues("set-cookie").stream()
                .filter(cookie -> REFRESH_COOKIE_PATTERN.matcher(cookie).find())
                .findFirst()
                .orElseGet(() -> fail("Refresh cookie is missing"));
    }

    private static String cookieValue(String cookie) {
        Matcher matcher = REFRESH_COOKIE_PATTERN.matcher(cookie);
        assertTrue(matcher.find(), "Refresh cookie is missing");
        return matcher.group(1);
    }

    private static boolean hasCookieAttribute(String cookie, String attribute) {
        String normalized = cookie.toLowerCase(Locale.ROOT);
        return normalized.contains("; " + attribute.toLowerCase(Locale.ROOT));
    }

    private static Path findProductionJar() throws IOException {
        String configured = System.getenv("SERVER_JAR");
        if (configured != null && !configured.isBlank()) {
            Path jar = Path.of(configured);
            assertTrue(Files.isRegularFile(jar),
                    () -> "Production JAR was not found: " + jar);
            return jar;
        }

        Path target = Path.of("target");
        if (!Files.isDirectory(target)) {
            return fail("Production JAR was not found");
        }

        try (var files = Files.list(target)) {
            return files
                    .filter(Files::isRegularFile)
                    .filter(path -> {
                        String name = path.getFileName().toString();
                        return name.startsWith("server-")
                                && name.endsWith(".jar")
                                && !name.endsWith(".jar.original");
                    })
                    .sorted(Comparator.comparing(Path::toString))
                    .findFirst()
                    .orElseGet(() -> fail("Production JAR was not found"));
        }
    }

    private void printServerLog() {
        if (!Files.isRegularFile(logFile)) {
            return;
        }

        try {
            System.err.println("Production server log:");
            System.err.println(Files.readString(logFile));
        } catch (IOException exception) {
            System.err.println("Could not read production server log: "
                    + exception.getMessage());
        }
    }

    private static void stopServer(Process server) throws InterruptedException {
        if (!server.isAlive()) {
            return;
        }

        server.destroy();
        if (!server.waitFor(10, TimeUnit.SECONDS)) {
            server.destroyForcibly();
            server.waitFor(10, TimeUnit.SECONDS);
        }
    }

    private static String bearer(String accessToken) {
        return "Bearer " + accessToken;
    }

    private static String environmentOrDefault(String name, String defaultValue) {
        String value = System.getenv(name);
        return value == null || value.isBlank() ? defaultValue : value;
    }

    private static boolean isWindows() {
        return System.getProperty("os.name")
                .toLowerCase(Locale.ROOT)
                .contains("win");
    }
}
