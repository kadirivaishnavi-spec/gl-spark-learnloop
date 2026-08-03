package com.gl.learnloop.learning.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LearningRequestDTO {

    @NotNull(message = "Learner ID is required")
    private Long learnerId;

    @NotNull(message = "Skill ID is required")
    private Long skillId;

    @NotBlank(message = "Message is required")
    private String message;
}