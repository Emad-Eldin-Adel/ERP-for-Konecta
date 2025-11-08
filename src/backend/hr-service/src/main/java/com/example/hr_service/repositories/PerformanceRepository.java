package com.example.hr_service.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.hr_service.models.Performance;
import com.example.hr_service.models.Employee;
import java.util.List;

public interface PerformanceRepository extends JpaRepository<Performance, Long> {
    List<Performance> findByEmployee(Employee employee);
}