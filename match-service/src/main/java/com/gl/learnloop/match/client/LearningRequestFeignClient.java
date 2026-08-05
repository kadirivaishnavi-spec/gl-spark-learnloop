package com.gl.learnloop.match.client;

import com.gl.learnloop.match.dto.LearningRequestResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

@FeignClient(name = "learning-service")
public interface LearningRequestFeignClient {

    @GetMapping("/api/learning-requests/learner/{learnerId}/pending")
    List<LearningRequestResponse> getPendingRequestsByLearnerId(
            @PathVariable("learnerId") Long learnerId
    );

    @PutMapping("/api/learning-requests/{id}/status")
    LearningRequestResponse updateStatus(
            @PathVariable("id") Long id,
            @RequestParam("status") String status
    );
}