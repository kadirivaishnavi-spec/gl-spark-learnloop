package com.gl.learnloop.learning.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MatchRequest {

    private Long userId;
    private Long matchedUserId;
    private Long skillId;
    private Long learningRequestId;
}