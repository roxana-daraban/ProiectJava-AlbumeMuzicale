package com.albums.musicalbummanager.service;

import com.albums.musicalbummanager.entity.User;
import com.albums.musicalbummanager.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;


@Service
public class UserServiceImpl implements UserService{

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserServiceImpl(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public List<User> findAll() {
        return userRepository.findAll();
    }

    @Override
    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }

    @Override
    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    @Override
    public User createUser(String username, String password, String role) {
        // Verificăm dacă username-ul există deja
        if (userRepository.existsByUsername(username)) {
            throw new RuntimeException("Username already exists: " + username);
        }

        // Hash-uim parola înainte de a o salva
        String hashedPassword = passwordEncoder.encode(password);

        // Creăm utilizatorul nou
        User user = new User(username, hashedPassword, role);
        return userRepository.save(user);
    }

    @Override
    public User updateUser(User user) {
        // Verificăm dacă utilizatorul există
        if (user.getId() != null && userRepository.existsById(user.getId())) {
            // Dacă parola a fost schimbată, o hash-uim din nou
            if (user.getPassword() != null && !user.getPassword().startsWith("$2a$")) {
                // "$2a$" este prefixul pentru BCrypt hash
                user.setPassword(passwordEncoder.encode(user.getPassword()));
            }
            return userRepository.save(user);
        } else {
            throw new RuntimeException("User not found with id: " + user.getId());
        }
    }

    @Override
    public void deleteById(Long id) {
        userRepository.deleteById(id);
    }

    @Override
    public boolean existsByUsername(String username) {
        return userRepository.existsByUsername(username);
    }
}
