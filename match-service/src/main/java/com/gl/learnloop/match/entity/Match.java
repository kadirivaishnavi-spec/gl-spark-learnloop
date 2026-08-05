package com.gl.learnloop.match.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "matches")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Match {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * User who created the original learning request.
     */
    @Column(nullable = false)
    private Long userId;

    /**
     * Owner of the skill requested by userId.
     */
    @Column(nullable = false)
    private Long matchedUserId;

    /**
     * Skill requested by userId.
     */
    @Column(nullable = false)
    private Long skillId;

    /**
     * Original learning request.
     */
    @Column(nullable = false)
    private Long learningRequestId;

    /**
     * Reciprocal learning request created by matchedUserId.
     */
    @Column
    private Long matchedLearningRequestId;

    /**
     * PENDING / ACCEPTED / REJECTED / COMPLETED
     */
    @Column(nullable = false)
    private String status;
}