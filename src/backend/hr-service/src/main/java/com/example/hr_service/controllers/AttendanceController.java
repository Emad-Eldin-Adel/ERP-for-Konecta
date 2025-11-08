package com.example.hr_service.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.example.hr_service.models.Attendance;
import com.example.hr_service.models.Employee;
import com.example.hr_service.services.AttendanceService;
import com.example.hr_service.services.EmployeeService;
import com.example.hr_service.dtos.request.AttendanceRequest;
import com.example.hr_service.dtos.response.AttendanceResponse;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/hr/attendance")
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceService attendanceService;
    private final EmployeeService employeeService;

    @PostMapping
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<AttendanceResponse> mark(@RequestBody AttendanceRequest req) {
        var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        // For employees, always resolve employee by token subject (username/email);
        // auto-create if missing
        String username = auth != null ? auth.getName() : null;
        Employee e = employeeService.findByEmail(username);
        if (e == null) {
            String first = username != null && username.contains("@") ? username.substring(0, username.indexOf('@'))
                    : (username != null ? username : "");
            e = employeeService.ensureByEmail(username, first, "", null, null, null, null, null);
        }
        Attendance a = Attendance.builder()
                .employee(e)
                .date(req.getDate())
                .present(req.getPresent())
                .workingHours(req.getWorkingHours())
                .build();
        Attendance saved = attendanceService.markAttendance(a);
        return ResponseEntity.ok(toResponse(saved));
    }

    @GetMapping("/{employeeId}")
    @PreAuthorize("hasAnyRole('ADMIN','HR','EMPLOYEE')")
    public ResponseEntity<List<AttendanceResponse>> byEmployee(@PathVariable Long employeeId) {

        var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getAuthorities().stream().anyMatch(a -> "ROLE_EMPLOYEE".equals(a.getAuthority()))) {
            // Employees can only view own attendance; resolve or create
            String username = auth.getName();
            Employee self = employeeService.findByEmail(username);
            if (self == null) {
                String first = username != null && username.contains("@") ? username.substring(0, username.indexOf('@'))
                        : (username != null ? username : "");
                self = employeeService.ensureByEmail(username, first, "", null, null, null, null, null);
            }
            employeeId = self.getId();
        }
        return ResponseEntity.ok(attendanceService.getByEmployee(employeeId).stream().map(this::toResponse)
                .collect(Collectors.toList()));

    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<List<AttendanceResponse>> mine() {
        var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        String username = auth != null ? auth.getName() : null;
        Employee self = employeeService.findByEmail(username);
        if (self == null) {
            String first = username != null && username.contains("@") ? username.substring(0, username.indexOf('@'))
                    : (username != null ? username : "");
            self = employeeService.ensureByEmail(username, first, "", null, null, null, null, null);
        }
        Long employeeId = self.getId();
        return ResponseEntity.ok(attendanceService.getByEmployee(employeeId).stream().map(this::toResponse)
                .collect(Collectors.toList()));
    }

    private AttendanceResponse toResponse(Attendance a) {
        return AttendanceResponse.builder()
                .id(a.getId())
                .employeeId(a.getEmployee() != null ? a.getEmployee().getId() : null)
                .date(a.getDate())
                .present(a.getPresent())
                .workingHours(a.getWorkingHours())
                .build();
    }
}