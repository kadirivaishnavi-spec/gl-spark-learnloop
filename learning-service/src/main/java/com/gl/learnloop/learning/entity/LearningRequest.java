package com.gl.learnloop.learning.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "learning_requests")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class LearningRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long learnerId;

    @Column(nullable = false)
    private Long skillId;

    @Column(nullable = false)
    private String status;

    @Column(length = 500)
    private String message;
}