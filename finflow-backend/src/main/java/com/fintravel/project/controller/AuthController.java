package com.fintravel.project.controller;

import com.fintravel.project.entity.User;
import com.fintravel.project.repository.UserRepository;
import com.fintravel.project.repository.ExpenseRepository;
import com.fintravel.project.repository.BudgetRepository;
import com.fintravel.project.security.JwtUtils;
import com.fintravel.project.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;
import org.springframework.security.core.context.SecurityContextHolder;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ExpenseRepository expenseRepository;

    @Autowired
    private BudgetRepository budgetRepository;

    @Autowired
    private BCryptPasswordEncoder encoder;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private EmailService emailService;

    // --- REGISTRATION FLOW ---

    // Step 1: Register and Send OTP
    @PostMapping("/register")
    public String register(@RequestBody User user) {
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            return "Email already registered!";
        }

        user.setPassword(encoder.encode(user.getPassword()));
        user.setRole("ROLE_USER");
       user.setIsEmailVerified(false);
        
        // Generate and set OTP
        String otp = emailService.generateOtp();
        user.setOtp(otp);
        user.setOtpExpiry(LocalDateTime.now().plusMinutes(5));
        
        userRepository.save(user);
        emailService.sendOtpEmail(user.getEmail(), otp);
        
        return "Account created! Please check your email for the OTP to verify your account.";
    }

    // Step 2: Verify Account OTP
    @PostMapping("/verify-account")
    public String verifyAccount(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String otp = request.get("otp");

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getOtp() != null && user.getOtp().equals(otp) && user.getOtpExpiry().isAfter(LocalDateTime.now())) {
            user.setIsEmailVerified(true);
            user.setOtp(null); // Clear OTP after use
            user.setOtpExpiry(null);
            userRepository.save(user);
            return "Email verified successfully! You can now log in.";
        }
        return "Invalid or expired OTP.";
    }

    // --- LOGIN FLOW ---

    // Step 1: Verify Password and Send OTP
    @PostMapping("/login")
    public String login(@RequestBody Map<String, String> request) {
        User user = userRepository.findByEmail(request.get("email"))
                .orElseThrow(() -> new RuntimeException("User not found"));

      // Replace the old check with this safe check
        if (user.getIsEmailVerified() == null || !user.getIsEmailVerified()) {
            return "Please verify your email first!";
        }
        if (encoder.matches(request.get("password"), user.getPassword())) {
            // Password is correct, now send OTP for 2FA
            String otp = emailService.generateOtp();
            user.setOtp(otp);
            user.setOtpExpiry(LocalDateTime.now().plusMinutes(5));
            userRepository.save(user);
            
            emailService.sendOtpEmail(user.getEmail(), otp);
            return "Password correct. Please check your email for the 2FA login OTP.";
        }
        return "Invalid Credentials";
    }

    // Step 2: Verify Login OTP and issue JWT
    @PostMapping("/verify-login")
    public String verifyLogin(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String otp = request.get("otp");

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getOtp() != null && user.getOtp().equals(otp) && user.getOtpExpiry().isAfter(LocalDateTime.now())) {
            user.setOtp(null); // Clear OTP so it can't be reused
            user.setOtpExpiry(null);
            userRepository.save(user);
            
            // Issue the digital ID card!
            return jwtUtils.generateToken(user.getEmail());
        }
        return "Invalid or expired OTP.";
    }

    @GetMapping("/me")
    public User getMe() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof User) {
            return (User) principal;
        }
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
    }

    @DeleteMapping("/me")
    public String deleteMe() {
        User user = getMe();
        
        // 1. Delete associated expenses
        expenseRepository.deleteAll(expenseRepository.findByUserId(user.getId()));
        
        // 2. Delete associated budgets
        budgetRepository.deleteAll(budgetRepository.findByUserId(user.getId()));
        
        // 3. Delete the user
        userRepository.delete(user);
        
        return "Account successfully deleted.";
    }

    @GetMapping("/user-count")
    public Map<String, Long> getUserCount() {
        long count = userRepository.count();
        return Map.of("count", count);
    }
}