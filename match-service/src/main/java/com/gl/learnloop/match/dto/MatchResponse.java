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

    private Long learningRequestId;

    private Long matchedLearningRequestId;

    private String status;

    private String matchedUserEmail;

    public MatchResponse(Match match) {

        this.id = match.getId();
        this.userId = match.getUserId();
        this.matchedUserId = match.getMatchedUserId();
        this.skillId = match.getSkillId();
        this.learningRequestId = match.getLearningRequestId();
        this.matchedLearningRequestId =
                match.getMatchedLearningRequestId();
        this.status = match.getStatus();
    }

    /**
     * Creates a response from the perspective of the
     * currently logged-in user.
     */
    public MatchResponse(
            Match match,
            Long requestedUserId) {

        this.id = match.getId();

        /*
         * Keep the database relationship as-is.
         */
        this.userId = match.getUserId();
        this.matchedUserId = match.getMatchedUserId();

        this.skillId = match.getSkillId();
        this.learningRequestId =
                match.getLearningRequestId();

        this.matchedLearningRequestId =
                match.getMatchedLearningRequestId();

        this.status = match.getStatus();
    }
}