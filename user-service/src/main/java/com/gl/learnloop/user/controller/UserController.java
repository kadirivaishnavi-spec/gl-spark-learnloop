package com.gl.learnloop.user.controller;

import com.gl.learnloop.user.dto.LoginRequest;
import com.gl.learnloop.user.dto.LoginResponse;
import com.gl.learnloop.user.dto.UserRegistrationRequest;
import com.gl.learnloop.user.dto.UserResponse;
import com.gl.learnloop.user.entity.User;
import com.gl.learnloop.user.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(
            @Valid @RequestBody UserRegistrationRequest request) {

        User user = userService.register(request);

        UserResponse response = new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail()
        );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @Valid @RequestBody LoginRequest request) {

        String token = userService.login(
                request.getEmail(),
                request.getPassword()
        );

        return ResponseEntity.ok(
                new LoginResponse(token)
        );
    }
}