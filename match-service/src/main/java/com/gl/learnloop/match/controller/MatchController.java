package com.gl.learnloop.match.controller;

import com.gl.learnloop.match.dto.MatchRequest;
import com.gl.learnloop.match.dto.MatchResponse;
import com.gl.learnloop.match.entity.Match;
import com.gl.learnloop.match.service.MatchService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/matches")
public class MatchController {

    private final MatchService matchService;

    public MatchController(
            MatchService matchService) {

        this.matchService = matchService;
    }


    // =========================================================
    // CREATE MATCH
    // =========================================================

    @PostMapping
    public ResponseEntity<MatchResponse> createMatch(
            @Valid @RequestBody MatchRequest request) {

        Match match =
                matchService.createMatch(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        matchService.toResponse(match)
                );
    }


    // =========================================================
    // GET ALL MATCHES
    // =========================================================

    @GetMapping
    public ResponseEntity<List<MatchResponse>>
    getAllMatches() {

        List<MatchResponse> matches =
                matchService.getAllMatches()
                        .stream()
                        .map(matchService::toResponse)
                        .toList();

        return ResponseEntity.ok(matches);
    }


    // =========================================================
    // GET MATCH BY ID
    // =========================================================

    @GetMapping("/{id}")
    public ResponseEntity<MatchResponse>
    getMatchById(
            @PathVariable Long id) {

        Match match =
                matchService.getMatchById(id);

        return ResponseEntity.ok(
                matchService.toResponse(match)
        );
    }


    // =========================================================
    // GET MATCHES FOR USER
    // =========================================================

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<MatchResponse>>
    getMatchesByUserId(
            @PathVariable Long userId) {

        List<MatchResponse> matches =
                matchService
                        .getMatchesByUserId(userId)
                        .stream()
                        .map(match ->
                                matchService.toResponse(
                                        match,
                                        userId
                                )
                        )
                        .toList();

        return ResponseEntity.ok(matches);
    }


    // =========================================================
    // GET MATCHES BY MATCHED USER
    // =========================================================

    @GetMapping("/matched-user/{matchedUserId}")
    public ResponseEntity<List<MatchResponse>>
    getMatchesByMatchedUserId(
            @PathVariable Long matchedUserId) {

        List<MatchResponse> matches =
                matchService
                        .getMatchesByMatchedUserId(
                                matchedUserId
                        )
                        .stream()
                        .map(match ->
                                matchService.toResponse(
                                        match,
                                        matchedUserId
                                )
                        )
                        .toList();

        return ResponseEntity.ok(matches);
    }


    // =========================================================
    // GET MATCHES BY SKILL
    // =========================================================

    @GetMapping("/skill/{skillId}")
    public ResponseEntity<List<MatchResponse>>
    getMatchesBySkillId(
            @PathVariable Long skillId) {

        List<MatchResponse> matches =
                matchService
                        .getMatchesBySkillId(skillId)
                        .stream()
                        .map(matchService::toResponse)
                        .toList();

        return ResponseEntity.ok(matches);
    }


    // =========================================================
    // GET MATCHES BY STATUS
    // =========================================================

    @GetMapping("/status/{status}")
    public ResponseEntity<List<MatchResponse>>
    getMatchesByStatus(
            @PathVariable String status) {

        List<MatchResponse> matches =
                matchService
                        .getMatchesByStatus(status)
                        .stream()
                        .map(matchService::toResponse)
                        .toList();

        return ResponseEntity.ok(matches);
    }


    // =========================================================
    // UPDATE MATCH STATUS
    // =========================================================

    @PatchMapping("/{id}/status")
    public ResponseEntity<MatchResponse>
    updateStatus(
            @PathVariable Long id,
            @RequestParam String status) {

        Match match =
                matchService.updateStatus(
                        id,
                        status
                );

        return ResponseEntity.ok(
                matchService.toResponse(match)
        );
    }


    // =========================================================
    // DELETE MATCH
    // =========================================================

    @DeleteMapping("/{id}")
    public ResponseEntity<String>
    deleteMatch(
            @PathVariable Long id) {

        matchService.deleteMatch(id);

        return ResponseEntity.ok(
                "Match deleted successfully"
        );
    }
}