package com.example.hr_service.models;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "training_enrollment", uniqueConstraints = @UniqueConstraint(columnNames = { "employee_id",
        "training_id" }))
public class TrainingEnrollment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "employee_id")
    private Employee employee;

    @ManyToOne(optional = false)
    @JoinColumn(name = "training_id")
    private Training training;

    @Column(nullable = false)
    private String status; // ENROLLED | CANCELED | COMPLETED (future)

    @Column(nullable = false)
    private LocalDateTime enrolledAt;
}