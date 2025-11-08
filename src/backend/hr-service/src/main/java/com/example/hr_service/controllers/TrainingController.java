package com.example.hr_service.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.example.hr_service.dtos.request.TrainingRequest;
import com.example.hr_service.dtos.response.TrainingResponse;
import com.example.hr_service.dtos.response.TrainingEnrollmentResponse;
import com.example.hr_service.models.Training;
import com.example.hr_service.services.TrainingService;
import com.example.hr_service.services.TrainingEnrollmentService;
import com.example.hr_service.services.EmployeeService;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/hr/training")
@RequiredArgsConstructor
public class TrainingController {

    private final TrainingService trainingService;
    private final TrainingEnrollmentService enrollmentService;
    private final EmployeeService employeeService;

    @GetMapping
    public ResponseEntity<List<TrainingResponse>> list() {
        var list = trainingService.findAll().stream().map(this::toResponse).collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TrainingResponse> get(@PathVariable Long id) {
        return ResponseEntity.ok(toResponse(trainingService.findById(id)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','HR')")
    public ResponseEntity<TrainingResponse> create(@RequestBody TrainingRequest req) {
        var saved = trainingService.save(fromRequest(req));
        return ResponseEntity.ok(toResponse(saved));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','HR')")
    public ResponseEntity<TrainingResponse> update(@PathVariable Long id, @RequestBody TrainingRequest req) {
        var existing = trainingService.findById(id);
        existing.setTitle(req.getTitle());
        existing.setDescription(req.getDescription());
        existing.setStartDate(req.getStartDate());
        existing.setEndDate(req.getEndDate());
        existing.setInstructor(req.getInstructor());
        existing.setLocation(req.getLocation());
        var saved = trainingService.save(existing);
        return ResponseEntity.ok(toResponse(saved));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','HR')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        trainingService.delete(id);
        return ResponseEntity.noContent().build();
    }

    // --- Employee enrollment endpoints ---
    @PostMapping("/{id}/enroll")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<TrainingResponse> enroll(@PathVariable Long id) {
        var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        String username = auth != null ? auth.getName() : null;
        var employee = employeeService.findByEmail(username);
        if (employee == null) {
            String first = username != null && username.contains("@") ? username.substring(0, username.indexOf('@'))
                    : (username != null ? username : "");
            employee = employeeService.ensureByEmail(username, first, "", null, null, null, null, null);
        }
        var training = trainingService.findById(id);
        var enr = enrollmentService.enroll(employee, training);
        return ResponseEntity.ok(toEnrollmentResponse(enr.getId(), employee.getId(), training.getId()));
    }

    @GetMapping("/my-enrollments")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<List<TrainingResponse>> myEnrollments() {
        var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        String username = auth != null ? auth.getName() : null;
        var emp = employeeService.findByEmail(username);
        if (emp == null) {
            String first = username != null && username.contains("@") ? username.substring(0, username.indexOf('@'))
                    : (username != null ? username : "");
            emp = employeeService.ensureByEmail(username, first, "", null, null, null, null, null);
        }
        final var employeeId = emp.getId();
        var list = enrollmentService.findByEmployee(emp).stream()
                .map(en -> toEnrollmentResponse(en.getId(), employeeId, en.getTraining().getId()))
                .collect(java.util.stream.Collectors.toList());
        return ResponseEntity.ok(list);
    }

    // --- HR/Admin: list enrollments for a program ---
    @GetMapping("/{id}/enrollments")
    @PreAuthorize("hasAnyRole('ADMIN','HR')")
    public ResponseEntity<List<TrainingEnrollmentResponse>> listEnrollments(@PathVariable Long id) {
        var program = trainingService.findById(id);
        var list = enrollmentService.findByTraining(program).stream()
                .map(en -> TrainingEnrollmentResponse.builder()
                        .id(en.getId())
                        .programId(program.getId())
                        .programTitle(program.getTitle())
                        .employeeId(en.getEmployee() != null ? en.getEmployee().getId() : null)
                        .employeeName(en.getEmployee() != null
                                ? ((en.getEmployee().getFirstName() != null ? en.getEmployee().getFirstName() : "") +
                                        (en.getEmployee().getLastName() != null ? (" " + en.getEmployee().getLastName())
                                                : ""))
                                        .trim()
                                : null)
                        .employeeEmail(en.getEmployee() != null ? en.getEmployee().getEmail() : null)
                        .status(en.getStatus())
                        .enrolledAt(en.getEnrolledAt())
                        .build())
                .collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }

    private Training fromRequest(TrainingRequest r) {
        return Training.builder()
                .title(r.getTitle())
                .description(r.getDescription())
                .startDate(r.getStartDate())
                .endDate(r.getEndDate())
                .instructor(r.getInstructor())
                .location(r.getLocation())
                .build();
    }

    private TrainingResponse toResponse(Training t) {
        return TrainingResponse.builder()
                .id(t.getId())
                .type("PROGRAM")
                .title(t.getTitle())
                .description(t.getDescription())
                .startDate(t.getStartDate())
                .endDate(t.getEndDate())
                .instructor(t.getInstructor())
                .location(t.getLocation())
                .build();
    }

    private TrainingResponse toEnrollmentResponse(Long enrollmentId, Long employeeId, Long programId) {
        return TrainingResponse.builder()
                .id(enrollmentId)
                .type("NOMINATION")
                .employeeId(employeeId)
                .programId(programId)
                .build();
    }
}