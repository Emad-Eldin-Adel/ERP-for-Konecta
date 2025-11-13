package com.example.api_geteway;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.*;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.HttpStatusCodeException;

import jakarta.servlet.http.HttpServletRequest;
import java.net.URI;
import java.util.Enumeration;

@RestController
@RequestMapping("/api")
public class ProxyController {

    private final RestTemplate restTemplate;
    private static final Logger log = LoggerFactory.getLogger(ProxyController.class);

    public ProxyController(RestTemplateBuilder builder) {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(12000);
        factory.setReadTimeout(200000);
        this.restTemplate = builder.requestFactory(() -> factory).build();
    }

    @RequestMapping(path = "/auth/**", method = {
            RequestMethod.GET,
            RequestMethod.HEAD,
            RequestMethod.OPTIONS,
            RequestMethod.POST,
            RequestMethod.PUT,
            RequestMethod.PATCH,
            RequestMethod.DELETE
    })
    public ResponseEntity<byte[]> proxyAuth(HttpMethod method,
            HttpServletRequest request,
            @RequestBody(required = false) byte[] body) {
        String upstreamBase = "http://auth-service:8081/api/auth";
        return forward(upstreamBase, method, request, body);
    }

    @RequestMapping(path = "/hr/**", method = {
            RequestMethod.GET,
            RequestMethod.HEAD,
            RequestMethod.OPTIONS,
            RequestMethod.POST,
            RequestMethod.PUT,
            RequestMethod.PATCH,
            RequestMethod.DELETE
    })
    public ResponseEntity<byte[]> proxyHr(HttpMethod method,
            HttpServletRequest request,
            @RequestBody(required = false) byte[] body) {
        String upstreamBase = "http://hr-service:8083/api/hr";
        return forward(upstreamBase, method, request, body);
    }

    @RequestMapping(path = "/finance/**", method = {
            RequestMethod.GET,
            RequestMethod.HEAD,
            RequestMethod.OPTIONS,
            RequestMethod.POST,
            RequestMethod.PUT,
            RequestMethod.PATCH,
            RequestMethod.DELETE
    })
    public ResponseEntity<byte[]> proxyFinance(HttpMethod method,
            HttpServletRequest request,
            @RequestBody(required = false) byte[] body) {
        String upstreamBase = "http://finance-service:8085/api/finance";
        return forward(upstreamBase, method, request, body);
    }

    private ResponseEntity<byte[]> forward(String upstreamBase,
            HttpMethod method,
            HttpServletRequest request,
            byte[] body) {
        String fullPath = request.getRequestURI(); // e.g. /api/auth/login
        String prefix = "/api";
        String suffix = fullPath.startsWith(prefix) ? fullPath.substring(prefix.length()) : fullPath; // e.g.
                                                                                                      // /hr/employees
        String query = request.getQueryString();
        // Remove the first path segment (/auth|/hr|/finance|/reporting) to avoid
        // duplication with upstreamBase
        String cleaned = suffix.replaceFirst("^/(auth|hr|finance)", "");
        String target = upstreamBase + cleaned + (query != null ? "?" + query : "");

        HttpHeaders headers = extractHeaders(request);
        // Remove hop-by-hop headers
        headers.remove(HttpHeaders.HOST);
        headers.remove(HttpHeaders.CONTENT_LENGTH);
        headers.remove(HttpHeaders.ACCEPT_ENCODING);

        // For multipart/form-data requests, Spring may not bind @RequestBody. Fallback
        // to raw stream.
        if (body == null || body.length == 0) {
            try {
                var is = request.getInputStream();
                body = is.readAllBytes();
            } catch (Exception ignore) {
                body = new byte[0];
            }
        }

        HttpEntity<byte[]> entity = new HttpEntity<>(body, headers);
        String fullUrl = fullPath + (query != null ? ("?" + query) : "");
        log.info("Proxy {} {} -> {}", method, fullUrl, target);
        try {
            ResponseEntity<byte[]> resp = restTemplate.exchange(URI.create(target), method, entity, byte[].class);
            HttpHeaders out = new HttpHeaders();
            out.putAll(resp.getHeaders());
            out.remove(HttpHeaders.TRANSFER_ENCODING);
            out.remove(HttpHeaders.CONTENT_LENGTH);
            return new ResponseEntity<>(resp.getBody(), out, resp.getStatusCode());
        } catch (HttpStatusCodeException ex) {
            HttpHeaders out = new HttpHeaders();
            if (ex.getResponseHeaders() != null) {
                out.putAll(ex.getResponseHeaders());
            }
            out.remove(HttpHeaders.TRANSFER_ENCODING);
            out.remove(HttpHeaders.CONTENT_LENGTH);
            return new ResponseEntity<>(ex.getResponseBodyAsByteArray(), out, ex.getStatusCode());
        }
    }

    private static HttpHeaders extractHeaders(HttpServletRequest request) {
        HttpHeaders headers = new HttpHeaders();
        for (Enumeration<String> names = request.getHeaderNames(); names != null && names.hasMoreElements();) {
            String name = names.nextElement();
            for (Enumeration<String> values = request.getHeaders(name); values.hasMoreElements();) {
                headers.add(name, values.nextElement());
            }
        }
        return headers;
    }
}
