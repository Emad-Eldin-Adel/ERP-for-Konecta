package com.example.hr_service.services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.example.hr_service.models.Attendance;
import com.example.hr_service.models.Employee;
import com.example.hr_service.repositories.AttendanceRepository;
import com.example.hr_service.repositories.EmployeeRepository;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class AttendanceService {
    private final AttendanceRepository attendanceRepository;
    private final EmployeeRepository employeeRepository;

    public Attendance markAttendance(Attendance attendance) {
        return attendanceRepository.save(attendance);
    }

    public List<Attendance> getByEmployee(Long employeeId) {
        Employee e = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));
        return attendanceRepository.findByEmployee(e);
    }

    public List<Attendance> getByEmployeeEmail(String email) {
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("Employee email is required");
        }
        Employee employee = employeeRepository.findByEmailIgnoreCase(email.trim())
                .orElseThrow(() -> new RuntimeException("Employee not found"));
        return attendanceRepository.findByEmployee(employee);
    }

    public List<Attendance> searchAttendance(String query) {
        if (query == null || query.isBlank()) {
            return attendanceRepository.findAllByOrderByDateDesc();
        }
        String term = query.trim();
        Set<Long> seenEmployees = new LinkedHashSet<>();
        List<Attendance> records = new ArrayList<>();

        if (term.matches("\\d+")) {
            Long id = Long.parseLong(term);
            employeeRepository.findById(id).ifPresent(employee -> collectAttendance(employee, seenEmployees, records));
        }

        employeeRepository.findByEmailIgnoreCase(term)
                .ifPresent(employee -> collectAttendance(employee, seenEmployees, records));

        employeeRepository
                .findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCaseOrEmailContainingIgnoreCase(term, term,
                        term)
                .forEach(employee -> collectAttendance(employee, seenEmployees, records));

        records.sort(Comparator.comparing(Attendance::getDate).reversed());
        return records;
    }

    private void collectAttendance(Employee employee, Set<Long> seenEmployees, List<Attendance> container) {
        if (employee == null) {
            return;
        }
        Long id = employee.getId();
        if (id != null && !seenEmployees.add(id)) {
            return;
        }
        container.addAll(attendanceRepository.findByEmployee(employee));
    }

    public Attendance checkIn(Employee employee) {
        LocalDate today = LocalDate.now();
        Attendance record = attendanceRepository.findByEmployeeAndDate(employee, today)
                .orElseGet(() -> Attendance.builder()
                        .employee(employee)
                        .date(today)
                        .present(true)
                        .build());
        if (record.getCheckInAt() == null) {
            record.setCheckInAt(LocalDateTime.now());
        }
        record.setPresent(true);
        return attendanceRepository.save(record);
    }

    public Attendance checkOut(Employee employee) {
        LocalDate today = LocalDate.now();
        Attendance record = attendanceRepository.findByEmployeeAndDate(employee, today)
                .orElseGet(() -> Attendance.builder()
                        .employee(employee)
                        .date(today)
                        .present(true)
                        .build());
        if (record.getCheckOutAt() == null) {
            record.setCheckOutAt(LocalDateTime.now());
        } else {
            record.setCheckOutAt(LocalDateTime.now());
        }

        if (record.getCheckInAt() != null && record.getCheckOutAt() != null) {
            double hours = Duration.between(record.getCheckInAt(), record.getCheckOutAt()).toMinutes() / 60d;
            record.setWorkingHours(Math.max(0, Math.round(hours * 100.0) / 100.0));
        }
        record.setPresent(true);
        return attendanceRepository.save(record);
    }
}
