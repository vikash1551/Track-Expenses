package com.fintravel.project;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import jakarta.annotation.PostConstruct;

@SpringBootApplication
public class ProjectApplication {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    public static void main(String[] args) {
        SpringApplication.run(ProjectApplication.class, args);
    }

    @PostConstruct
    public void fixAutoIncrement() {
        try {
            jdbcTemplate.execute("ALTER TABLE users MODIFY id BIGINT AUTO_INCREMENT");
            jdbcTemplate.execute("ALTER TABLE expenses MODIFY id BIGINT AUTO_INCREMENT");
            jdbcTemplate.execute("ALTER TABLE budgets MODIFY id BIGINT AUTO_INCREMENT");
            System.out.println("✅ Fixed AUTO_INCREMENT for tables");
        } catch (Exception e) {
            System.out.println("⚠️ AUTO_INCREMENT check: " + e.getMessage());
        }
    }
}
