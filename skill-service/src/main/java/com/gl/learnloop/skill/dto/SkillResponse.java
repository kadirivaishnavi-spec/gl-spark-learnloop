package com.gl.learnloop.skill.dto;

import com.gl.learnloop.skill.entity.Skill;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SkillResponse {

    private Long id;
    private String name;
    private String description;
    private String category;
    private String level;
    private Long userId;

    public SkillResponse(Skill skill) {
        this.id = skill.getId();
        this.name = skill.getName();
        this.description = skill.getDescription();
        this.category = skill.getCategory();
        this.level = skill.getLevel();
        this.userId = skill.getUserId();
    }
}