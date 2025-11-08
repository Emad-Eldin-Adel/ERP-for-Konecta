package com.example.hr_service.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.hr_service.models.TrainingEnrollment;
import com.example.hr_service.models.Employee;
import com.example.hr_service.models.Training;

import java.util.List;
import java.util.Optional;

public interface TrainingEnrollmentRepository extends JpaRepository<TrainingEnrollment, Long> {
    List<TrainingEnrollment> findByEmployee(Employee employee);

    List<TrainingEnrollment> findByTraining(Training training);

    boolean existsByEmployeeAndTraining(Employee employee, Training training);

    Optional<TrainingEnrollment> findByEmployeeAndTraining(Employee employee, Training training);
}