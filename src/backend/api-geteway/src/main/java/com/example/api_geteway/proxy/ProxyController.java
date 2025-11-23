package com.example.api_geteway.proxy;

import java.util.Locale;
import java.util.Set;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;

import com.example.api_geteway.config.ProxyProperties;

import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api")
public class ProxyController {

    private static final Logger log = LoggerFactory.getLogger(ProxyController.class);

    private static final Set<String> HOP_BY_HOP = Set.of(
            HttpHeaders.HOST.toLowerCase(Locale.ROOT),
            HttpHeaders.CONTENT_LENGTH.toLowerCase(Locale.ROOT),
            HttpHeaders.TRANSFER_ENCODING.toLowerCase(Locale.ROOT),
            HttpHeaders.ACCEPT_ENCODING.toLowerCase(Locale.ROOT),
            HttpHeaders.CONNECTION.toLowerCase(Locale.ROOT),
            "keep-alive",
            "proxy-authenticate",
            "proxy-authorization",
            "te",
            "trailer",
            "upgrade");

    private final WebClient webClient;
    private final ProxyProperties proxyProperties;

    public ProxyController(WebClient.Builder webClientBuilder, ProxyProperties proxyProperties) {
        this.webClient = webClientBuilder.build();
        this.proxyProperties = proxyProperties;
    }

    @RequestMapping(path = "/auth/**", method = {
            RequestMethod.GET, RequestMethod.HEAD, RequestMethod.OPTIONS, RequestMethod.POST,
            RequestMethod.PUT, RequestMethod.PATCH, RequestMethod.DELETE })
    public Mono<ResponseEntity<byte[]>> proxyAuth(ServerHttpRequest request) {
        return forward(proxyProperties.getAuthBaseUrl(), request, "auth");
    }

    @RequestMapping(path = "/hr/**", method = {
            RequestMethod.GET, RequestMethod.HEAD, RequestMethod.OPTIONS, RequestMethod.POST,
            RequestMethod.PUT, RequestMethod.PATCH, RequestMethod.DELETE })
    public Mono<ResponseEntity<byte[]>> proxyHr(ServerHttpRequest request) {
        return forward(proxyProperties.getHrBaseUrl(), request, "hr");
    }

    @RequestMapping(path = "/finance/**", method = {
            RequestMethod.GET, RequestMethod.HEAD, RequestMethod.OPTIONS, RequestMethod.POST,
            RequestMethod.PUT, RequestMethod.PATCH, RequestMethod.DELETE })
    public Mono<ResponseEntity<byte[]>> proxyFinance(ServerHttpRequest request) {
        return forward(proxyProperties.getFinanceBaseUrl(), request, "finance");
    }

    @RequestMapping(path = "/inventory/**", method = {
            RequestMethod.GET, RequestMethod.HEAD, RequestMethod.OPTIONS, RequestMethod.POST,
            RequestMethod.PUT, RequestMethod.PATCH, RequestMethod.DELETE })
    public Mono<ResponseEntity<byte[]>> proxyInventory(ServerHttpRequest request) {
        return forward(proxyProperties.getInventoryBaseUrl(), request, "inventory");
    }

    @RequestMapping(path = "/reporting/**", method = {
            RequestMethod.GET, RequestMethod.HEAD, RequestMethod.OPTIONS, RequestMethod.POST,
            RequestMethod.PUT, RequestMethod.PATCH, RequestMethod.DELETE })
    public Mono<ResponseEntity<byte[]>> proxyReporting(ServerHttpRequest request) {
        return forward(proxyProperties.getReportingBaseUrl(), request, "reporting");
    }

    private Mono<ResponseEntity<byte[]>> forward(String upstreamBase, ServerHttpRequest request, String segment) {
        HttpMethod method = request.getMethod() != null ? request.getMethod() : HttpMethod.GET;

        String target = buildTarget(upstreamBase, request.getURI().getRawPath(), request.getURI().getRawQuery(),
                segment);
        HttpHeaders headers = filterHeaders(request.getHeaders());

        WebClient.RequestBodySpec bodySpec = webClient.method(method).uri(target);
        WebClient.RequestHeadersSpec<?> requestSpec = bodySpec.headers(httpHeaders -> httpHeaders.addAll(headers));

        boolean hasBody = method == HttpMethod.POST || method == HttpMethod.PUT || method == HttpMethod.PATCH
                || method == HttpMethod.DELETE;
        if (hasBody) {
            requestSpec = bodySpec.body(BodyInserters.fromDataBuffers(request.getBody()));
        }

        log.info("Proxy {} {} -> {}", method, request.getURI(), target);

        return requestSpec.exchangeToMono(clientResponse -> {
            HttpHeaders outbound = new HttpHeaders();
            outbound.putAll(clientResponse.headers().asHttpHeaders());
            outbound.remove(HttpHeaders.TRANSFER_ENCODING);
            outbound.remove(HttpHeaders.CONTENT_LENGTH);
            return clientResponse.bodyToMono(byte[].class)
                    .defaultIfEmpty(new byte[0])
                    .map(body -> ResponseEntity.status(clientResponse.statusCode())
                            .headers(outbound)
                            .body(body));
        });
    }

    private String buildTarget(String upstreamBase, String rawPath, String rawQuery, String segment) {
        String prefix = "/api";
        String suffix = rawPath.startsWith(prefix) ? rawPath.substring(prefix.length()) : rawPath;
        String cleaned = suffix.replaceFirst("^/" + segment, "");
        StringBuilder builder = new StringBuilder(upstreamBase);
        if (!cleaned.isEmpty()) {
            builder.append(cleaned);
        }
        if (rawQuery != null && !rawQuery.isBlank()) {
            builder.append("?").append(rawQuery);
        }
        return builder.toString();
    }

    private HttpHeaders filterHeaders(HttpHeaders incoming) {
        HttpHeaders filtered = new HttpHeaders();
        incoming.forEach((name, values) -> {
            if (!HOP_BY_HOP.contains(name.toLowerCase(Locale.ROOT))) {
                filtered.put(name, values);
            }
        });
        return filtered;
    }
}
