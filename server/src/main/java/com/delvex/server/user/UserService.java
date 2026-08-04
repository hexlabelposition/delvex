package com.delvex.server.user;

import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.delvex.server.user.dto.UpdateUserRequest;
import com.delvex.server.user.dto.UserResponse;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public UserResponse getCurrentUser(UUID userId) {
        return UserResponse.from(findUser(userId));
    }

    @Transactional
    public UserResponse updateCurrentUser(
            UUID userId,
            UpdateUserRequest request) {
        User user = findUser(userId);

        user.updateProfile(
                strip(request.firstName()),
                strip(request.lastName()));

        return UserResponse.from(user);
    }

    private User findUser(UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(UserNotFoundException::new);
    }

    private String strip(String value) {
        return value == null ? null : value.strip();
    }
}
