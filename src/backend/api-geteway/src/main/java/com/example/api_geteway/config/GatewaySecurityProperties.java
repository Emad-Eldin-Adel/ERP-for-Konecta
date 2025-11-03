package com.example.api_geteway.config;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.security")
public class GatewaySecurityProperties {

    private List<String> publicPaths = new ArrayList<>(List.of(
            "/api/auth/login",
            "/api/auth/logout",
            "/actuator/**",
            "/swagger-ui.html",
            "/swagger-ui/**",
            "/v3/api-docs/**"
    ));

    private List<RoleRoute> roleRoutes = new ArrayList<>(List.of(
            new RoleRoute("/api/admin/**", Set.of("ADMIN")),
            new RoleRoute("/api/hr/**", Set.of("HR", "ADMIN")),
            new RoleRoute("/api/finance/**", Set.of("FINANCE", "ADMIN"))
    ));

    public List<String> getPublicPaths() {
        return publicPaths;
    }

    public void setPublicPaths(List<String> publicPaths) {
        this.publicPaths = publicPaths;
    }

    public List<RoleRoute> getRoleRoutes() {
        return roleRoutes;
    }

    public void setRoleRoutes(List<RoleRoute> roleRoutes) {
        this.roleRoutes = roleRoutes;
    }

    public static class RoleRoute {
        private String pattern;
        private Set<String> roles = new HashSet<>();

        public RoleRoute() {
        }

        public RoleRoute(String pattern, Set<String> roles) {
            this.pattern = pattern;
            this.roles = roles;
        }

        public String getPattern() {
            return pattern;
        }

        public void setPattern(String pattern) {
            this.pattern = pattern;
        }

        public Set<String> getRoles() {
            return roles;
        }

        public void setRoles(Set<String> roles) {
            this.roles = roles;
        }
    }
}
