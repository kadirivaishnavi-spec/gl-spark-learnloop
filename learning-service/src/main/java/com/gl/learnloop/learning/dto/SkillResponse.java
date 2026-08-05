package com.gl.learnloop.learning.dto;

import lombok.Data;

@Data
public class SkillResponse {

    private Long id;
    private String name;
    private String category;
    private String level;
    private String description;
    private Long userId;
}