package com.delvex.server.user;

import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.delvex.server.user.dto.UpdateUserRequest;
import com.delvex.server.user.dto.UserResponse;

@Service
public class UserService {

    private static final Logger LOGGER = LoggerFactory.getLogger(
            UserService.class);

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public UserResponse getCurrentUser(UUID userId) {
        UserResponse response = UserResponse.from(findUser(userId));

        LOGGER.debug("user profile loaded userId={}", userId);

        return response;
    }

    @Transactional
    public UserResponse updateCurrentUser(
            UUID userId,
            UpdateUserRequest request) {
        User user = findUser(userId);

        user.updateProfile(
                strip(request.firstName()),
                strip(request.lastName()));

        LOGGER.info("user profile updated userId={}", userId);

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
