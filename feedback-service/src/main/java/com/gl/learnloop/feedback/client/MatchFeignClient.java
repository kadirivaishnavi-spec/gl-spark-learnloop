package com.gl.learnloop.feedback.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "match-service")
public interface MatchFeignClient {

    @GetMapping("/api/matches/{id}")
    Object getMatchById(@PathVariable("id") Long id);
}
