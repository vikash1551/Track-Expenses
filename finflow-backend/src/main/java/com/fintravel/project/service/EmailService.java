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
        message.setFrom("Track Expense <vikashkumar221005@gmail.com>");
        message.setTo(to);
        message.setSubject("Your Track Expense Security Code");
        message.setText("Your OTP is [ " + otp + " ]. It expires in 5 minutes.");
        
        mailSender.send(message);
        System.out.println("✅ OTP successfully sent to email: " + to);
    }
}
