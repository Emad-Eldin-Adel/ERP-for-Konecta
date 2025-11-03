package com.example.api_geteway.security;

import com.example.api_geteway.config.JwtProperties;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;


import java.nio.charset.StandardCharsets;
import java.security.Key;

@Component
public class JwtTokenService {

    private final Key signingKey;

    public JwtTokenService(JwtProperties properties) {
        String secret = properties != null ? properties.getSecret() : null;
        if (secret == null || secret.length() < 32) {
            throw new IllegalArgumentException("JWT secret must be configured and at least 32 characters long");
        }
        this.signingKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public Claims parseClaims(String token) throws JwtException, ExpiredJwtException {
        return Jwts.parserBuilder()
                .setSigningKey(signingKey)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}
