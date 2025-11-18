package com.example.hr_service.services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.example.hr_service.models.LeaveRequest;
import com.example.hr_service.models.Employee;
import com.example.hr_service.models.LeaveStatus;
import com.example.hr_service.models.LeaveType;
import com.example.hr_service.repositories.LeaveRequestRepository;
import com.example.hr_service.repositories.EmployeeRepository;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LeaveService {
    private final LeaveRequestRepository leaveRepository;
    private final EmployeeRepository employeeRepository;

    public LeaveRequest create(LeaveRequest request) {
        request.setStatus(LeaveStatus.PENDING);
        if (request.getLeaveType() == null) {
            request.setLeaveType(LeaveType.VACATION);
        }
        return leaveRepository.save(request);
    }

    public List<LeaveRequest> getByEmployee(Long employeeId) {
        Employee e = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));
        return leaveRepository.findByEmployee(e);
    }

    public List<LeaveRequest> listAll() {
        return leaveRepository.findAll();
    }

    public LeaveRequest approve(Long id) {
        LeaveRequest r = leaveRepository.findById(id).orElseThrow(() -> new RuntimeException("Leave not found"));
        r.setStatus(LeaveStatus.APPROVED);
        return leaveRepository.save(r);
    }

    public LeaveRequest reject(Long id) {
        LeaveRequest r = leaveRepository.findById(id).orElseThrow(() -> new RuntimeException("Leave not found"));
        r.setStatus(LeaveStatus.REJECTED);
        return leaveRepository.save(r);
    }
}
