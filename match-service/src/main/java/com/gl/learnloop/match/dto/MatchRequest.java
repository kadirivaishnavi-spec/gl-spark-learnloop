package com.gl.learnloop.match.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MatchRequest {

    @NotNull(message = "User ID is required")
    private Long userId;

    @NotNull(message = "Matched user ID is required")
    private Long matchedUserId;

    @NotNull(message = "Skill ID is required")
    private Long skillId;

    @NotNull(message = "Learning Request ID is required")
    private Long learningRequestId;
}