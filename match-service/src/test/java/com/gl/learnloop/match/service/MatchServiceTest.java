package com.gl.learnloop.match.service;

import com.gl.learnloop.match.client.LearningRequestFeignClient;
import com.gl.learnloop.match.client.SkillFeignClient;
import com.gl.learnloop.match.client.UserFeignClient;
import com.gl.learnloop.match.dto.MatchRequest;
import com.gl.learnloop.match.dto.SkillResponse;
import com.gl.learnloop.match.dto.UserResponse;
import com.gl.learnloop.match.entity.Match;
import com.gl.learnloop.match.repository.MatchRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MatchServiceTest {

    @Mock
    private MatchRepository matchRepository;

    @Mock
    private UserFeignClient userFeignClient;

    @Mock
    private SkillFeignClient skillFeignClient;

    @Mock
    private LearningRequestFeignClient learningRequestFeignClient;

    @InjectMocks
    private MatchService matchService;

    private MatchRequest matchRequest;
    private UserResponse userResponse;
    private SkillResponse skillResponse;
    private Match match;

    @BeforeEach
    void setUp() {
        matchRequest = new MatchRequest();
        matchRequest.setUserId(1L);
        matchRequest.setMatchedUserId(2L);
        matchRequest.setSkillId(10L);
        matchRequest.setLearningRequestId(100L);

        userResponse = new UserResponse();
        userResponse.setId(1L);
        userResponse.setEmail("user1@example.com");

        UserResponse matchedUserResponse = new UserResponse();
        matchedUserResponse.setId(2L);
        matchedUserResponse.setEmail("user2@example.com");

        skillResponse = new SkillResponse();
        skillResponse.setId(10L);
        skillResponse.setName("Java");
        skillResponse.setUserId(2L); // Owner matches matchedUserId

        match = new Match();
        match.setId(500L);
        match.setUserId(1L);
        match.setMatchedUserId(2L);
        match.setSkillId(10L);
        match.setLearningRequestId(100L);
        match.setStatus("PENDING");
    }

    @Test
    void createMatch_Success() {
        when(userFeignClient.getUserById(1L)).thenReturn(userResponse);
        when(userFeignClient.getUserById(2L)).thenReturn(userResponse);
        when(skillFeignClient.getSkillById(10L)).thenReturn(skillResponse);
        when(matchRepository.existsByUserIdAndMatchedUserIdAndSkillId(1L, 2L, 10L)).thenReturn(false);
        when(learningRequestFeignClient.getPendingRequestsByLearnerId(2L)).thenReturn(new ArrayList<>());
        when(matchRepository.save(any(Match.class))).thenReturn(match);

        Match created = matchService.createMatch(matchRequest);

        assertNotNull(created);
        assertEquals(500L, created.getId());
        verify(matchRepository).save(any(Match.class));
    }

    @Test
    void createMatch_Failure_Duplicate() {
        when(userFeignClient.getUserById(1L)).thenReturn(userResponse);
        when(userFeignClient.getUserById(2L)).thenReturn(userResponse);
        when(skillFeignClient.getSkillById(10L)).thenReturn(skillResponse);
        when(matchRepository.existsByUserIdAndMatchedUserIdAndSkillId(1L, 2L, 10L)).thenReturn(true);

        RuntimeException exception = assertThrows(RuntimeException.class, () -> matchService.createMatch(matchRequest));
        assertTrue(exception.getMessage().contains("Match already exists"));
        verify(matchRepository, never()).save(any(Match.class));
    }

    @Test
    void getMatchById_Success() {
        when(matchRepository.findById(500L)).thenReturn(Optional.of(match));

        Match found = matchService.getMatchById(500L);

        assertNotNull(found);
        assertEquals(500L, found.getId());
    }

    @Test
    void getMatchById_NotFound() {
        when(matchRepository.findById(999L)).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class, () -> matchService.getMatchById(999L));
        assertEquals("Match not found", exception.getMessage());
    }

    @Test
    void updateStatus_Success() {
        when(matchRepository.findById(500L)).thenReturn(Optional.of(match));
        when(matchRepository.save(any(Match.class))).thenReturn(match);

        Match updated = matchService.updateStatus(500L, "ACCEPTED");

        assertNotNull(updated);
        assertEquals("ACCEPTED", updated.getStatus());
    }

    @Test
    void updateStatus_InvalidStatus() {
        when(matchRepository.findById(500L)).thenReturn(Optional.of(match));

        RuntimeException exception = assertThrows(RuntimeException.class, () -> matchService.updateStatus(500L, "INVALID"));
        assertEquals("Invalid match status", exception.getMessage());
    }
}
