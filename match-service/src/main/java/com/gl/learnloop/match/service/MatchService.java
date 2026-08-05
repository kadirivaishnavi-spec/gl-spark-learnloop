package com.gl.learnloop.match.service;

import com.gl.learnloop.match.client.LearningRequestFeignClient;
import com.gl.learnloop.match.client.SkillFeignClient;
import com.gl.learnloop.match.client.UserFeignClient;
import com.gl.learnloop.match.dto.LearningRequestResponse;
import com.gl.learnloop.match.dto.MatchRequest;
import com.gl.learnloop.match.dto.MatchResponse;
import com.gl.learnloop.match.dto.SkillResponse;
import com.gl.learnloop.match.dto.UserResponse;
import com.gl.learnloop.match.entity.Match;
import com.gl.learnloop.match.repository.MatchRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MatchService {

    private final MatchRepository matchRepository;
    private final UserFeignClient userFeignClient;
    private final SkillFeignClient skillFeignClient;
    private final LearningRequestFeignClient learningRequestFeignClient;

    public MatchService(
            MatchRepository matchRepository,
            UserFeignClient userFeignClient,
            SkillFeignClient skillFeignClient,
            LearningRequestFeignClient learningRequestFeignClient) {

        this.matchRepository = matchRepository;
        this.userFeignClient = userFeignClient;
        this.skillFeignClient = skillFeignClient;
        this.learningRequestFeignClient = learningRequestFeignClient;
    }

    // =========================================================
    // CREATE MATCH
    // =========================================================

    public Match createMatch(MatchRequest request) {

        // 1. Validate requesting user
        try {
            userFeignClient.getUserById(request.getUserId());
        } catch (Exception e) {
            throw new RuntimeException("User not found", e);
        }

        // 2. Validate matched user
        try {
            userFeignClient.getUserById(request.getMatchedUserId());
        } catch (Exception e) {
            throw new RuntimeException("Matched user not found", e);
        }

        // 3. Validate skill
        SkillResponse skill;

        try {
            skill = skillFeignClient.getSkillById(request.getSkillId());
        } catch (Exception e) {
            throw new RuntimeException("Skill not found", e);
        }

        // 4. Validate skill owner
        if (skill.getUserId() == null) {
            throw new RuntimeException("Skill owner not found");
        }

        if (!skill.getUserId().equals(request.getMatchedUserId())) {
            throw new RuntimeException(
                    "Matched user does not own this skill"
            );
        }

        // 5. Learning request ID is required
        if (request.getLearningRequestId() == null) {
            throw new RuntimeException(
                    "Learning request ID is required"
            );
        }

        // 6. Prevent duplicate match
        boolean exists =
                matchRepository.existsByUserIdAndMatchedUserIdAndSkillId(
                        request.getUserId(),
                        request.getMatchedUserId(),
                        request.getSkillId()
                );

        if (exists) {
            throw new RuntimeException(
                    "Match already exists for this user, matched user and skill"
            );
        }

        // 7. Find reciprocal learning request
        Long matchedLearningRequestId =
                findReciprocalLearningRequest(
                        request.getUserId(),
                        request.getMatchedUserId()
                );

        // 8. Create match
        Match match = new Match();

        match.setUserId(request.getUserId());
        match.setMatchedUserId(request.getMatchedUserId());
        match.setSkillId(request.getSkillId());

        match.setLearningRequestId(
                request.getLearningRequestId()
        );

        match.setMatchedLearningRequestId(
                matchedLearningRequestId
        );

        match.setStatus("PENDING");

        // 9. Save
        return matchRepository.save(match);
    }

    // =========================================================
    // FIND RECIPROCAL LEARNING REQUEST
    // =========================================================

    private Long findReciprocalLearningRequest(
            Long originalUserId,
            Long matchedUserId) {

        List<LearningRequestResponse> requests;

        try {

            requests =
                    learningRequestFeignClient
                            .getPendingRequestsByLearnerId(
                                    matchedUserId
                            );

        } catch (Exception e) {

            throw new RuntimeException(
                    "Could not retrieve reciprocal learning requests",
                    e
            );
        }

        for (LearningRequestResponse request : requests) {

            if (!matchedUserId.equals(
                    request.getLearnerId())) {
                continue;
            }

            SkillResponse requestedSkill;

            try {

                requestedSkill =
                        skillFeignClient.getSkillById(
                                request.getSkillId()
                        );

            } catch (Exception e) {

                continue;
            }

            if (requestedSkill.getUserId() != null
                    && requestedSkill.getUserId()
                    .equals(originalUserId)) {

                return request.getId();
            }
        }

        return null;
    }

    // =========================================================
    // GET ALL MATCHES
    // =========================================================

    public List<Match> getAllMatches() {
        return matchRepository.findAll();
    }

    // =========================================================
    // GET MATCH BY ID
    // =========================================================

    public Match getMatchById(Long id) {

        return matchRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Match not found"
                        )
                );
    }

    // =========================================================
    // GET MATCHES FOR USER
    // =========================================================

    public List<Match> getMatchesByUserId(Long userId) {

        return matchRepository
                .findByUserIdOrMatchedUserId(
                        userId,
                        userId
                );
    }

    // =========================================================
    // GET MATCHES BY MATCHED USER ID
    // =========================================================

    public List<Match> getMatchesByMatchedUserId(
            Long matchedUserId) {

        return matchRepository
                .findByMatchedUserId(
                        matchedUserId
                );
    }

    // =========================================================
    // GET MATCHES BY SKILL
    // =========================================================

    public List<Match> getMatchesBySkillId(
            Long skillId) {

        return matchRepository
                .findBySkillId(skillId);
    }

    // =========================================================
    // GET MATCHES BY STATUS
    // =========================================================

    public List<Match> getMatchesByStatus(
            String status) {

        return matchRepository
                .findByStatus(status);
    }

    // =========================================================
    // UPDATE MATCH STATUS
    // =========================================================

    public Match updateStatus(
            Long id,
            String status) {

        Match match =
                matchRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Match not found"
                                )
                        );

        // Normalize status
        String normalizedStatus =
                status.toUpperCase();

        // Validate status
        if (!normalizedStatus.equals("PENDING")
                && !normalizedStatus.equals("ACCEPTED")
                && !normalizedStatus.equals("REJECTED")
                && !normalizedStatus.equals("COMPLETED")) {

            throw new RuntimeException(
                    "Invalid match status"
            );
        }

        // Update match
        match.setStatus(normalizedStatus);

        Match savedMatch =
                matchRepository.save(match);

        // =====================================================
        // ACCEPTED
        // =====================================================

        if ("ACCEPTED".equals(normalizedStatus)) {

            updateLearningRequestStatus(
                    match.getLearningRequestId(),
                    "ACCEPTED"
            );

            if (match.getMatchedLearningRequestId() != null) {

                updateLearningRequestStatus(
                        match.getMatchedLearningRequestId(),
                        "ACCEPTED"
                );
            }
        }

        // =====================================================
        // REJECTED
        // =====================================================

        if ("REJECTED".equals(normalizedStatus)) {

            updateLearningRequestStatus(
                    match.getLearningRequestId(),
                    "REJECTED"
            );

            if (match.getMatchedLearningRequestId() != null) {

                updateLearningRequestStatus(
                        match.getMatchedLearningRequestId(),
                        "REJECTED"
                );
            }
        }

        return savedMatch;
    }

    // =========================================================
    // UPDATE LEARNING REQUEST STATUS
    // =========================================================

    private void updateLearningRequestStatus(
            Long learningRequestId,
            String status) {

        if (learningRequestId == null) {

            System.out.println(
                    "Learning request ID is null. Skipping update."
            );

            return;
        }

        try {

            System.out.println(
                    "=============================================="
            );

            System.out.println(
                    "Calling learning-service..."
            );

            System.out.println(
                    "Learning Request ID: "
                            + learningRequestId
            );

            System.out.println(
                    "New Status: "
                            + status
            );

            System.out.println(
                    "=============================================="
            );

            LearningRequestResponse response =
                    learningRequestFeignClient.updateStatus(
                            learningRequestId,
                            status
                    );

            System.out.println(
                    "Learning request updated successfully."
            );

            System.out.println(
                    "Response: "
                            + response
            );

        } catch (Exception e) {

            System.err.println(
                    "=============================================="
            );

            System.err.println(
                    "FAILED TO UPDATE LEARNING REQUEST"
            );

            System.err.println(
                    "Learning Request ID: "
                            + learningRequestId
            );

            System.err.println(
                    "Status: "
                            + status
            );

            System.err.println(
                    "Exception Type: "
                            + e.getClass().getName()
            );

            System.err.println(
                    "Exception Message: "
                            + e.getMessage()
            );

            System.err.println(
                    "=============================================="
            );

            e.printStackTrace();

            throw new RuntimeException(
                    "Could not update learning request ID "
                            + learningRequestId
                            + " to status "
                            + status
                            + ". Cause: "
                            + e.getMessage(),
                    e
            );
        }
    }

    // =========================================================
    // DELETE MATCH
    // =========================================================

    public void deleteMatch(Long id) {

        if (!matchRepository.existsById(id)) {

            throw new RuntimeException(
                    "Match not found"
            );
        }

        matchRepository.deleteById(id);
    }

    // =========================================================
    // NORMAL RESPONSE
    // =========================================================

    public MatchResponse toResponse(
            Match match) {

        MatchResponse response =
                new MatchResponse(match);

        try {

            UserResponse user =
                    userFeignClient.getUserById(
                            match.getMatchedUserId()
                    );

            if (user != null) {

                response.setMatchedUserEmail(
                        user.getEmail()
                );
            }

        } catch (Exception e) {

            response.setMatchedUserEmail(null);
        }

        return response;
    }

    // =========================================================
    // USER-RELATIVE RESPONSE
    // =========================================================

    public MatchResponse toResponse(
            Match match,
            Long requestedUserId) {

        MatchResponse response =
                new MatchResponse(
                        match,
                        requestedUserId
                );

        Long otherUserId;

        if (match.getUserId()
                .equals(requestedUserId)) {

            otherUserId =
                    match.getMatchedUserId();

        } else {

            otherUserId =
                    match.getUserId();
        }

        try {

            UserResponse user =
                    userFeignClient.getUserById(
                            otherUserId
                    );

            if (user != null) {

                response.setMatchedUserEmail(
                        user.getEmail()
                );
            }

        } catch (Exception e) {

            response.setMatchedUserEmail(null);
        }

        return response;
    }
}