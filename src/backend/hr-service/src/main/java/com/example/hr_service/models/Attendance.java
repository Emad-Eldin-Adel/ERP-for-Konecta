package com.example.hr_service.models;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "attendance")
public class Attendance {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDate date;
    private Boolean present;
    private Double workingHours;
    private LocalDateTime checkInAt;
    private LocalDateTime checkOutAt;

    @ManyToOne
    @JoinColumn(name = "employee_id")
    private Employee employee;
}
