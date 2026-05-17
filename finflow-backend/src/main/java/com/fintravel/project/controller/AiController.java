package com.fintravel.project.controller;

import com.fintravel.project.entity.User;
import com.fintravel.project.service.AiAdvisorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    @Autowired
    private AiAdvisorService aiAdvisorService;

    @GetMapping("/insights")
    public String getInsights(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        return aiAdvisorService.generateInsights(user.getId());
    }
}
