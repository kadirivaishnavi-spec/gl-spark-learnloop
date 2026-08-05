package com.gl.learnloop.learning.service;

import com.gl.learnloop.learning.client.MatchFeignClient;
import com.gl.learnloop.learning.client.SkillFeignClient;
import com.gl.learnloop.learning.client.UserFeignClient;
import com.gl.learnloop.learning.dto.LearningRequestDTO;
import com.gl.learnloop.learning.dto.SkillResponse;
import com.gl.learnloop.learning.entity.LearningRequest;
import com.gl.learnloop.learning.repository.LearningRequestRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class LearningRequestServiceTest {

    @Mock
    private LearningRequestRepository learningRequestRepository;

    @Mock
    private UserFeignClient userFeignClient;

    @Mock
    private SkillFeignClient skillFeignClient;

    @Mock
    private MatchFeignClient matchFeignClient;

    @InjectMocks
    private LearningRequestService learningRequestService;

    private LearningRequestDTO requestDTO;
    private SkillResponse skillResponse;
    private LearningRequest learningRequest;

    @BeforeEach
    void setUp() {
        requestDTO = new LearningRequestDTO();
        requestDTO.setLearnerId(1L);
        requestDTO.setSkillId(10L);
        requestDTO.setMessage("I want to learn Java");

        skillResponse = new SkillResponse();
        skillResponse.setId(10L);
        skillResponse.setName("Java");
        skillResponse.setUserId(2L); // Owner is User 2

        learningRequest = new LearningRequest();
        learningRequest.setId(100L);
        learningRequest.setLearnerId(1L);
        learningRequest.setSkillId(10L);
        learningRequest.setMessage("I want to learn Java");
        learningRequest.setStatus("PENDING");
    }

    @Test
    void createRequest_Success() {
        when(skillFeignClient.getSkillById(10L)).thenReturn(skillResponse);
        when(learningRequestRepository.save(any(LearningRequest.class))).thenReturn(learningRequest);

        LearningRequest created = learningRequestService.createRequest(requestDTO);

        assertNotNull(created);
        assertEquals(learningRequest.getId(), created.getId());
        verify(userFeignClient).getUserById(1L);
        verify(skillFeignClient).getSkillById(10L);
        verify(learningRequestRepository).save(any(LearningRequest.class));
    }

    @Test
    void createRequest_Failure_OwnSkill() {
        skillResponse.setUserId(1L); // Owner is same as learner (User 1)
        when(skillFeignClient.getSkillById(10L)).thenReturn(skillResponse);

        RuntimeException exception = assertThrows(RuntimeException.class, () -> learningRequestService.createRequest(requestDTO));
        assertEquals("You cannot request your own skill", exception.getMessage());
        verify(learningRequestRepository, never()).save(any(LearningRequest.class));
    }

    @Test
    void getRequestById_Success() {
        when(learningRequestRepository.findById(100L)).thenReturn(Optional.of(learningRequest));

        LearningRequest found = learningRequestService.getRequestById(100L);

        assertNotNull(found);
        assertEquals(100L, found.getId());
    }

    @Test
    void getRequestById_NotFound() {
        when(learningRequestRepository.findById(999L)).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class, () -> learningRequestService.getRequestById(999L));
        assertEquals("Learning request not found", exception.getMessage());
    }

    @Test
    void updateStatus_Success() {
        when(learningRequestRepository.findById(100L)).thenReturn(Optional.of(learningRequest));
        when(learningRequestRepository.save(any(LearningRequest.class))).thenReturn(learningRequest);

        LearningRequest updated = learningRequestService.updateStatus(100L, "ACCEPTED");

        assertNotNull(updated);
        assertEquals("ACCEPTED", updated.getStatus());
    }

    @Test
    void updateStatus_InvalidStatus() {
        when(learningRequestRepository.findById(100L)).thenReturn(Optional.of(learningRequest));

        RuntimeException exception = assertThrows(RuntimeException.class, () -> learningRequestService.updateStatus(100L, "INVALID"));
        assertEquals("Invalid learning request status", exception.getMessage());
    }
}
