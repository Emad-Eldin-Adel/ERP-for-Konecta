package com.example.hr_service.repositories;

import com.example.hr_service.models.Recruitment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RecruitmentRepository extends JpaRepository<Recruitment, Long> {
    List<Recruitment> findByType(String type);
}