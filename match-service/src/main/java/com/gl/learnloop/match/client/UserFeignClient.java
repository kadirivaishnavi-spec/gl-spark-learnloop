package com.gl.learnloop.match.client;

import com.gl.learnloop.match.dto.UserResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "user-service")
public interface UserFeignClient {

    @GetMapping("/api/users/{id}")
    UserResponse getUserById(
            @PathVariable("id") Long id
    );
}