package com.fintravel.project.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    private String role; // e.g., ROLE_USER, ROLE_ADMIN

    private LocalDateTime createdAt;
    // --- New OTP Fields ---
   
    private String otp;
    
    private LocalDateTime otpExpiry;
    
    // Removed nullable=false and changed to object Boolean to prevent DB crashes on old rows
    @Column(columnDefinition = "boolean default false")
    private Boolean isEmailVerified = false;
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}