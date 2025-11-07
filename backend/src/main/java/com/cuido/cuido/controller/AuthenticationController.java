package com.cuido.cuido.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.cuido.cuido.dto.request.LoginRequestDTO;
import com.cuido.cuido.dto.request.RegistroRequestDTO;
import com.cuido.cuido.dto.response.JwtResponseDTO;
import com.cuido.cuido.service.AuthenticationService;

@RestController
@RequestMapping("/auth")
public class AuthenticationController {

    @Autowired
    private AuthenticationService authenticationService;

    @PostMapping("/login")
    public JwtResponseDTO login(@RequestBody LoginRequestDTO request) {
        return authenticationService.authenticate(request);
    }

    @PostMapping("/register")
    public JwtResponseDTO register(@RequestBody RegistroRequestDTO request) {
        return authenticationService.register(request);
    }
}
