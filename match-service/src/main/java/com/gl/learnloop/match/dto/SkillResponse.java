package com.gl.learnloop.match.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SkillResponse {

    private Long id;

    private String name;

    private String level;

    private String category;

    private String description;

    private Long userId;
}