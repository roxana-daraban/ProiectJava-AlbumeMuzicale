package com.albums.musicalbummanager.repository;

import com.albums.musicalbummanager.entity.Album;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AlbumRepository extends JpaRepository<Album, Long> {
}
