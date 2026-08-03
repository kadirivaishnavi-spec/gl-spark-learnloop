package com.gl.learnloop.learning.service;

import com.gl.learnloop.learning.client.SkillFeignClient;
import com.gl.learnloop.learning.client.UserFeignClient;
import com.gl.learnloop.learning.dto.LearningRequestDTO;
import com.gl.learnloop.learning.entity.LearningRequest;
import com.gl.learnloop.learning.repository.LearningRequestRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class LearningRequestService {

    private final LearningRequestRepository learningRequestRepository;
    private final UserFeignClient userFeignClient;
    private final SkillFeignClient skillFeignClient;

    public LearningRequestService(
            LearningRequestRepository learningRequestRepository,
            UserFeignClient userFeignClient,
            SkillFeignClient skillFeignClient) {

        this.learningRequestRepository = learningRequestRepository;
        this.userFeignClient = userFeignClient;
        this.skillFeignClient = skillFeignClient;
    }

    // Create Learning Request
    public LearningRequest createRequest(LearningRequestDTO request) {

        // Check if user exists
        try {
            userFeignClient.getUserById(request.getLearnerId());
        } catch (Exception e) {
            throw new RuntimeException("User not found");
        }

        // Check if skill exists
        try {
            skillFeignClient.getSkillById(request.getSkillId());
        } catch (Exception e) {
            throw new RuntimeException("Skill not found");
        }

        LearningRequest learningRequest = new LearningRequest();

        learningRequest.setLearnerId(request.getLearnerId());
        learningRequest.setSkillId(request.getSkillId());
        learningRequest.setMessage(request.getMessage());

        // New requests are always PENDING
        learningRequest.setStatus("PENDING");

        return learningRequestRepository.save(learningRequest);
    }

    // Get all Learning Requests
    public List<LearningRequest> getAllRequests() {

        return learningRequestRepository.findAll();
    }

    // Get Learning Request by ID
    public LearningRequest getRequestById(Long id) {

        return learningRequestRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Learning request not found"));
    }

    // Get requests by Learner ID
    public List<LearningRequest> getRequestsByLearnerId(Long learnerId) {

        return learningRequestRepository.findByLearnerId(learnerId);
    }

    // Get requests by Skill ID
    public List<LearningRequest> getRequestsBySkillId(Long skillId) {

        return learningRequestRepository.findBySkillId(skillId);
    }

    // Get requests by Status
    public List<LearningRequest> getRequestsByStatus(String status) {

        return learningRequestRepository.findByStatus(status);
    }

    // Update Learning Request
    public LearningRequest updateRequest(
            Long id,
            LearningRequestDTO request) {

        LearningRequest learningRequest =
                learningRequestRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Learning request not found"));

        learningRequest.setLearnerId(request.getLearnerId());
        learningRequest.setSkillId(request.getSkillId());
        learningRequest.setMessage(request.getMessage());

        return learningRequestRepository.save(learningRequest);
    }

    // Update Status
    public LearningRequest updateStatus(
            Long id,
            String status) {

        LearningRequest learningRequest =
                learningRequestRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Learning request not found"));

        learningRequest.setStatus(status);

        return learningRequestRepository.save(learningRequest);
    }

    // Delete Learning Request
    public void deleteRequest(Long id) {

        if (!learningRequestRepository.existsById(id)) {
            throw new RuntimeException(
                    "Learning request not found");
        }

        learningRequestRepository.deleteById(id);
    }
}
