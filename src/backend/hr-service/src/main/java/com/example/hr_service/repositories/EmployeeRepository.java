package com.example.hr_service.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.hr_service.models.Employee;

import java.util.Optional;

public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    Optional<Employee> findByEmail(String email);
}