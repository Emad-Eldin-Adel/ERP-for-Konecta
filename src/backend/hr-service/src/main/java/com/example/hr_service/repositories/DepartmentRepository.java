package com.example.hr_service.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.hr_service.models.Department;
public interface DepartmentRepository extends JpaRepository<Department, Long> {
}