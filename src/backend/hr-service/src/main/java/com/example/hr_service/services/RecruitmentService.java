package com.example.hr_service.services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.example.hr_service.models.Recruitment;
import com.example.hr_service.repositories.RecruitmentRepository;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RecruitmentService {
    private final RecruitmentRepository repo;

    public Recruitment save(Recruitment r) {
        return repo.save(r);
    }

    public Recruitment findById(Long id) {
        return repo.findById(id).orElse(null);
    }

    public List<Recruitment> findAll() {
        return repo.findAll();
    }

    public List<Recruitment> findJobs() {
        return repo.findByType("JOB");
    }

    public void delete(Long id) {
        repo.deleteById(id);
    }
}