package com.example.report_service.clients.hr;

import com.example.report_service.clients.AbstractServiceClient;
import com.example.report_service.clients.auth.ServiceTokenManager;
import com.example.report_service.clients.hr.dto.HrDepartment;
import com.example.report_service.clients.hr.dto.HrEmployee;
import com.example.report_service.clients.hr.dto.HrLeave;
import com.example.report_service.clients.hr.dto.HrTraining;
import com.example.report_service.config.ReportServiceProperties;
import java.util.List;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
public class HrClient extends AbstractServiceClient {

    private final ServiceTokenManager tokenManager;

    public HrClient(RestTemplate restTemplate,
                    ReportServiceProperties properties,
                    ServiceTokenManager tokenManager) {
        super(restTemplate, properties.getClients().getHr().getBaseUrls());
        this.tokenManager = tokenManager;
    }

    public List<HrEmployee> fetchEmployees() {
        var token = tokenManager.getToken();
        var employees = exchange(HttpMethod.GET,
                "/employees",
                null,
                null,
                new ParameterizedTypeReference<List<HrEmployee>>() {},
                headers -> applyAuth(headers, token),
                "fetch employees");
        return employees == null ? List.of() : employees;
    }

    public List<HrDepartment> fetchDepartments() {
        var token = tokenManager.getToken();
        var departments = exchange(HttpMethod.GET,
                "/departments",
                null,
                null,
                new ParameterizedTypeReference<List<HrDepartment>>() {},
                headers -> applyAuth(headers, token),
                "fetch departments");
        return departments == null ? List.of() : departments;
    }

    public List<HrLeave> fetchLeaves() {
        var token = tokenManager.getToken();
        var leaves = exchange(HttpMethod.GET,
                "/leaves",
                null,
                null,
                new ParameterizedTypeReference<List<HrLeave>>() {},
                headers -> applyAuth(headers, token),
                "fetch leave requests");
        return leaves == null ? List.of() : leaves;
    }

    public List<HrTraining> fetchTrainings() {
        var token = tokenManager.getToken();
        var trainings = exchange(HttpMethod.GET,
                "/training",
                null,
                null,
                new ParameterizedTypeReference<List<HrTraining>>() {},
                headers -> applyAuth(headers, token),
                "fetch trainings");
        return trainings == null ? List.of() : trainings;
    }

    private void applyAuth(HttpHeaders headers, String token) {
        headers.setBearerAuth(token);
    }
}
