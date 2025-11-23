package com.example.inventory_service.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Value("${app.cors.allowed-origins:*}")
    private String allowedOrigins;

    @Value("${app.cors.allowed-origin-patterns:*}")
    private String allowedOriginPatterns;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        List<String> origins = parseList(allowedOrigins);
        List<String> patterns = parseList(allowedOriginPatterns);

        registry.addMapping("/**")
                .allowCredentials(true)
                .allowedMethods("*")
                .allowedHeaders("*")
                .allowedOriginPatterns(!patterns.isEmpty() ? patterns.toArray(new String[0]) : new String[]{"*"})
                .allowedOrigins(!origins.contains("*") ? origins.toArray(new String[0]) : new String[]{});
    }

    private List<String> parseList(String csv) {
        return Arrays.stream(csv.split(","))
                .map(String::trim)
                .filter(item -> !item.isEmpty())
                .collect(Collectors.toList());
    }
}
