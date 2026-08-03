package com.gl.learnloop.learning.repository;

import com.gl.learnloop.learning.entity.LearningRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LearningRequestRepository
        extends JpaRepository<LearningRequest, Long> {

    List<LearningRequest> findByLearnerId(Long learnerId);

    List<LearningRequest> findBySkillId(Long skillId);

    List<LearningRequest> findByStatus(String status);
}

