package com.example.hr_service.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.example.hr_service.dtos.request.LeaveRequestDTO;
import com.example.hr_service.dtos.response.LeaveResponse;
import com.example.hr_service.models.Employee;
import com.example.hr_service.models.LeaveRequest;
import com.example.hr_service.models.LeaveStatus;
import com.example.hr_service.models.LeaveType;
import com.example.hr_service.services.LeaveService;
import com.example.hr_service.services.EmployeeService;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/hr/leaves")
@RequiredArgsConstructor
public class LeaveController {

    private final LeaveService leaveService;
    private final EmployeeService employeeService;

    @PostMapping
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<LeaveResponse> create(@RequestBody LeaveRequestDTO req) {
        // Employees can only create leave for themselves: resolve employee by token
        // subject
        var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        String username = auth != null ? auth.getName() : null;
        Employee e = employeeService.findByEmail(username);
        if (e == null) {
            String first = username != null && username.contains("@") ? username.substring(0, username.indexOf('@'))
                    : (username != null ? username : "");
            e = employeeService.ensureByEmail(username, first, "", null, null, null, null, null);
        }
        LeaveType requestedType = req.getLeaveType() != null ? req.getLeaveType() : LeaveType.VACATION;
        LeaveRequest r = LeaveRequest.builder()
                .employee(e)
                .startDate(req.getStartDate())
                .endDate(req.getEndDate())
                .reason(req.getReason())
                .leaveType(requestedType)
                .status(LeaveStatus.PENDING)
                .build();
        return ResponseEntity.ok(toResponse(leaveService.create(r)));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','HR')")
    public ResponseEntity<List<LeaveResponse>> listAll() {
        return ResponseEntity.ok(
                leaveService.listAll().stream().map(this::toResponse).collect(Collectors.toList()));
    }

    @GetMapping("/{employeeId}")
    @PreAuthorize("hasAnyRole('ADMIN','HR','EMPLOYEE')")
    public ResponseEntity<List<LeaveResponse>> byEmployee(@PathVariable Long employeeId) {
        var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getAuthorities().stream().anyMatch(a -> "ROLE_EMPLOYEE".equals(a.getAuthority()))) {
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
                leaveService.getByEmployee(employeeId).stream().map(this::toResponse).collect(Collectors.toList()));
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<List<LeaveResponse>> mine() {
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
                leaveService.getByEmployee(employeeId).stream().map(this::toResponse).collect(Collectors.toList()));
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('ADMIN','HR')")
    public ResponseEntity<LeaveResponse> approve(@PathVariable Long id) {
        return ResponseEntity.ok(toResponse(leaveService.approve(id)));
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('ADMIN','HR')")
    public ResponseEntity<LeaveResponse> reject(@PathVariable Long id) {
        return ResponseEntity.ok(toResponse(leaveService.reject(id)));
    }

    private LeaveResponse toResponse(LeaveRequest r) {
        Employee employee = r.getEmployee();
        String fullName = null;
        String email = null;
        if (employee != null) {
            String first = employee.getFirstName() != null ? employee.getFirstName().trim() : "";
            String last = employee.getLastName() != null ? employee.getLastName().trim() : "";
            fullName = (first + " " + last).trim();
            email = employee.getEmail();
            if ((fullName == null || fullName.isBlank()) && email != null) {
                fullName = email;
            }
        }
        return LeaveResponse.builder()
                .id(r.getId())
                .employeeId(employee != null ? employee.getId() : null)
                .employeeName(fullName)
                .employeeEmail(email)
                .startDate(r.getStartDate())
                .endDate(r.getEndDate())
                .reason(r.getReason())
                .status(r.getStatus() != null ? r.getStatus().name() : null)
                .leaveType(r.getLeaveType() != null ? r.getLeaveType().name() : null)
                .build();
    }
}
