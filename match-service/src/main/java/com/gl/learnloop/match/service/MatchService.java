package com.gl.learnloop.match.service;

import com.gl.learnloop.match.client.SkillFeignClient;
import com.gl.learnloop.match.client.UserFeignClient;
import com.gl.learnloop.match.dto.MatchRequest;
import com.gl.learnloop.match.entity.Match;
import com.gl.learnloop.match.repository.MatchRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MatchService {

    private final MatchRepository matchRepository;
    private final UserFeignClient userFeignClient;
    private final SkillFeignClient skillFeignClient;

    public MatchService(
            MatchRepository matchRepository,
            UserFeignClient userFeignClient,
            SkillFeignClient skillFeignClient) {

        this.matchRepository = matchRepository;
        this.userFeignClient = userFeignClient;
        this.skillFeignClient = skillFeignClient;
    }

    // Create Match
    public Match createMatch(MatchRequest request) {

        // Check user
        try {
            userFeignClient.getUserById(request.getUserId());
        } catch (Exception e) {
            throw new RuntimeException("User not found");
        }

        // Check matched user
        try {
            userFeignClient.getUserById(request.getMatchedUserId());
        } catch (Exception e) {
            throw new RuntimeException("Matched user not found");
        }

        // Check skill
        try {
            skillFeignClient.getSkillById(request.getSkillId());
        } catch (Exception e) {
            throw new RuntimeException("Skill not found");
        }

        // Prevent duplicate match
        if (matchRepository.existsByUserIdAndMatchedUserIdAndSkillId(
                request.getUserId(),
                request.getMatchedUserId(),
                request.getSkillId())) {

            throw new RuntimeException(
                    "Match already exists for this user, matched user and skill");
        }

        Match match = new Match();

        match.setUserId(request.getUserId());
        match.setMatchedUserId(request.getMatchedUserId());
        match.setSkillId(request.getSkillId());

        // New match starts as PENDING
        match.setStatus("PENDING");

        return matchRepository.save(match);
    }

    // Get all matches
    public List<Match> getAllMatches() {

        return matchRepository.findAll();
    }

    // Get match by ID
    public Match getMatchById(Long id) {

        return matchRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Match not found"));
    }

    // Get matches by user
    public List<Match> getMatchesByUserId(Long userId) {

        return matchRepository.findByUserId(userId);
    }

    // Get matches by matched user
    public List<Match> getMatchesByMatchedUserId(Long matchedUserId) {

        return matchRepository.findByMatchedUserId(matchedUserId);
    }

    // Get matches by skill
    public List<Match> getMatchesBySkillId(Long skillId) {

        return matchRepository.findBySkillId(skillId);
    }

    // Get matches by status
    public List<Match> getMatchesByStatus(String status) {

        return matchRepository.findByStatus(status);
    }

    // Update match status
    public Match updateStatus(Long id, String status) {

        Match match = matchRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Match not found"));

        match.setStatus(status);

        return matchRepository.save(match);
    }

    // Delete match
    public void deleteMatch(Long id) {

        if (!matchRepository.existsById(id)) {
            throw new RuntimeException("Match not found");
        }

        matchRepository.deleteById(id);
    }
}