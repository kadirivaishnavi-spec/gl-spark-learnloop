package com.gl.learnloop.learning.controller;

import com.gl.learnloop.learning.dto.LearningRequestDTO;
import com.gl.learnloop.learning.dto.LearningRequestResponse;
import com.gl.learnloop.learning.entity.LearningRequest;
import com.gl.learnloop.learning.service.LearningRequestService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/learning-requests")
public class LearningRequestController {

    private final LearningRequestService learningRequestService;

    public LearningRequestController(
            LearningRequestService learningRequestService) {

        this.learningRequestService = learningRequestService;
    }

    // Create Learning Request
    @PostMapping
    public ResponseEntity<LearningRequestResponse> createRequest(
            @Valid @RequestBody LearningRequestDTO request) {

        LearningRequest learningRequest =
                learningRequestService.createRequest(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(new LearningRequestResponse(learningRequest));
    }

    // Get all Learning Requests
    @GetMapping
    public ResponseEntity<List<LearningRequestResponse>> getAllRequests() {

        List<LearningRequestResponse> requests =
                learningRequestService.getAllRequests()
                        .stream()
                        .map(LearningRequestResponse::new)
                        .toList();

        return ResponseEntity.ok(requests);
    }

    // Get Learning Request by ID
    @GetMapping("/{id}")
    public ResponseEntity<LearningRequestResponse> getRequestById(
            @PathVariable Long id) {

        LearningRequest learningRequest =
                learningRequestService.getRequestById(id);

        return ResponseEntity.ok(
                new LearningRequestResponse(learningRequest)
        );
    }

    // Get requests by Learner ID
    @GetMapping("/learner/{learnerId}")
    public ResponseEntity<List<LearningRequestResponse>>
    getRequestsByLearnerId(
            @PathVariable Long learnerId) {

        List<LearningRequestResponse> requests =
                learningRequestService
                        .getRequestsByLearnerId(learnerId)
                        .stream()
                        .map(LearningRequestResponse::new)
                        .toList();

        return ResponseEntity.ok(requests);
    }

    // Get pending requests by Learner ID
    // Used by Match Service to find reciprocal requests
    @GetMapping("/learner/{learnerId}/pending")
    public ResponseEntity<List<LearningRequestResponse>>
    getPendingRequestsByLearnerId(
            @PathVariable Long learnerId) {

        List<LearningRequestResponse> requests =
                learningRequestService
                        .getRequestsByLearnerIdAndStatus(
                                learnerId,
                                "PENDING"
                        )
                        .stream()
                        .map(LearningRequestResponse::new)
                        .toList();

        return ResponseEntity.ok(requests);
    }

    // Get requests by Skill ID
    @GetMapping("/skill/{skillId}")
    public ResponseEntity<List<LearningRequestResponse>>
    getRequestsBySkillId(
            @PathVariable Long skillId) {

        List<LearningRequestResponse> requests =
                learningRequestService
                        .getRequestsBySkillId(skillId)
                        .stream()
                        .map(LearningRequestResponse::new)
                        .toList();

        return ResponseEntity.ok(requests);
    }

    // Get requests by Status
    @GetMapping("/status/{status}")
    public ResponseEntity<List<LearningRequestResponse>>
    getRequestsByStatus(
            @PathVariable String status) {

        List<LearningRequestResponse> requests =
                learningRequestService
                        .getRequestsByStatus(status)
                        .stream()
                        .map(LearningRequestResponse::new)
                        .toList();

        return ResponseEntity.ok(requests);
    }

    // Update Learning Request
    @PutMapping("/{id}")
    public ResponseEntity<LearningRequestResponse> updateRequest(
            @PathVariable Long id,
            @Valid @RequestBody LearningRequestDTO request) {

        LearningRequest learningRequest =
                learningRequestService.updateRequest(id, request);

        return ResponseEntity.ok(
                new LearningRequestResponse(learningRequest)
        );
    }

    // Update Status
    @PutMapping("/{id}/status")
    public ResponseEntity<LearningRequestResponse> updateStatus(
            @PathVariable Long id,
            @RequestParam String status) {

        LearningRequest learningRequest =
                learningRequestService.updateStatus(id, status);

        return ResponseEntity.ok(
                new LearningRequestResponse(learningRequest)
        );
    }

    // Delete Learning Request
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteRequest(
            @PathVariable Long id) {

        learningRequestService.deleteRequest(id);

        return ResponseEntity.ok(
                "Learning request deleted successfully"
        );
    }
}