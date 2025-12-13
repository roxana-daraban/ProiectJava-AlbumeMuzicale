package com.albums.musicalbummanager.controller;
import com.albums.musicalbummanager.dto.AuthResponse;
import com.albums.musicalbummanager.dto.LoginRequest;
import com.albums.musicalbummanager.dto.RegisterRequest;
import com.albums.musicalbummanager.entity.User;
import com.albums.musicalbummanager.service.UserService;
import com.albums.musicalbummanager.config.JwtUtils;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final UserService userService;
    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;
    private final UserDetailsService userDetailsService;

    public AuthController(UserService userService,
                          AuthenticationManager authenticationManager,
                          JwtUtils jwtUtils,
                          UserDetailsService userDetailsService) {
        this.userService = userService;
        this.authenticationManager = authenticationManager;
        this.jwtUtils = jwtUtils;
        this.userDetailsService = userDetailsService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        try {
            // Creăm user cu rolul default "USER"
            User user = userService.createUser(
                    request.getUsername(),
                    request.getPassword(),
                    "USER"  // Rol fix "USER" pentru toți utilizatorii noi
            );

            // Load user pentru a genera token
            UserDetails userDetails = userDetailsService.loadUserByUsername(request.getUsername());
            String token = jwtUtils.generateToken(userDetails);

            return ResponseEntity.status(HttpStatus.CREATED).body(
                    new AuthResponse(token, user.getUsername(), user.getRole())
            );
        } catch (RuntimeException e) {
            // Username deja existent
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        try {
            // Autentificăm utilizatorul (verifică username + password)
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getUsername(),
                            request.getPassword()
                    )
            );

            // Dacă autentificarea reușește, generăm token
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            String token = jwtUtils.generateToken(userDetails);

            // Găsim utilizatorul pentru a obține rolul
            User user = userService.findByUsername(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Returnăm răspuns cu token
            AuthResponse response = new AuthResponse(token, user.getUsername(), user.getRole());
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            // Dacă credențialele sunt greșite
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Error: Invalid username or password");
        }
    }
}
