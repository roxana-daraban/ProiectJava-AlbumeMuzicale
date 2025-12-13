package com.albums.musicalbummanager.controller;

import com.albums.musicalbummanager.entity.Album;
import com.albums.musicalbummanager.service.AlbumService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/albums")
public class AlbumController {

    private final AlbumService albumService;

    public AlbumController(AlbumService albumService) {
        this.albumService = albumService;
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
    @PreAuthorize("hasAnyRole('EDITOR', 'ADMIN')")
    public ResponseEntity<Album> createAlbum(@RequestBody Album album) {
        Album savedAlbum = albumService.save(album);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedAlbum);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('EDITOR', 'ADMIN')")
    public ResponseEntity<Album> updateAlbum(@PathVariable Long id, @RequestBody Album album) {
        album.setId(id);
        try {
            Album updatedAlbum = albumService.update(album);
            return ResponseEntity.ok(updatedAlbum);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('EDITOR', 'ADMIN')")
    public ResponseEntity<Void> deleteAlbum(@PathVariable Long id) {
        if (albumService.findById(id).isPresent()) {
            albumService.deleteById(id);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}