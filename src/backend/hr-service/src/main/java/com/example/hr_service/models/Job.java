package com.example.hr_service.models;

import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "jobs")
public class Job {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(length = 2000)
    private String description;

    private String location;
    private String employmentType; // Full-time, Part-time, Contract

    @Enumerated(EnumType.STRING)
    private JobStatus status; // OPEN, CLOSED, DRAFT

    @ManyToOne
    @JoinColumn(name = "department_id")
    private Department department;
}