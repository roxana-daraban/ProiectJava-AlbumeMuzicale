package com.albums.musicalbummanager.service;

import com.albums.musicalbummanager.entity.Album;

import java.util.List;
import java.util.Optional;

public interface AlbumService {
    List<Album> findAll();
    Optional<Album> findById(Long id);
    Album save(Album album);
    Album update(Album album);
    void deleteById(Long id);
}
