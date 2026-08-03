package com.gl.learnloop.feedback.controller;

import com.gl.learnloop.feedback.dto.FeedbackRequest;
import com.gl.learnloop.feedback.dto.FeedbackResponse;
import com.gl.learnloop.feedback.entity.Feedback;
import com.gl.learnloop.feedback.service.FeedbackService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/feedback")
public class FeedbackController {

    private final FeedbackService feedbackService;

    public FeedbackController(FeedbackService feedbackService) {
        this.feedbackService = feedbackService;
    }

    // Create Feedback
    @PostMapping
    public ResponseEntity<FeedbackResponse> createFeedback(
            @Valid @RequestBody FeedbackRequest request) {

        Feedback feedback =
                feedbackService.createFeedback(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(new FeedbackResponse(feedback));
    }

    // Get all Feedback
    @GetMapping
    public ResponseEntity<List<FeedbackResponse>> getAllFeedback() {

        List<FeedbackResponse> feedback =
                feedbackService.getAllFeedback()
                        .stream()
                        .map(FeedbackResponse::new)
                        .toList();

        return ResponseEntity.ok(feedback);
    }

    // Get Feedback by ID
    @GetMapping("/{id}")
    public ResponseEntity<FeedbackResponse> getFeedbackById(
            @PathVariable Long id) {

        Feedback feedback =
                feedbackService.getFeedbackById(id);

        return ResponseEntity.ok(
                new FeedbackResponse(feedback));
    }

    // Get Feedback by User ID
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<FeedbackResponse>>
    getFeedbackByUserId(
            @PathVariable Long userId) {

        List<FeedbackResponse> feedback =
                feedbackService.getFeedbackByUserId(userId)
                        .stream()
                        .map(FeedbackResponse::new)
                        .toList();

        return ResponseEntity.ok(feedback);
    }

    // Get Feedback by Match ID
    @GetMapping("/match/{matchId}")
    public ResponseEntity<List<FeedbackResponse>>
    getFeedbackByMatchId(
            @PathVariable Long matchId) {

        List<FeedbackResponse> feedback =
                feedbackService.getFeedbackByMatchId(matchId)
                        .stream()
                        .map(FeedbackResponse::new)
                        .toList();

        return ResponseEntity.ok(feedback);
    }

    // Update Feedback
    @PutMapping("/{id}")
    public ResponseEntity<FeedbackResponse> updateFeedback(
            @PathVariable Long id,
            @Valid @RequestBody FeedbackRequest request) {

        Feedback feedback =
                feedbackService.updateFeedback(id, request);

        return ResponseEntity.ok(
                new FeedbackResponse(feedback));
    }

    // Delete Feedback
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteFeedback(
            @PathVariable Long id) {

        feedbackService.deleteFeedback(id);

        return ResponseEntity.ok(
                "Feedback deleted successfully");
    }
}
