package com.example.hr_service.models;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "performance")
public class Performance {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Integer rating;
    private String feedback;
    private LocalDate reviewDate;

    @ManyToOne
    @JoinColumn(name = "employee_id")
    private Employee employee;
}
