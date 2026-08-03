package com.gl.learnloop.learning.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "skill-service")
public interface SkillFeignClient {

    @GetMapping("/api/skills/{id}")
    Object getSkillById(@PathVariable("id") Long id);
}