package com.example.hr_service.services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.example.hr_service.models.Employee;
import com.example.hr_service.models.Department;
import com.example.hr_service.repositories.EmployeeRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EmployeeService {
    private final EmployeeRepository employeeRepository;

    public List<Employee> findAll() {
        return employeeRepository.findAll();
    }

    public Employee findById(Long id) {
        return employeeRepository.findById(id).orElseThrow(() -> new RuntimeException("Employee not found"));
    }

    public Employee findByEmail(String email) {
        if (email == null || email.isBlank())
            return null;
        return employeeRepository.findByEmailIgnoreCase(email).orElse(null);
    }

    public Employee create(Employee employee) {
        return employeeRepository.save(employee);
    }

    public Employee update(Long id, Employee updated) {
        Employee emp = findById(id);
        emp.setFirstName(updated.getFirstName());
        emp.setLastName(updated.getLastName());
        emp.setEmail(updated.getEmail());
        emp.setPhone(updated.getPhone());
        emp.setPosition(updated.getPosition());
        emp.setHireDate(updated.getHireDate());
        emp.setSalary(updated.getSalary());
        emp.setDepartment(updated.getDepartment());
        return employeeRepository.save(emp);
    }

    public void delete(Long id) {
        employeeRepository.deleteById(id);
    }

    public Employee ensureByEmail(String email, String firstName, String lastName, String phone, String position,
            Department dept, Double salary, Double workingHours) {
        return employeeRepository.findByEmailIgnoreCase(email)
                .map(existing -> {
                    // Update basic fields if provided; keep existing otherwise
                    if (firstName != null && !firstName.isBlank())
                        existing.setFirstName(firstName);
                    if (lastName != null && !lastName.isBlank())
                        existing.setLastName(lastName);
                    if (phone != null && !phone.isBlank())
                        existing.setPhone(phone);
                    if (position != null && !position.isBlank())
                        existing.setPosition(position);
                    if (dept != null)
                        existing.setDepartment(dept);
                    if (salary != null)
                        existing.setSalary(salary);
                    if (workingHours != null)
                        existing.setWorkingHours(workingHours);
                    return employeeRepository.save(existing);
                })
                .orElseGet(() -> employeeRepository.save(
                        Employee.builder()
                                .email(email)
                                .firstName(firstName)
                                .lastName(lastName)
                                .phone(phone)
                                .position(position)
                                .salary(salary)
                                .workingHours(workingHours)
                                .department(dept)
                                .build()));
    }
}
