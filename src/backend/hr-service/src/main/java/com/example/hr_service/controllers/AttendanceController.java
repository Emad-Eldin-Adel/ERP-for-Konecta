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
        Employee e = resolveOrCreateCurrentEmployee();
        Attendance a = Attendance.builder()
                .employee(e)
                .date(req.getDate())
                .present(req.getPresent())
                .workingHours(req.getWorkingHours())
                .checkInAt(req.getCheckInAt())
                .checkOutAt(req.getCheckOutAt())
                .build();
        Attendance saved = attendanceService.markAttendance(a);
        return ResponseEntity.ok(toResponse(saved));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','HR')")
    public ResponseEntity<List<AttendanceResponse>> list(@RequestParam(value = "search", required = false) String search) {
        return ResponseEntity.ok(attendanceService.searchAttendance(search).stream()
                .map(this::toResponse)
                .collect(Collectors.toList()));
    }

    @GetMapping("/{employeeId}")
    @PreAuthorize("hasAnyRole('ADMIN','HR','EMPLOYEE')")
    public ResponseEntity<List<AttendanceResponse>> byEmployee(@PathVariable Long employeeId) {

        var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getAuthorities().stream().anyMatch(a -> "ROLE_EMPLOYEE".equals(a.getAuthority()))) {
            employeeId = resolveOrCreateCurrentEmployee().getId();
        }
        return ResponseEntity.ok(attendanceService.getByEmployee(employeeId).stream().map(this::toResponse)
                .collect(Collectors.toList()));

    }

    @GetMapping(params = "email")
    @PreAuthorize("hasAnyRole('ADMIN','HR')")
    public ResponseEntity<List<AttendanceResponse>> byEmployeeEmail(@RequestParam String email) {
        return ResponseEntity.ok(attendanceService.getByEmployeeEmail(email).stream()
                .map(this::toResponse)
                .collect(Collectors.toList()));
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<List<AttendanceResponse>> mine() {
        Long employeeId = resolveOrCreateCurrentEmployee().getId();
        return ResponseEntity.ok(attendanceService.getByEmployee(employeeId).stream().map(this::toResponse)
                .collect(Collectors.toList()));
    }

    @PostMapping("/check-in")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<AttendanceResponse> checkIn() {
        Employee employee = resolveOrCreateCurrentEmployee();
        Attendance record = attendanceService.checkIn(employee);
        return ResponseEntity.ok(toResponse(record));
    }

    @PostMapping("/check-out")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<AttendanceResponse> checkOut() {
        Employee employee = resolveOrCreateCurrentEmployee();
        Attendance record = attendanceService.checkOut(employee);
        return ResponseEntity.ok(toResponse(record));
    }

    private AttendanceResponse toResponse(Attendance a) {
        Employee employee = a.getEmployee();
        String fullName = null;
        if (employee != null) {
            String first = employee.getFirstName() != null ? employee.getFirstName().trim() : "";
            String last = employee.getLastName() != null ? employee.getLastName().trim() : "";
            fullName = (first + " " + last).trim();
            if (fullName.isBlank()) {
                fullName = employee.getEmail();
            }
        }
        return AttendanceResponse.builder()
                .id(a.getId())
                .employeeId(employee != null ? employee.getId() : null)
                .employeeName(fullName)
                .employeeEmail(employee != null ? employee.getEmail() : null)
                .date(a.getDate())
                .present(a.getPresent())
                .workingHours(a.getWorkingHours())
                .checkInAt(a.getCheckInAt())
                .checkOutAt(a.getCheckOutAt())
                .build();
    }

    private Employee resolveOrCreateCurrentEmployee() {
        var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        String username = auth != null ? auth.getName() : null;
        Employee existing = employeeService.findByEmail(username);
        if (existing != null) {
            return existing;
        }
        String first = username != null && username.contains("@") ? username.substring(0, username.indexOf('@'))
                : (username != null ? username : "");
        return employeeService.ensureByEmail(username, first, "", null, null, null, null, null);
    }
}
