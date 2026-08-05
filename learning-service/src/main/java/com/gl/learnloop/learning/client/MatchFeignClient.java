package com.gl.learnloop.learning.client;

import com.gl.learnloop.learning.dto.MatchRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "match-service")
public interface MatchFeignClient {

    @PostMapping("/api/matches")
    Object createMatch(@RequestBody MatchRequest request);
}