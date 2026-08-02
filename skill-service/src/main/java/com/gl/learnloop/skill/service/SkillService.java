package com.gl.learnloop.skill.service;

import com.gl.learnloop.skill.dto.SkillRequest;
import com.gl.learnloop.skill.entity.Skill;
import com.gl.learnloop.skill.repository.SkillRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SkillService {

    private final SkillRepository skillRepository;

    public SkillService(SkillRepository skillRepository) {
        this.skillRepository = skillRepository;
    }

    public Skill createSkill(SkillRequest request) {

        Skill skill = new Skill();

        skill.setName(request.getName());
        skill.setDescription(request.getDescription());
        skill.setCategory(request.getCategory());
        skill.setLevel(request.getLevel());
        skill.setUserId(request.getUserId());

        return skillRepository.save(skill);
    }

    public List<Skill> getAllSkills() {
        return skillRepository.findAll();
    }

    public Skill getSkillById(Long id) {

        return skillRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Skill not found"));
    }

    public List<Skill> getSkillsByUserId(Long userId) {
        return skillRepository.findByUserId(userId);
    }

    public List<Skill> getSkillsByCategory(String category) {
        return skillRepository.findByCategory(category);
    }

    public List<Skill> getSkillsByLevel(String level) {
        return skillRepository.findByLevel(level);
    }

    public Skill updateSkill(Long id, SkillRequest request) {

        Skill skill = getSkillById(id);

        skill.setName(request.getName());
        skill.setDescription(request.getDescription());
        skill.setCategory(request.getCategory());
        skill.setLevel(request.getLevel());
        skill.setUserId(request.getUserId());

        return skillRepository.save(skill);
    }

    public void deleteSkill(Long id) {

        if (!skillRepository.existsById(id)) {
            throw new RuntimeException("Skill not found");
        }

        skillRepository.deleteById(id);
    }
}