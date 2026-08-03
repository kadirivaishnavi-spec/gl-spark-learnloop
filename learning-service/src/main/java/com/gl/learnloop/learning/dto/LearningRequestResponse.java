package com.gl.learnloop.learning.dto;

import com.gl.learnloop.learning.entity.LearningRequest;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LearningRequestResponse {

    private Long id;
    private Long learnerId;
    private Long skillId;
    private String status;
    private String message;

    public LearningRequestResponse(LearningRequest request) {
        this.id = request.getId();
        this.learnerId = request.getLearnerId();
        this.skillId = request.getSkillId();
        this.status = request.getStatus();
        this.message = request.getMessage();
    }
}