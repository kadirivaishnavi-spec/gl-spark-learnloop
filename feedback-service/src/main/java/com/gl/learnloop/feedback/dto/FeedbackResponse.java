package com.gl.learnloop.feedback.dto;

import com.gl.learnloop.feedback.entity.Feedback;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class FeedbackResponse {

    private Long id;
    private Long userId;
    private Long matchId;
    private Integer rating;
    private String comment;

    public FeedbackResponse(Feedback feedback) {

        this.id = feedback.getId();
        this.userId = feedback.getUserId();
        this.matchId = feedback.getMatchId();
        this.rating = feedback.getRating();
        this.comment = feedback.getComment();
    }
}