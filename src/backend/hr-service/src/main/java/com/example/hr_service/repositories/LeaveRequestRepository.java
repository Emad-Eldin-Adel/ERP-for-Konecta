package com.example.hr_service.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.hr_service.models.LeaveRequest;
import com.example.hr_service.models.Employee;
import java.util.List;

public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, Long> {
    List<LeaveRequest> findByEmployee(Employee employee);
}