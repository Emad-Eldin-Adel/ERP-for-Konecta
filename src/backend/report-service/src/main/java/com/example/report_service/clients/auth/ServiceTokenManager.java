package com.example.report_service.clients.auth;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.concurrent.locks.ReentrantLock;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
public class ServiceTokenManager {

    private static final Duration REFRESH_MARGIN = Duration.ofMinutes(1);
    private static final Duration FALLBACK_TTL = Duration.ofMinutes(10);

    private final AuthClient authClient;
    private final ObjectMapper objectMapper;
    private final ReentrantLock lock = new ReentrantLock();
    private final Logger log = LoggerFactory.getLogger(ServiceTokenManager.class);

    private volatile CachedToken cachedToken;

    public ServiceTokenManager(AuthClient authClient, ObjectMapper objectMapper) {
        this.authClient = authClient;
        this.objectMapper = objectMapper;
    }

    public String getToken() {
        var snapshot = cachedToken;
        var now = Instant.now();
        if (snapshot != null && snapshot.expiresAt().isAfter(now.plus(REFRESH_MARGIN))) {
            return snapshot.token();
        }
        lock.lock();
        try {
            snapshot = cachedToken;
            now = Instant.now();
            if (snapshot != null && snapshot.expiresAt().isAfter(now.plus(REFRESH_MARGIN))) {
                return snapshot.token();
            }
            var response = authClient.login();
            var expiresAt = extractExpiry(response.token());
            cachedToken = new CachedToken(response.token(), expiresAt);
            return response.token();
        } finally {
            lock.unlock();
        }
    }

    private Instant extractExpiry(String token) {
        try {
            var parts = token.split("\\.");
            if (parts.length < 2) {
                return Instant.now().plus(FALLBACK_TTL);
            }
            var payload = Base64.getUrlDecoder().decode(parts[1]);
            JsonNode node = objectMapper.readTree(new String(payload, StandardCharsets.UTF_8));
            if (node.has("exp")) {
                long epochSeconds = node.get("exp").asLong();
                return Instant.ofEpochSecond(epochSeconds);
            }
        } catch (Exception ex) {
            log.warn("Unable to decode JWT expiry: {}", ex.getMessage());
        }
        return Instant.now().plus(FALLBACK_TTL);
    }

    private record CachedToken(String token, Instant expiresAt) {
    }
}
