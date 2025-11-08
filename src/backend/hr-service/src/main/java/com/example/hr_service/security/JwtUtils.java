package com.example.hr_service.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import org.springframework.stereotype.Component;

@Component
public class JwtUtils {
    private final JwtService jwtService;

    public JwtUtils(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    public String getSubject(String token) {
        return jwtService.getSubject(token);
    }

    public Jws<Claims> validate(String token) {
        return jwtService.validate(token);
    }

    public String getRole(String token) {
        try {
            return jwtService.validate(token).getBody().get("role", String.class);
        } catch (Exception e) {
            return null;
        }
    }

    public Long getUserId(String token) {
        try {
            Object uid = jwtService.validate(token).getBody().get("uid");
            if (uid == null)
                return null;
            if (uid instanceof Number n)
                return n.longValue();
            return Long.parseLong(uid.toString());
        } catch (Exception e) {
            return null;
        }
    }
}