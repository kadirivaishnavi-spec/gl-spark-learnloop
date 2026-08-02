package com.gl.learnloop.skill.controller;

import com.gl.learnloop.skill.dto.SkillRequest;
import com.gl.learnloop.skill.dto.SkillResponse;
import com.gl.learnloop.skill.entity.Skill;
import com.gl.learnloop.skill.service.SkillService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/skills")
public class SkillController {

    private final SkillService skillService;

    public SkillController(SkillService skillService) {
        this.skillService = skillService;
    }

    // Create Skill
    @PostMapping
    public ResponseEntity<SkillResponse> createSkill(
            @Valid @RequestBody SkillRequest request) {

        Skill skill = skillService.createSkill(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(new SkillResponse(skill));
    }

    // Get all Skills
    @GetMapping
    public ResponseEntity<List<SkillResponse>> getAllSkills() {

        List<SkillResponse> skills = skillService.getAllSkills()
                .stream()
                .map(SkillResponse::new)
                .toList();

        return ResponseEntity.ok(skills);
    }

    // Get Skill by ID
    @GetMapping("/{id}")
    public ResponseEntity<SkillResponse> getSkillById(
            @PathVariable Long id) {

        Skill skill = skillService.getSkillById(id);

        return ResponseEntity.ok(new SkillResponse(skill));
    }

    // Get Skills by User ID
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<SkillResponse>> getSkillsByUserId(
            @PathVariable Long userId) {

        List<SkillResponse> skills = skillService
                .getSkillsByUserId(userId)
                .stream()
                .map(SkillResponse::new)
                .toList();

        return ResponseEntity.ok(skills);
    }

    // Get Skills by Category
    @GetMapping("/category/{category}")
    public ResponseEntity<List<SkillResponse>> getSkillsByCategory(
            @PathVariable String category) {

        List<SkillResponse> skills = skillService
                .getSkillsByCategory(category)
                .stream()
                .map(SkillResponse::new)
                .toList();

        return ResponseEntity.ok(skills);
    }

    // Get Skills by Level
    @GetMapping("/level/{level}")
    public ResponseEntity<List<SkillResponse>> getSkillsByLevel(
            @PathVariable String level) {

        List<SkillResponse> skills = skillService
                .getSkillsByLevel(level)
                .stream()
                .map(SkillResponse::new)
                .toList();

        return ResponseEntity.ok(skills);
    }

    // Update Skill
    @PutMapping("/{id}")
    public ResponseEntity<SkillResponse> updateSkill(
            @PathVariable Long id,
            @Valid @RequestBody SkillRequest request) {

        Skill skill = skillService.updateSkill(id, request);

        return ResponseEntity.ok(new SkillResponse(skill));
    }

    // Delete Skill
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSkill(
            @PathVariable Long id) {

        skillService.deleteSkill(id);

        return ResponseEntity.noContent().build();
    }
}