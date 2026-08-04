package com.delvex.server.auth;

import java.util.Locale;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.delvex.server.auth.dto.RegisterRequest;
import com.delvex.server.auth.dto.RegisterResponse;
import com.delvex.server.user.User;
import com.delvex.server.user.UserRepository;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final TokenService tokenService;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, TokenService tokenService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenService = tokenService;
    }

    @Transactional
    public RegisterResponse register(RegisterRequest request) {
        String email = request.email()
                .strip()
                .toLowerCase(Locale.ROOT);

        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new EmailAlreadyExistsException();
        }

        String passwordHash = passwordEncoder.encode(request.password());

        User user = new User(
                email,
                passwordHash,
                request.firstName().strip(),
                request.lastName().strip());

        User savedUser = userRepository.save(user);

        String accessToken = tokenService.createAccessToken(
                savedUser.getId());

        return new RegisterResponse(
                savedUser.getId(),
                savedUser.getEmail(),
                savedUser.getFirstName(),
                savedUser.getLastName(),
                accessToken);
    }

}
