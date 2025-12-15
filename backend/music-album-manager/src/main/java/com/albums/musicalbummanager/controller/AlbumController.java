package com.albums.musicalbummanager.controller;

import com.albums.musicalbummanager.entity.Album;
import com.albums.musicalbummanager.entity.User;
import com.albums.musicalbummanager.service.AlbumService;
import com.albums.musicalbummanager.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Objects;

@RestController
@RequestMapping("/api/albums")
public class AlbumController {

    private final AlbumService albumService;
    private final UserService userService;

    // CORECT: Constructor cu ambele servicii
    public AlbumController(AlbumService albumService, UserService userService) {
        this.albumService = albumService;
        this.userService = userService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('USER', 'EDITOR', 'ADMIN')")
    public ResponseEntity<List<Album>> getAllAlbums() {
        List<Album> albums = albumService.findAll();
        return ResponseEntity.ok(albums);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER', 'EDITOR', 'ADMIN')")
    public ResponseEntity<Album> getAlbumById(@PathVariable Long id) {
        return albumService.findById(id)
                .map(album -> ResponseEntity.ok(album))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('USER', 'EDITOR', 'ADMIN')")
    public ResponseEntity<Album> createAlbum(@Valid @RequestBody Album album) {
        // Obținem ID-ul utilizatorului autentificat
        Long currentUserId = getCurrentUserId();

        // Setăm userId pe album
        album.setUserId(currentUserId);

        // Salvăm albumul
        Album savedAlbum = albumService.save(album);

        // Verificăm dacă user-ul are rolul "USER" și îl promovăm la "EDITOR"
        User currentUser = userService.findById(currentUserId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Verificăm rolul fără prefixul "ROLE_" (poate fi "USER" sau "ROLE_USER")
        String role = normalizeRole(currentUser.getRole());
        if ("USER".equals(role)) {
            // Promovăm user-ul la EDITOR
            currentUser.setRole("EDITOR");
            userService.updateUser(currentUser);
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(savedAlbum);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('EDITOR', 'ADMIN')")
    public ResponseEntity<Album> updateAlbum(@PathVariable Long id, @Valid @RequestBody Album albumDetails) {
        Album existingAlbum = albumService.findById(id)
                .orElseThrow(() -> new RuntimeException("Album not found"));

        // Obținem user-ul curent
        Long currentUserId = getCurrentUserId();
        User currentUser = userService.findById(currentUserId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Verificăm rolul normalizat (fără prefixul "ROLE_")
        String role = normalizeRole(currentUser.getRole());
        boolean isAdmin = "ADMIN".equals(role);
        
        // Verificăm ownership (null-safe comparison)
        boolean isOwner = existingAlbum.getUserId() != null && 
                         Objects.equals(existingAlbum.getUserId(), currentUserId);

        // Verificăm permisiunile:
        // - ADMIN poate edita orice album
        // - EDITOR poate edita doar propriile albume
        if (!isAdmin && !isOwner) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        // Actualizăm câmpurile
        existingAlbum.setTitle(albumDetails.getTitle());
        existingAlbum.setArtist(albumDetails.getArtist());
        existingAlbum.setGenre(albumDetails.getGenre());
        existingAlbum.setReleaseYear(albumDetails.getReleaseYear());
        existingAlbum.setRecordLabel(albumDetails.getRecordLabel());
        existingAlbum.setPrice(albumDetails.getPrice());
        existingAlbum.setStock(albumDetails.getStock());
        existingAlbum.setImageUrl(albumDetails.getImageUrl());

        // IMPORTANT: Nu permitem schimbarea userId-ului la editare
        // (userId rămâne același - albumul rămâne al celui care l-a creat)

        Album updatedAlbum = albumService.save(existingAlbum);
        return ResponseEntity.ok(updatedAlbum);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('EDITOR', 'ADMIN')")
    public ResponseEntity<Void> deleteAlbum(@PathVariable Long id) {
        Album album = albumService.findById(id)
                .orElseThrow(() -> new RuntimeException("Album not found"));

        // Obținem user-ul curent
        Long currentUserId = getCurrentUserId();
        User currentUser = userService.findById(currentUserId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Verificăm rolul normalizat (fără prefixul "ROLE_")
        String role = normalizeRole(currentUser.getRole());
        boolean isAdmin = "ADMIN".equals(role);
        
        // Verificăm ownership (null-safe comparison)
        boolean isOwner = album.getUserId() != null && 
                         Objects.equals(album.getUserId(), currentUserId);

        // Verificăm permisiunile:
        // - ADMIN poate șterge orice album
        // - EDITOR poate șterge doar propriile albume
        if (!isAdmin && !isOwner) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        albumService.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // Metodă helper pentru a obține ID-ul utilizatorului autentificat
    private Long getCurrentUserId() {
        // Obținem username-ul din SecurityContext
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();

        // Găsim user-ul în baza de date (folosim entitatea User, nu Spring Security User)
        User user = userService.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return user.getId();
    }

    /**
     * Normalizează rolul eliminând prefixul "ROLE_" dacă există.
     * De exemplu: "ROLE_ADMIN" -> "ADMIN", "ADMIN" -> "ADMIN"
     */
    private String normalizeRole(String role) {
        if (role == null || role.isEmpty()) {
            return "USER"; // Default
        }
        // Eliminăm prefixul "ROLE_" dacă există
        if (role.startsWith("ROLE_")) {
            return role.substring(5); // "ROLE_ADMIN" -> "ADMIN"
        }
        return role;
    }
}