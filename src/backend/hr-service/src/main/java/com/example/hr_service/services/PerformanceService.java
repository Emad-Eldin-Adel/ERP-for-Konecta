package com.example.hr_service.services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.example.hr_service.models.Performance;
import com.example.hr_service.models.Employee;
import com.example.hr_service.repositories.PerformanceRepository;
import com.example.hr_service.repositories.EmployeeRepository;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PerformanceService {
    private final PerformanceRepository performanceRepository;
    private final EmployeeRepository employeeRepository;

    public Performance create(Performance p) {
        return performanceRepository.save(p);
    }

    public List<Performance> getByEmployee(Long employeeId) {
        Employee e = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));
        return performanceRepository.findByEmployee(e);
    }
}