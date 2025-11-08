package com.example.hr_service.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.example.hr_service.dtos.request.OffboardingRequest;
import com.example.hr_service.dtos.response.OffboardingResponse;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/hr/offboarding")
@RequiredArgsConstructor
public class OffboardingController {

    private static final Map<Long, OffboardingResponse> STORE = new HashMap<>();

    @PostMapping("/initiate")
    @PreAuthorize("hasAnyRole('ADMIN','HR')")
    public ResponseEntity<OffboardingResponse> initiate(@RequestBody OffboardingRequest req) {
        OffboardingResponse res = OffboardingResponse.builder()
                .employeeId(req.getEmployeeId())
                .status("INITIATED")
                .lastWorkingDay(req.getLastWorkingDay())
                .build();
        STORE.put(req.getEmployeeId(), res);
        return ResponseEntity.ok(res);
    }

    @GetMapping("/{employeeId}")
    public ResponseEntity<OffboardingResponse> status(@PathVariable Long employeeId) {
        OffboardingResponse res = STORE.get(employeeId);
        if (res == null) {
            res = OffboardingResponse.builder().employeeId(employeeId).status("IN_PROGRESS").build();
        }
        return ResponseEntity.ok(res);
    }

    @PostMapping("/interview")
    @PreAuthorize("hasAnyRole('ADMIN','HR')")
    public ResponseEntity<OffboardingResponse> interview(@RequestBody OffboardingRequest req) {
        OffboardingResponse res = STORE.getOrDefault(req.getEmployeeId(),
                OffboardingResponse.builder().employeeId(req.getEmployeeId()).build());
        res.setInterviewAt(req.getInterviewAt() != null ? req.getInterviewAt() : LocalDateTime.now());
        res.setStatus("IN_PROGRESS");
        STORE.put(req.getEmployeeId(), res);
        return ResponseEntity.ok(res);
    }

    @PutMapping("/clearance")
    @PreAuthorize("hasAnyRole('ADMIN','HR')")
    public ResponseEntity<OffboardingResponse> clearance(@RequestBody OffboardingRequest req) {
        OffboardingResponse res = STORE.getOrDefault(req.getEmployeeId(),
                OffboardingResponse.builder().employeeId(req.getEmployeeId()).build());
        res.setStatus("CLEARED");
        res.setClearanceFormUrl("https://example.com/clearance/" + req.getEmployeeId());
        STORE.put(req.getEmployeeId(), res);
        return ResponseEntity.ok(res);
    }

    @PostMapping("/exit-documents")
    @PreAuthorize("hasAnyRole('ADMIN','HR')")
    public ResponseEntity<OffboardingResponse> exitDocuments(@RequestBody OffboardingRequest req) {
        OffboardingResponse res = STORE.getOrDefault(req.getEmployeeId(),
                OffboardingResponse.builder().employeeId(req.getEmployeeId()).build());
        res.setExperienceLetterUrl("https://example.com/experience/" + req.getEmployeeId());
        res.setStatus("COMPLETED");
        STORE.put(req.getEmployeeId(), res);
        return ResponseEntity.ok(res);
    }
}