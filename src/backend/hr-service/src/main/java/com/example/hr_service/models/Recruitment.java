package com.example.hr_service.models;

import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "recruitment")
public class Recruitment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String type; // JOB, APPLICATION, INTERVIEW, OFFER
    private String title;
    private Long departmentId;
    @Column(length = 1000)
    private String description;
    private String location;
    private String employmentType;
    private Long jobId;
    private String fullName;
    private String email;
    private String phone;
    private String status;
}