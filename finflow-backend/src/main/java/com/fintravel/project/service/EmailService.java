package com.fintravel.project.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import java.util.Random;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    // Generates a random 6-digit string
    public String generateOtp() {
        Random random = new Random();
        int otp = 100000 + random.nextInt(900000);
        return String.valueOf(otp);
    }

    // Sends an email via SMTP
    public void sendOtpEmail(String to, String otp) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Your FinFlow Security Code");
        message.setText("Your OTP is [ " + otp + " ]. It expires in 5 minutes.");
        
        try {
            mailSender.send(message);
            System.out.println("✅ OTP successfully sent to email: " + to);
        } catch (Exception e) {
            System.err.println("❌ Failed to send OTP to email: " + to);
            e.printStackTrace();
        }
    }
}
