package com.gl.learnloop.match.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LearningRequestResponse {

    private Long id;

    private Long learnerId;

    private String message;

    private Long skillId;

    private String status;
}