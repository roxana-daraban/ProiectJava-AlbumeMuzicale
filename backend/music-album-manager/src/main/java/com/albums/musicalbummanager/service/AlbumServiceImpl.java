package com.albums.musicalbummanager.service;

import com.albums.musicalbummanager.entity.Album;
import com.albums.musicalbummanager.repository.AlbumRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class AlbumServiceImpl implements AlbumService {
    
    private final AlbumRepository albumRepository;
    
    public AlbumServiceImpl(AlbumRepository albumRepository) {
        this.albumRepository = albumRepository;
    }
    
    @Override
    public List<Album> findAll() {
        return albumRepository.findAll();
    }
    
    @Override
    public Optional<Album> findById(Long id) {
        return albumRepository.findById(id);
    }
    
    @Override
    public Album save(Album album) {
        return albumRepository.save(album);
    }
    
    @Override
    public Album update(Album album) {
        if (album.getId() != null && albumRepository.existsById(album.getId())) {
            return albumRepository.save(album);
        } else {
            throw new RuntimeException("Album not found with id: " + album.getId());
        }
    }
    
    @Override
    public void deleteById(Long id) {
        albumRepository.deleteById(id);
    }
}
