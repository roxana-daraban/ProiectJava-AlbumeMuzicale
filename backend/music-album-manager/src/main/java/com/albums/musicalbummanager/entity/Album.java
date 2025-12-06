package com.albums.musicalbummanager.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "albums")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Album {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @Column(name = "artist", nullable = false, length = 100)
    private String artist;

    @Column(name = "genre", length = 50)
    private String genre;

    @Column(name = "release_year")
    private Integer releaseYear;

    @Column(name = "record_label", length = 100)
    private String recordLabel;

    @Column(name = "price", precision = 10, scale = 2)
    private java.math.BigDecimal price;

    @Column(name = "stock")
    private Integer stock;

    @Column(name = "image_url", length = 500)
    private String imageUrl;
}
