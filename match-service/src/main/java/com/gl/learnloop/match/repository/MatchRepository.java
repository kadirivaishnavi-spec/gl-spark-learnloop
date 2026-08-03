package com.gl.learnloop.match.repository;

import com.gl.learnloop.match.entity.Match;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MatchRepository extends JpaRepository<Match, Long> {

    List<Match> findByUserId(Long userId);

    List<Match> findByMatchedUserId(Long matchedUserId);

    List<Match> findBySkillId(Long skillId);

    List<Match> findByStatus(String status);

    boolean existsByUserIdAndMatchedUserIdAndSkillId(
            Long userId,
            Long matchedUserId,
            Long skillId
    );
}