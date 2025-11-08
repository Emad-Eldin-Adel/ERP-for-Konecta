package com.example.hr_service.services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.example.hr_service.models.Job;
import com.example.hr_service.models.JobStatus;
import com.example.hr_service.repositories.JobRepository;
import java.util.List;

@Service
@RequiredArgsConstructor
public class JobService {
    private final JobRepository jobRepository;

    public List<Job> findAll() {
        return jobRepository.findAll();
    }

    public Job findById(Long id) {
        return jobRepository.findById(id).orElseThrow(() -> new RuntimeException("Job not found"));
    }

    public Job create(Job j) {
        return jobRepository.save(j);
    }

    public Job update(Long id, Job updated) {
        Job j = findById(id);
        j.setTitle(updated.getTitle());
        j.setDescription(updated.getDescription());
        j.setEmploymentType(updated.getEmploymentType());
        j.setLocation(updated.getLocation());
        j.setStatus(updated.getStatus());
        j.setDepartment(updated.getDepartment());
        return jobRepository.save(j);
    }

    public void delete(Long id) {
        jobRepository.deleteById(id);
    }

    public List<Job> findOpen() {
        return jobRepository.findByStatus(JobStatus.OPEN);
    }
}