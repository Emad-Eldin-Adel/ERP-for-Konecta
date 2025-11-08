package com.example.hr_service.services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import com.example.hr_service.models.Employee;
import com.example.hr_service.models.Training;
import com.example.hr_service.models.TrainingEnrollment;
import com.example.hr_service.repositories.TrainingEnrollmentRepository;
@Service
@RequiredArgsConstructor
public class TrainingEnrollmentService {
    private final TrainingEnrollmentRepository repo;

    public TrainingEnrollment enroll(Employee employee, Training training) {
        return repo.findByEmployeeAndTraining(employee, training)
                .orElseGet(() -> repo.save(TrainingEnrollment.builder()
                        .employee(employee)
                        .training(training)
                        .status("ENROLLED")
                        .enrolledAt(LocalDateTime.now())
                        .build()));
    }

    public List<TrainingEnrollment> findByEmployee(Employee e) {
        return repo.findByEmployee(e);
    }

    public List<TrainingEnrollment> findByTraining(Training t) {
        return repo.findByTraining(t);
    }
}