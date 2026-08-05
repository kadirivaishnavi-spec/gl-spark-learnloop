package com.gl.learnloop.learning.service;

import com.gl.learnloop.learning.client.MatchFeignClient;
import com.gl.learnloop.learning.client.SkillFeignClient;
import com.gl.learnloop.learning.client.UserFeignClient;
import com.gl.learnloop.learning.dto.LearningRequestDTO;
import com.gl.learnloop.learning.dto.MatchRequest;
import com.gl.learnloop.learning.dto.SkillResponse;
import com.gl.learnloop.learning.entity.LearningRequest;
import com.gl.learnloop.learning.repository.LearningRequestRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class LearningRequestService {

    private final LearningRequestRepository learningRequestRepository;
    private final UserFeignClient userFeignClient;
    private final SkillFeignClient skillFeignClient;
    private final MatchFeignClient matchFeignClient;

    public LearningRequestService(
            LearningRequestRepository learningRequestRepository,
            UserFeignClient userFeignClient,
            SkillFeignClient skillFeignClient,
            MatchFeignClient matchFeignClient) {

        this.learningRequestRepository = learningRequestRepository;
        this.userFeignClient = userFeignClient;
        this.skillFeignClient = skillFeignClient;
        this.matchFeignClient = matchFeignClient;
    }

    // =========================================================
    // CREATE LEARNING REQUEST
    // =========================================================

    public LearningRequest createRequest(
            LearningRequestDTO request) {

        // 1. Validate learner
        try {

            userFeignClient.getUserById(
                    request.getLearnerId()
            );

        } catch (Exception e) {

            throw new RuntimeException(
                    "User not found"
            );
        }

        // 2. Validate requested skill
        SkillResponse skill;

        try {

            skill = skillFeignClient.getSkillById(
                    request.getSkillId()
            );

        } catch (Exception e) {

            throw new RuntimeException(
                    "Skill not found"
            );
        }

        // 3. Get skill owner
        Long skillOwnerId = skill.getUserId();

        if (skillOwnerId == null) {

            throw new RuntimeException(
                    "Skill owner not found"
            );
        }

        // 4. User cannot request their own skill
        if (skillOwnerId.equals(request.getLearnerId())) {

            throw new RuntimeException(
                    "You cannot request your own skill"
            );
        }

        // 5. Create learning request
        LearningRequest learningRequest =
                new LearningRequest();

        learningRequest.setLearnerId(
                request.getLearnerId()
        );

        learningRequest.setSkillId(
                request.getSkillId()
        );

        learningRequest.setMessage(
                request.getMessage()
        );

        learningRequest.setStatus(
                "PENDING"
        );

        // 6. Save first
        LearningRequest savedRequest =
                learningRequestRepository.save(
                        learningRequest
                );

        // 7. Ask Match Service to check reciprocal request
        try {

            MatchRequest matchRequest =
                    new MatchRequest(
                            savedRequest.getLearnerId(),
                            skillOwnerId,
                            savedRequest.getSkillId(),
                            savedRequest.getId()
                    );

            matchFeignClient.createMatch(
                    matchRequest
            );

        } catch (Exception e) {

            /*
             * This is intentionally not a failure.
             *
             * The learning request has already been created.
             *
             * A reciprocal request may not exist yet.
             */
            System.out.println(
                    "Match not created yet: "
                            + e.getMessage()
            );
        }

        return savedRequest;
    }

    // =========================================================
    // GET ALL
    // =========================================================

    public List<LearningRequest> getAllRequests() {

        return learningRequestRepository.findAll();
    }

    // =========================================================
    // GET BY ID
    // =========================================================

    public LearningRequest getRequestById(Long id) {

        return learningRequestRepository
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Learning request not found"
                        )
                );
    }

    // =========================================================
    // GET BY LEARNER
    // =========================================================

    public List<LearningRequest> getRequestsByLearnerId(
            Long learnerId) {

        return learningRequestRepository
                .findByLearnerId(learnerId);
    }

    // =========================================================
    // GET PENDING BY LEARNER
    // =========================================================

    public List<LearningRequest>
    getRequestsByLearnerIdAndStatus(
            Long learnerId,
            String status) {

        return learningRequestRepository
                .findByLearnerIdAndStatus(
                        learnerId,
                        status
                );
    }

    // =========================================================
    // GET BY SKILL
    // =========================================================

    public List<LearningRequest>
    getRequestsBySkillId(
            Long skillId) {

        return learningRequestRepository
                .findBySkillId(skillId);
    }

    // =========================================================
    // GET BY STATUS
    // =========================================================

    public List<LearningRequest>
    getRequestsByStatus(
            String status) {

        return learningRequestRepository
                .findByStatus(status);
    }

    // =========================================================
    // UPDATE REQUEST
    // =========================================================

    public LearningRequest updateRequest(
            Long id,
            LearningRequestDTO request) {

        LearningRequest learningRequest =
                learningRequestRepository
                        .findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Learning request not found"
                                )
                        );

        learningRequest.setLearnerId(
                request.getLearnerId()
        );

        learningRequest.setSkillId(
                request.getSkillId()
        );

        learningRequest.setMessage(
                request.getMessage()
        );

        return learningRequestRepository.save(
                learningRequest
        );
    }

    // =========================================================
    // UPDATE STATUS
    // =========================================================

    public LearningRequest updateStatus(
            Long id,
            String status) {

        LearningRequest learningRequest =
                learningRequestRepository
                        .findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Learning request not found"
                                )
                        );

        String normalizedStatus =
                status.toUpperCase();

        if (!normalizedStatus.equals("PENDING")
                && !normalizedStatus.equals("ACCEPTED")
                && !normalizedStatus.equals("REJECTED")
                && !normalizedStatus.equals("COMPLETED")) {

            throw new RuntimeException(
                    "Invalid learning request status"
            );
        }

        learningRequest.setStatus(
                normalizedStatus
        );

        return learningRequestRepository.save(
                learningRequest
        );
    }

    // =========================================================
    // DELETE
    // =========================================================

    public void deleteRequest(Long id) {

        if (!learningRequestRepository.existsById(id)) {

            throw new RuntimeException(
                    "Learning request not found"
            );
        }

        learningRequestRepository.deleteById(id);
    }
}