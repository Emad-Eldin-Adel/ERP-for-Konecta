package com.example.hr_service.controllers;
import com.example.hr_service.models.Department;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.example.hr_service.dtos.request.JobRequest;
import com.example.hr_service.dtos.response.JobResponse;
import com.example.hr_service.models.Job;
import com.example.hr_service.models.JobStatus;
import com.example.hr_service.services.JobService;
import com.example.hr_service.services.DepartmentService;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/hr/jobs")
@RequiredArgsConstructor
public class JobController {

    private final JobService jobService;
    private final DepartmentService departmentService;

    @GetMapping
    public ResponseEntity<List<JobResponse>> list() {
        return ResponseEntity.ok(jobService.findAll().stream().map(this::toResponse).collect(Collectors.toList()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<JobResponse> get(@PathVariable Long id) {
        Job job = jobService.findById(id);
        return ResponseEntity.ok(toResponse(job));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','HR')")
    public ResponseEntity<JobResponse> create(@RequestBody JobRequest req) {
        Job j = fromRequest(req);
        if (j.getStatus() == null)
            j.setStatus(JobStatus.OPEN);
        return ResponseEntity.ok(toResponse(jobService.create(j)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','HR')")
    public ResponseEntity<JobResponse> update(@PathVariable Long id, @RequestBody JobRequest req) {
        Job updated = fromRequest(req);
        return ResponseEntity.ok(toResponse(jobService.update(id, updated)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','HR')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        jobService.delete(id);
        return ResponseEntity.noContent().build();
    }

    private Job fromRequest(JobRequest r) {
        Department dept = null;
        if (r.getDepartmentId() != null)
            dept = departmentService.findById(r.getDepartmentId());
        JobStatus status = null;
        if (r.getStatus() != null && !r.getStatus().isBlank()) {
            try {
                status = JobStatus.valueOf(r.getStatus().toUpperCase());
            } catch (Exception ignored) {
            }
        }
        return Job.builder()
                .title(r.getTitle())
                .description(r.getDescription())
                .department(dept)
                .location(r.getLocation())
                .employmentType(r.getEmploymentType())
                .status(status)
                .build();
    }

    private JobResponse toResponse(Job j) {
        return JobResponse.builder()
                .id(j.getId())
                .title(j.getTitle())
                .description(j.getDescription())
                .departmentId(j.getDepartment() != null ? j.getDepartment().getId() : null)
                .departmentName(j.getDepartment() != null ? j.getDepartment().getName() : null)
                .location(j.getLocation())
                .employmentType(j.getEmploymentType())
                .status(j.getStatus() != null ? j.getStatus().name() : null)
                .build();
    }
}