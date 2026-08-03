package com.gl.learnloop.feedback.repository;

import com.gl.learnloop.feedback.entity.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FeedbackRepository
        extends JpaRepository<Feedback, Long> {

    List<Feedback> findByUserId(Long userId);

    List<Feedback> findByMatchId(Long matchId);
}
