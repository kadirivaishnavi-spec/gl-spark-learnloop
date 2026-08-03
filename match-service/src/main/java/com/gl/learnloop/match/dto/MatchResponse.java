package com.gl.learnloop.match.dto;

import com.gl.learnloop.match.entity.Match;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MatchResponse {

    private Long id;
    private Long userId;
    private Long matchedUserId;
    private Long skillId;
    private String status;

    public MatchResponse(Match match) {

        this.id = match.getId();
        this.userId = match.getUserId();
        this.matchedUserId = match.getMatchedUserId();
        this.skillId = match.getSkillId();
        this.status = match.getStatus();
    }
}