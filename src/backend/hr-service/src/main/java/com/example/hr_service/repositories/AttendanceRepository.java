package com.example.hr_service.repositories;

import com.example.hr_service.models.Attendance;
import com.example.hr_service.models.Employee;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    List<Attendance> findByEmployee(Employee employee);
}