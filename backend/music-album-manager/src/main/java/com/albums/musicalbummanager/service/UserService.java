package com.albums.musicalbummanager.service;

import com.albums.musicalbummanager.entity.User;

import java.util.List;
import java.util.Optional;

public interface UserService {
    List<User> findAll();
    Optional<User> findById(Long id);
    Optional<User> findByUsername(String username);
    User createUser(String username, String password, String role);
    User updateUser(User user);
    void deleteById(Long id);
    boolean existsByUsername(String username);
}
