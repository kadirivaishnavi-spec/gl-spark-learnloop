package com.gl.learnloop.feedback.service;

import com.gl.learnloop.feedback.client.MatchFeignClient;
import com.gl.learnloop.feedback.client.UserFeignClient;
import com.gl.learnloop.feedback.dto.FeedbackRequest;
import com.gl.learnloop.feedback.entity.Feedback;
import com.gl.learnloop.feedback.repository.FeedbackRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FeedbackService {

    private final FeedbackRepository feedbackRepository;
    private final UserFeignClient userFeignClient;
    private final MatchFeignClient matchFeignClient;

    public FeedbackService(
            FeedbackRepository feedbackRepository,
            UserFeignClient userFeignClient,
            MatchFeignClient matchFeignClient) {

        this.feedbackRepository = feedbackRepository;
        this.userFeignClient = userFeignClient;
        this.matchFeignClient = matchFeignClient;
    }

    // Create Feedback
    public Feedback createFeedback(FeedbackRequest request) {

        // Check if user exists
        try {
            userFeignClient.getUserById(request.getUserId());
        } catch (Exception e) {
            throw new RuntimeException("User not found");
        }

        // Check if match exists
        try {
            matchFeignClient.getMatchById(request.getMatchId());
        } catch (Exception e) {
            throw new RuntimeException("Match not found");
        }

        Feedback feedback = new Feedback();

        feedback.setUserId(request.getUserId());
        feedback.setMatchId(request.getMatchId());
        feedback.setRating(request.getRating());
        feedback.setComment(request.getComment());

        return feedbackRepository.save(feedback);
    }

    // Get all Feedback
    public List<Feedback> getAllFeedback() {

        return feedbackRepository.findAll();
    }

    // Get Feedback by ID
    public Feedback getFeedbackById(Long id) {

        return feedbackRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Feedback not found"));
    }

    // Get Feedback by User ID
    public List<Feedback> getFeedbackByUserId(Long userId) {

        return feedbackRepository.findByUserId(userId);
    }

    // Get Feedback by Match ID
    public List<Feedback> getFeedbackByMatchId(Long matchId) {

        return feedbackRepository.findByMatchId(matchId);
    }

    // Update Feedback
    public Feedback updateFeedback(
            Long id,
            FeedbackRequest request) {

        Feedback feedback = feedbackRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Feedback not found"));

        feedback.setRating(request.getRating());
        feedback.setComment(request.getComment());

        return feedbackRepository.save(feedback);
    }

    // Delete Feedback
    public void deleteFeedback(Long id) {

        if (!feedbackRepository.existsById(id)) {
            throw new RuntimeException("Feedback not found");
        }

        feedbackRepository.deleteById(id);
    }
}

