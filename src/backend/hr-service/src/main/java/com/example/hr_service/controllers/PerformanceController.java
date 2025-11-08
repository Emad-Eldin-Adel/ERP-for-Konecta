package com.example.hr_service.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.example.hr_service.dtos.request.PerformanceRequest;
import com.example.hr_service.dtos.response.PerformanceResponse;
import com.example.hr_service.models.Performance;
import com.example.hr_service.models.Employee;
import com.example.hr_service.services.PerformanceService;
import com.example.hr_service.services.EmployeeService;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/hr/performance")
@RequiredArgsConstructor
public class PerformanceController {

    private final PerformanceService performanceService;
    private final EmployeeService employeeService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','HR')")
    public ResponseEntity<PerformanceResponse> create(@RequestBody PerformanceRequest req) {
        Employee e = employeeService.findById(req.getEmployeeId());
        Performance p = Performance.builder()
                .employee(e)
                .rating(req.getRating())
                .feedback(req.getFeedback())
                .reviewDate(req.getReviewDate())
                .build();
        return ResponseEntity.ok(toResponse(performanceService.create(p)));
    }

    @GetMapping("/{employeeId}")
    @PreAuthorize("hasAnyRole('ADMIN','HR','EMPLOYEE')")
    public ResponseEntity<List<PerformanceResponse>> byEmployee(@PathVariable Long employeeId) {
        var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getAuthorities().stream().anyMatch(a -> "ROLE_EMPLOYEE".equals(a.getAuthority()))) {
            // Employees can only view their own performance; ignore path param
            String username = auth.getName();
            Employee self = employeeService.findByEmail(username);
            if (self == null) {
                String first = username != null && username.contains("@") ? username.substring(0, username.indexOf('@'))
                        : (username != null ? username : "");
                self = employeeService.ensureByEmail(username, first, "", null, null, null, null, null);
            }
            employeeId = self.getId();
        }
        return ResponseEntity.ok(
                performanceService.getByEmployee(employeeId).stream().map(this::toResponse)
                        .collect(Collectors.toList()));
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<List<PerformanceResponse>> mine() {
        var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        String username = auth != null ? auth.getName() : null;
        Employee self = employeeService.findByEmail(username);
        if (self == null) {
            String first = username != null && username.contains("@") ? username.substring(0, username.indexOf('@'))
                    : (username != null ? username : "");
            self = employeeService.ensureByEmail(username, first, "", null, null, null, null, null);
        }
        Long employeeId = self.getId();
        return ResponseEntity.ok(
                performanceService.getByEmployee(employeeId).stream().map(this::toResponse)
                        .collect(Collectors.toList()));
    }

    private PerformanceResponse toResponse(Performance p) {
        return PerformanceResponse.builder()
                .id(p.getId())
                .employeeId(p.getEmployee() != null ? p.getEmployee().getId() : null)
                .rating(p.getRating())
                .feedback(p.getFeedback())
                .reviewDate(p.getReviewDate())
                .build();
    }
}