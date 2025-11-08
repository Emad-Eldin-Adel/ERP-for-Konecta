package com.example.hr_service.services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.example.hr_service.models.Department;
import com.example.hr_service.repositories.DepartmentRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DepartmentService {
    private final DepartmentRepository departmentRepository;

    public List<Department> findAll() {
        return departmentRepository.findAll();
    }

    public Department findById(Long id) {
        return departmentRepository.findById(id).orElseThrow(() -> new RuntimeException("Department not found"));
    }

    public Department create(Department dept) {
        return departmentRepository.save(dept);
    }

    public Department update(Long id, Department updated) {
        Department d = findById(id);
        d.setName(updated.getName());
        d.setDescription(updated.getDescription());
        return departmentRepository.save(d);
    }

    public void delete(Long id) {
        departmentRepository.deleteById(id);
    }
}