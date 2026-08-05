package com.gl.learnloop.feedback.service;

import com.gl.learnloop.feedback.client.MatchFeignClient;
import com.gl.learnloop.feedback.client.UserFeignClient;
import com.gl.learnloop.feedback.dto.FeedbackRequest;
import com.gl.learnloop.feedback.entity.Feedback;
import com.gl.learnloop.feedback.repository.FeedbackRepository;
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
class FeedbackServiceTest {

    @Mock
    private FeedbackRepository feedbackRepository;

    @Mock
    private UserFeignClient userFeignClient;

    @Mock
    private MatchFeignClient matchFeignClient;

    @InjectMocks
    private FeedbackService feedbackService;

    private FeedbackRequest request;
    private Feedback feedback;

    @BeforeEach
    void setUp() {
        request = new FeedbackRequest();
        request.setUserId(1L);
        request.setMatchId(100L);
        request.setRating(5);
        request.setComment("Great learning experience");

        feedback = new Feedback();
        feedback.setId(10L);
        feedback.setUserId(1L);
        feedback.setMatchId(100L);
        feedback.setRating(5);
        feedback.setComment("Great learning experience");
    }

    @Test
    void createFeedback_Success() {
        when(userFeignClient.getUserById(1L)).thenReturn(new Object());
        when(matchFeignClient.getMatchById(100L)).thenReturn(new Object());
        when(feedbackRepository.save(any(Feedback.class))).thenReturn(feedback);

        Feedback created = feedbackService.createFeedback(request);

        assertNotNull(created);
        assertEquals(10L, created.getId());
        assertEquals(5, created.getRating());
        verify(feedbackRepository).save(any(Feedback.class));
    }

    @Test
    void createFeedback_Failure_UserNotFound() {
        when(userFeignClient.getUserById(1L)).thenThrow(new RuntimeException("User not found"));

        RuntimeException exception = assertThrows(RuntimeException.class, () -> feedbackService.createFeedback(request));
        assertEquals("User not found", exception.getMessage());
        verify(feedbackRepository, never()).save(any(Feedback.class));
    }

    @Test
    void getFeedbackById_Success() {
        when(feedbackRepository.findById(10L)).thenReturn(Optional.of(feedback));

        Feedback found = feedbackService.getFeedbackById(10L);

        assertNotNull(found);
        assertEquals(10L, found.getId());
    }

    @Test
    void getFeedbackById_NotFound() {
        when(feedbackRepository.findById(99L)).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class, () -> feedbackService.getFeedbackById(99L));
        assertEquals("Feedback not found", exception.getMessage());
    }

    @Test
    void updateFeedback_Success() {
        when(feedbackRepository.findById(10L)).thenReturn(Optional.of(feedback));
        when(feedbackRepository.save(any(Feedback.class))).thenReturn(feedback);

        Feedback updated = feedbackService.updateFeedback(10L, request);

        assertNotNull(updated);
        assertEquals(10L, updated.getId());
    }

    @Test
    void deleteFeedback_NotFound() {
        when(feedbackRepository.existsById(99L)).thenReturn(false);

        RuntimeException exception = assertThrows(RuntimeException.class, () -> feedbackService.deleteFeedback(99L));
        assertEquals("Feedback not found", exception.getMessage());
    }
}
