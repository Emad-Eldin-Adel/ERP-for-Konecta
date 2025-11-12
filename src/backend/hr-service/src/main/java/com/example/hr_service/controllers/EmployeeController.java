package com.example.hr_service.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.example.hr_service.dtos.request.EmployeeRequest;
import com.example.hr_service.dtos.request.EnsureEmployeeRequest;
import com.example.hr_service.dtos.response.EmployeeResponse;
import com.example.hr_service.models.Employee;
import com.example.hr_service.models.Department;
import com.example.hr_service.services.EmployeeService;
import com.example.hr_service.services.DepartmentService;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/hr/employees")
@RequiredArgsConstructor
public class EmployeeController {

    private final EmployeeService employeeService;
    private final DepartmentService departmentService;

    @GetMapping
    public ResponseEntity<List<EmployeeResponse>> getAll() {
        List<EmployeeResponse> body = employeeService.findAll().stream().map(this::toResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(body);
    }

    @GetMapping("/{id}")
    public ResponseEntity<EmployeeResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(toResponse(employeeService.findById(id)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','HR')")
    public ResponseEntity<EmployeeResponse> create(@RequestBody EmployeeRequest req) {
        Employee e = fromRequest(req);
        return ResponseEntity.ok(toResponse(employeeService.create(e)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','HR')")
    public ResponseEntity<EmployeeResponse> update(@PathVariable Long id, @RequestBody EmployeeRequest req) {
        Employee updated = fromRequest(req);
        return ResponseEntity.ok(toResponse(employeeService.update(id, updated)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','HR')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        employeeService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/ensure")
    @PreAuthorize("hasAnyRole('ADMIN','HR')")
    public ResponseEntity<EmployeeResponse> ensure(@RequestBody EnsureEmployeeRequest req) {
        Department dept = null;
        if (req.getDepartmentId() != null) {
            dept = departmentService.findById(req.getDepartmentId());
        }
        String full = req.getFullName() != null ? req.getFullName().trim() : "";
        String first = full.contains(" ") ? full.substring(0, full.indexOf(' ')).trim() : full;
        String last = full.contains(" ") ? full.substring(full.indexOf(' ') + 1).trim() : "";
        Employee saved = employeeService.ensureByEmail(req.getEmail(), first, last, req.getPhone(), req.getPosition(),
                dept, req.getSalary(), req.getWorkingHours());
        return ResponseEntity.ok(toResponse(saved));
    }

    @GetMapping("/me-id")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<Long> myEmployeeId() {
        var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        String username = auth != null ? auth.getName() : null;
        if (username == null || username.isBlank()) {
            return ResponseEntity.status(403).build();
        }
        var existing = employeeService.findByEmail(username);
        if (existing == null) {
            String first = username.contains("@") ? username.substring(0, username.indexOf('@')) : username;
            existing = employeeService.ensureByEmail(username, first, "", null, null, null, null, null);
        }
        return ResponseEntity.ok(existing.getId());
    }

    private Employee fromRequest(EmployeeRequest r) {
        Department dept = null;
        if (r.getDepartmentId() != null) {
            dept = departmentService.findById(r.getDepartmentId());
        }
        return Employee.builder()
                .firstName(r.getFirstName())
                .lastName(r.getLastName())
                .email(r.getEmail())
                .phone(r.getPhone())
                .position(r.getPosition())
                .hireDate(r.getHireDate())
                .salary(r.getSalary())
                .workingHours(r.getWorkingHours())
                .department(dept)
                .build();
    }

    private EmployeeResponse toResponse(Employee e) {
        return EmployeeResponse.builder()
                .id(e.getId())
                .firstName(e.getFirstName())
                .lastName(e.getLastName())
                .email(e.getEmail())
                .phone(e.getPhone())
                .position(e.getPosition())
                .hireDate(e.getHireDate())
                .salary(e.getSalary())
                .workingHours(e.getWorkingHours())
                .departmentId(e.getDepartment() != null ? e.getDepartment().getId() : null)
                .departmentName(e.getDepartment() != null ? e.getDepartment().getName() : null)
                .build();
    }
}
