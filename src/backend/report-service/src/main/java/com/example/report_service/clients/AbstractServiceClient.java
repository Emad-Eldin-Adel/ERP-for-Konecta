package com.example.report_service.clients;

import java.net.URI;
import java.util.ArrayList;
import java.util.List;
import java.util.function.Consumer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.RequestEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.Nullable;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

public abstract class AbstractServiceClient {

    protected final Logger log = LoggerFactory.getLogger(getClass());
    private final RestTemplate restTemplate;
    private final List<String> baseUrls;

    protected AbstractServiceClient(RestTemplate restTemplate, List<String> baseUrls) {
        this.restTemplate = restTemplate;
        this.baseUrls = sanitize(baseUrls);
    }

    protected <T> T exchange(HttpMethod method,
                             String relativePath,
                             @Nullable Consumer<UriComponentsBuilder> uriCustomizer,
                             @Nullable Object body,
                             ParameterizedTypeReference<T> responseType,
                             @Nullable Consumer<HttpHeaders> headersCustomizer,
                             String operationDescription) {
        if (baseUrls.isEmpty()) {
            throw new IllegalStateException("No base URLs configured for " + getClass().getSimpleName());
        }
        RestClientException lastException = null;
        for (String base : baseUrls) {
            try {
                URI uri = buildUri(base, relativePath, uriCustomizer);
                HttpHeaders headers = new HttpHeaders();
                headers.setAccept(List.of(MediaType.APPLICATION_JSON));
                if (body != null) {
                    headers.setContentType(MediaType.APPLICATION_JSON);
                }
                if (headersCustomizer != null) {
                    headersCustomizer.accept(headers);
                }
                RequestEntity<?> request = new RequestEntity<>(body, headers, method, uri);
                ResponseEntity<T> response = restTemplate.exchange(request, responseType);
                if (response.getStatusCode().is2xxSuccessful()) {
                    return response.getBody();
                }
            } catch (RestClientException ex) {
                lastException = ex;
                log.warn("Failed to {} via {}: {}", operationDescription, base, ex.getMessage());
            }
        }
        throw new IllegalStateException("Unable to " + operationDescription, lastException);
    }

    private static URI buildUri(String base, String relativePath, @Nullable Consumer<UriComponentsBuilder> uriCustomizer) {
        String normalizedBase = normalizeBase(base);
        String normalizedPath = normalizePath(relativePath);
        UriComponentsBuilder builder = UriComponentsBuilder.fromHttpUrl(normalizedBase).path(normalizedPath);
        if (uriCustomizer != null) {
            uriCustomizer.accept(builder);
        }
        return builder.build(true).toUri();
    }

    private static String normalizeBase(String base) {
        if (!StringUtils.hasText(base)) {
            throw new IllegalArgumentException("Base URL must not be empty");
        }
        return base.endsWith("/") ? base.substring(0, base.length() - 1) : base;
    }

    private static String normalizePath(String relativePath) {
        if (!StringUtils.hasText(relativePath)) {
            return "";
        }
        return relativePath.startsWith("/") ? relativePath : "/" + relativePath;
    }

    private static List<String> sanitize(List<String> values) {
        List<String> sanitized = new ArrayList<>();
        if (values == null) {
            return sanitized;
        }
        for (String value : values) {
            if (StringUtils.hasText(value)) {
                sanitized.add(value.trim());
            }
        }
        return sanitized;
    }
}
