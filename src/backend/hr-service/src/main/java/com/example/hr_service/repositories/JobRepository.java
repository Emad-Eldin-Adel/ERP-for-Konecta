package com.example.hr_service.repositories;


import org.springframework.data.jpa.repository.JpaRepository;

import com.example.hr_service.models.Job;
import com.example.hr_service.models.JobStatus;

import java.util.List;

public interface JobRepository extends JpaRepository<Job, Long> {
    List<Job> findByStatus(JobStatus status);
}