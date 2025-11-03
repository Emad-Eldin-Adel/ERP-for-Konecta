package com.example.api_geteway.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;

import org.springframework.core.Ordered;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;
import org.springframework.web.server.ServerWebExchange;

import com.example.api_geteway.config.GatewaySecurityProperties;

import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;

import reactor.core.publisher.Mono;

import java.nio.charset.StandardCharsets;
import java.util.Locale;

@Component
public class JwtAuthenticationFilter implements GlobalFilter, Ordered {

    private static final String HEADER_USER_ID = "X-Auth-User-Id";
    private static final String HEADER_USER_ROLE = "X-Auth-User-Role";
    private static final String HEADER_USER_EMAIL = "X-Auth-User-Email";

    private final JwtTokenService jwtTokenService;
    private final GatewaySecurityProperties securityProperties;
    private final AntPathMatcher pathMatcher = new AntPathMatcher();

    public JwtAuthenticationFilter(JwtTokenService jwtTokenService,
                                   GatewaySecurityProperties securityProperties) {
        this.jwtTokenService = jwtTokenService;
        this.securityProperties = securityProperties;
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        String path = request.getURI().getPath();

        if (HttpMethod.OPTIONS.equals(request.getMethod())) {
            return chain.filter(exchange);
        }

        if (isPublicPath(path)) {
            return chain.filter(exchange);
        }

        String authHeader = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return writeError(exchange, HttpStatus.UNAUTHORIZED, "Missing or invalid Authorization header");
        }

        String token = authHeader.substring(7);
        Claims claims;
        try {
            claims = jwtTokenService.parseClaims(token);
        } catch (ExpiredJwtException ex) {
            return writeError(exchange, HttpStatus.UNAUTHORIZED, "Token expired");
        } catch (JwtException ex) {
            return writeError(exchange, HttpStatus.UNAUTHORIZED, "Invalid token");
        }

        String role = claims.get("role", String.class);
        if (role != null) {
            role = role.toUpperCase(Locale.ROOT);
        }
        if (!isRoleAllowed(path, role)) {
            return writeError(exchange, HttpStatus.FORBIDDEN, "Access denied for role");
        }

        Object userIdClaim = claims.get("userId");
        String userId = userIdClaim != null ? String.valueOf(userIdClaim) : "";
        String email = claims.getSubject() != null ? claims.getSubject() : "";

        ServerHttpRequest mutatedRequest = request.mutate()
                .header(HEADER_USER_ID, userId)
                .header(HEADER_USER_ROLE, role != null ? role : "")
                .header(HEADER_USER_EMAIL, email)
                .build();

        return chain.filter(exchange.mutate().request(mutatedRequest).build());
    }

    private boolean isPublicPath(String path) {
        return securityProperties.getPublicPaths()
                .stream()
                .anyMatch(pattern -> pathMatcher.match(pattern, path));
    }

    private boolean isRoleAllowed(String path, String role) {
        return securityProperties.getRoleRoutes()
                .stream()
                .filter(route -> pathMatcher.match(route.getPattern(), path))
                .map(GatewaySecurityProperties.RoleRoute::getRoles)
                .findFirst()
                .map(roles -> role != null && roles.stream().anyMatch(r -> r.equalsIgnoreCase(role)))
                .orElse(true);
    }

    private Mono<Void> writeError(ServerWebExchange exchange, HttpStatus status, String message) {
        exchange.getResponse().setStatusCode(status);
        exchange.getResponse().getHeaders().setContentType(MediaType.APPLICATION_JSON);
        byte[] bytes = ("{\"error\":\"" + message + "\"}").getBytes(StandardCharsets.UTF_8);
        return exchange.getResponse().writeWith(Mono.just(exchange.getResponse().bufferFactory().wrap(bytes)));
    }

    @Override
    public int getOrder() {
        return -1;
    }
}
