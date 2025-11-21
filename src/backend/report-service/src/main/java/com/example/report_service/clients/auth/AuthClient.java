package com.example.report_service.clients.auth;

import com.example.report_service.clients.AbstractServiceClient;
import com.example.report_service.config.ReportServiceProperties;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
public class AuthClient extends AbstractServiceClient {

    private final ReportServiceProperties.AuthProperties properties;

    public AuthClient(RestTemplate restTemplate, ReportServiceProperties properties) {
        super(restTemplate, properties.getAuth().getBaseUrls());
        this.properties = properties.getAuth();
    }

    public LoginResponse login() {
        var request = new LoginRequest(properties.getEmail(), properties.getPassword());
        return exchange(HttpMethod.POST,
                "/login",
                null,
                request,
                new ParameterizedTypeReference<LoginResponse>() {},
                null,
                "authenticate with auth-service");
    }
}
