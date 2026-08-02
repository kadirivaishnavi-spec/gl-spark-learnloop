package com.gl.learnloop.skill.repository;

import com.gl.learnloop.skill.entity.Skill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SkillRepository extends JpaRepository<Skill, Long> {

    List<Skill> findByUserId(Long userId);

    List<Skill> findByCategory(String category);

    List<Skill> findByLevel(String level);
}