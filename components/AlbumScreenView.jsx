'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Play, Pause, Shuffle, Heart, Plus, ChevronLeft, 
  Disc, Music2, Share2, Sparkles, FolderHeart, Clock
} from 'lucide-react';

export default function AlbumScreenView({
  album,
  onBack,
  onPlayTrack,
  onPlayAll,
  onSelectArtist,
  currentTrack,
  isPlaying,
  toggleLikeTrack,
  toggleLikeAlbum,
  addToQueue,
  allTracks = [],
  theme = 'modern'
}) {
  const isPlaylist = album.type === 'playlist' || album.id === 'liked-music-playlist';
  const [albumTracks, setAlbumTracks] = useState(album.tracks || []);
  const [albumMeta, setAlbumMeta] = useState(album);
  const [isLoadingTracks, setIsLoadingTracks] = useState(false);

  // Automatically fetch full album tracklist if online album has fewer than 2 tracks
  useEffect(() => {
    setAlbumMeta(album);

    if (isPlaylist) {
      setAlbumTracks(album.tracks || []);
      return;
    }

    if (album.tracks && album.tracks.length > 2) {
      setAlbumTracks(album.tracks);
      return;
    }

    let isMounted = true;
    setIsLoadingTracks(true);

    const queryUrl = `/api/album?id=${encodeURIComponent(album.id || '')}&title=${encodeURIComponent(album.title || '')}&artist=${encodeURIComponent(album.artist || '')}`;

    fetch(queryUrl)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!isMounted || !data || !data.album) return;
        const onlineTracks = data.album.tracks || [];
        if (onlineTracks.length > 0) {
          setAlbumTracks(onlineTracks);
          setAlbumMeta((prev) => ({
            ...prev,
            title: data.album.title || prev.title,
            artist: data.album.artist || prev.artist,
            year: data.album.year || prev.year,
            cover: data.album.cover || prev.cover
          }));
        }
      })
      .catch((err) => {
        console.warn('Failed to load full album tracks:', err);
      })
      .finally(() => {
        if (isMounted) setIsLoadingTracks(false);
      });

    return () => {
      isMounted = false;
    };
  }, [album, isPlaylist]);

  const formatTime = (secs) => {
    if (!secs || isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const totalDurationSecs = useMemo(() => {
    return albumTracks.reduce((acc, t) => acc + (t.duration || 0), 0);
  }, [albumTracks]);

  const totalDurationFormatted = useMemo(() => {
    const totalMinutes = Math.round(totalDurationSecs / 60);
    if (totalMinutes >= 60) {
      const hours = Math.floor(totalMinutes / 60);
      const mins = totalMinutes % 60;
      return `${hours} hr ${mins} min`;
    }
    return `${totalMinutes} minutes`;
  }, [totalDurationSecs]);

  const isCurrentAlbumPlaying = 
    currentTrack && 
    albumTracks.some((t) => t.id === currentTrack.id) && 
    isPlaying;

  const isAlbumFullyLiked = useMemo(() => {
    if (albumTracks.length === 0) return false;
    return albumTracks.every((t) => allTracks.some((at) => at.id === t.id && at.isLiked));
  }, [albumTracks, allTracks]);

  return (
    <div className="album-screen-container">
      {/* 1. Back Navigation & Breadcrumb */}
      <div className="album-nav-bar">
        <button onClick={onBack} className="btn-album-back" title="Go back">
          <ChevronLeft size={16} />
          <span>Back</span>
        </button>
        <span className="album-nav-breadcrumb">
          {isPlaylist ? 'Playlists' : 'Albums'} • <strong style={{ color: 'inherit' }}>{albumMeta.title}</strong>
        </span>
      </div>

      {/* 2. Apple Music Album Header */}
      <div className="album-hero-header">
        {/* Left Column: Artwork */}
        <div className="album-cover-col">
          {isPlaylist && (!albumMeta.cover || albumMeta.cover.includes('liked_music') || albumMeta.id === 'liked-music-playlist') ? (
            <div className="playlist-art-hero gradient-liked-music">
              <Heart size={64} fill="#ffffff" color="#ffffff" className="hero-heart-glyph" />
            </div>
          ) : (
            <div className="album-cover-frame">
              <img
                src={albumMeta.cover || '/art/default_album.webp'}
                alt={albumMeta.title}
                className="album-hero-art"
                width={240}
                height={240}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = '/art/default_album.webp';
                }}
              />
              <div className="album-cover-reflection">
                <img
                  src={albumMeta.cover || '/art/default_album.webp'}
                  alt=""
                  aria-hidden="true"
                  width={240}
                  height={240}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = '/art/default_album.webp';
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Metadata & Actions */}
        <div className="album-meta-col">
          <div className="album-eyebrow-tag">
            {isPlaylist ? 'PLAYLIST' : 'ALBUM'}
          </div>

          <h1 className="album-hero-title">{albumMeta.title}</h1>

          {/* Artist link row */}
          <div className="album-artist-row">
            {!isPlaylist && (
              <span
                className="album-artist-link"
                onClick={() => onSelectArtist && onSelectArtist(albumMeta.artist, albumMeta.cover)}
                title="View artist profile"
              >
                {albumMeta.artist}
              </span>
            )}
            {isPlaylist && (
              <span className="album-curator-label">
                Curated by You • Synchronized to Cover Flow
              </span>
            )}
          </div>

          {/* Specs: Genre, Year, Tracks, Duration */}
          <div className="album-specs-row">
            <span>{albumMeta.genre || (isPlaylist ? 'Curated Favorites' : 'Lossless Audio')}</span>
            <span className="spec-dot">•</span>
            <span>{albumMeta.year || '2024'}</span>
            <span className="spec-dot">•</span>
            <span>{albumTracks.length} {albumTracks.length === 1 ? 'song' : 'songs'}{albumTracks.length > 0 ? `, ${totalDurationFormatted}` : ''}</span>
          </div>

          {/* Apple Music Lossless Spec Badge */}
          <div className="album-audio-badge-row">
            <span className="apple-lossless-spec-pill">
              <svg width="13" height="9" viewBox="0 0 14 9" fill="currentColor" className="al-icon">
                <path fillRule="evenodd" d="M4.5522,0C4.8969,0 5.205,0.1229 5.4844,0.3361C5.5808,0.4095 5.6939,0.5149 5.7751,0.6012C7.2178,2.136 7.8307,6.1801 8.804,7.8187C8.8851,7.9552 8.9397,8.0258 8.9618,8.0559C9.1839,8.3565 9.4261,8.535 9.7017,8.535C9.7951,8.535 9.8926,8.513 9.9941,8.4706C10.091,8.5776 10.1918,8.6744 10.2966,8.7588C10.0427,8.9239 9.7355,9 9.4478,9C9.1031,9 8.795,8.8771 8.5156,8.664C8.4374,8.6043 8.3179,8.4978 8.2249,8.3989C6.7822,6.864 6.1693,2.8199 5.1959,1.1813C4.9026,0.6879 4.5245,0.3133 4.0059,0.5294C3.9089,0.4222 3.8082,0.3258 3.7033,0.2411C3.9572,0.0761 4.2643,0 4.5522,0ZM2.3869,0.0214C5.5605,-0.4229 5.8126,8.535 7.7911,8.535C7.884,8.535 7.981,8.5132 8.0818,8.4714C8.1792,8.5788 8.2807,8.6743 8.386,8.7589C8.132,8.9238 7.8249,9 7.537,9C5.8045,9 4.9435,5.8448 4.2734,3.724C4.229,3.5835 4.1847,3.4448 4.1405,3.3079C3.8674,2.4631 3.5948,1.7027 3.2851,1.1814C3.2223,1.0754 3.1578,0.9796 3.0916,0.8947C2.7131,0.4102 2.305,0.329 1.8286,0.6833C0.8287,1.4214 0.3651,3.8953 0.2183,5.1524L0.2183,5.1524C0.2107,5.2178 0.1637,5.2595 0.1092,5.2595C0.1048,5.2595 0.1005,5.2593 0.0961,5.2587C0.0362,5.2514 -0.0064,5.1959 0.0008,5.1346L0.0008,5.1346C0.2175,3.7154 0.5767,1.2827 1.6123,0.3783C1.8147,0.1972 2.0896,0.0629 2.3869,0.0214ZM6.4629,0C8.1955,0 9.0565,3.1564 9.7265,5.276C9.771,5.4165 9.8153,5.5553 9.8595,5.692C10.1326,6.537 10.4052,7.2972 10.7148,7.8186C10.7777,7.9245 10.8422,8.0205 10.9085,8.1053C11.1207,8.3769 11.3516,8.535 11.6124,8.535C11.7848,8.535 11.9702,8.4663 12.1713,8.3167C13.1712,7.5786 13.6348,5.1048 13.7816,3.8477L13.7816,3.8477C13.7893,3.7822 13.8364,3.7406 13.8908,3.7406C13.8952,3.7406 13.8996,3.7408 13.9039,3.7414C13.9637,3.7486 14.0063,3.8042 13.9992,3.8653L13.9992,3.8653C13.7825,5.2845 13.4234,7.7172 12.3876,8.6217C12.1016,8.8779 11.7247,9 11.3584,9C8.4607,9 8.1211,0.465 6.2089,0.465C6.116,0.465 6.0191,0.4868 5.9182,0.5286C5.8209,0.4213 5.7194,0.3257 5.614,0.2412C5.868,0.0761 6.1751,0 6.4629,0Z" />
              </svg>
              <span>Lossless</span>
            </span>
            <span className="album-audio-spec-text">ALAC 24-bit / 48 kHz Lossless</span>
          </div>

          {/* Action Row */}
          <div className="album-action-row">
            <button
              onClick={() => {
                if (albumTracks.length > 0) {
                  onPlayAll(albumTracks, false);
                }
              }}
              className="apple-pill-btn apple-pill-btn-primary"
              title="Play album from start"
            >
              {isCurrentAlbumPlaying ? (
                <>
                  <Pause size={15} fill="currentColor" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play size={15} fill="currentColor" />
                  <span>Play</span>
                </>
              )}
            </button>

            <button
              onClick={() => {
                if (albumTracks.length > 0) {
                  onPlayAll(albumTracks, true);
                }
              }}
              className="apple-pill-btn apple-pill-btn-secondary"
              title="Shuffle album"
            >
              <Shuffle size={14} />
              <span>Shuffle</span>
            </button>

            <button
              onClick={() => {
                if (toggleLikeAlbum) {
                  toggleLikeAlbum({ ...albumMeta, tracks: albumTracks });
                } else if (albumTracks.length > 0) {
                  albumTracks.forEach((t) => toggleLikeTrack(t.id, t));
                }
              }}
              className="apple-pill-btn apple-pill-btn-secondary"
              title={isAlbumFullyLiked ? 'Album saved to Liked Music' : 'Save all tracks to Liked Music'}
            >
              <Heart
                size={14}
                fill={isAlbumFullyLiked ? '#ef4444' : 'none'}
                color={isAlbumFullyLiked ? '#ef4444' : 'currentColor'}
              />
              <span>{isAlbumFullyLiked ? 'Liked' : 'Like All'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Apple Music Tracklist Table */}
      <div className="album-tracklist-section">
        {isLoadingTracks && albumTracks.length === 0 ? (
          <div className="album-loading-box">
            <Music2 size={24} className="spin-slow" />
            <span>Loading full album tracks in lossless clarity...</span>
          </div>
        ) : albumTracks.length === 0 ? (
          <div className="album-empty-box">
            <Music2 size={32} color="#666" style={{ marginBottom: '8px' }} />
            <p>No tracks in this {isPlaylist ? 'playlist' : 'album'}.</p>
          </div>
        ) : (
          <div className="apple-tracklist-wrap">
            <table className="track-table apple-table">
              <thead>
                <tr>
                  <th style={{ width: '45px' }}>#</th>
                  <th>Title</th>
                  <th style={{ width: '28%' }}>Artist</th>
                  <th style={{ width: '80px' }}>Time</th>
                  <th style={{ width: '100px', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {albumTracks.map((track, i) => {
                  const isCurrent = currentTrack && currentTrack.id === track.id;
                  const isLiked = allTracks.some((t) => t.id === track.id && t.isLiked);

                  return (
                    <tr
                      key={track.id || i}
                      className={`track-row ${isCurrent ? 'playing' : ''}`}
                      onDoubleClick={() => onPlayTrack(track)}
                    >
                      <td className="cell-num">
                        {isCurrent && isPlaying ? (
                          <div className="apple-sound-wave">
                            <span className="bar bar-1" />
                            <span className="bar bar-2" />
                            <span className="bar bar-3" />
                          </div>
                        ) : (
                          <button
                            onClick={() => onPlayTrack(track)}
                            className="btn-row-play"
                            title="Play Track"
                          >
                            <Play size={11} fill="currentColor" />
                          </button>
                        )}
                        <span className="row-index-num">{track.trackNumber || (i + 1)}</span>
                      </td>

                      <td className="cell-title" onClick={() => onPlayTrack(track)}>
                        <div className="track-title-text">{track.title}</div>
                        <div className="track-sub-text">
                          <span className="apple-lossless-inline-tag">Lossless</span>
                        </div>
                      </td>

                      <td 
                        className="cell-artist"
                        onClick={() => onSelectArtist && onSelectArtist(track.artist, track.cover)}
                      >
                        <span className="clickable-artist-link">{track.artist}</span>
                      </td>

                      <td className="cell-time">{formatTime(track.duration)}</td>

                      <td className="cell-actions" onClick={(e) => e.stopPropagation()}>
                        <div className="actions-cluster">
                          <button
                            onClick={() => addToQueue(track)}
                            className="btn-icon-heart"
                            title="Add to Up Next Queue"
                          >
                            <Plus size={15} color="#38bdf8" />
                          </button>
                          <button
                            onClick={() => toggleLikeTrack(track.id, track)}
                            className="btn-icon-heart"
                            title={isLiked ? 'Remove from Liked Music' : 'Add to Liked Music & Cover Flow'}
                          >
                            <Heart
                              size={15}
                              fill={isLiked ? '#ef4444' : 'none'}
                              color={isLiked ? '#ef4444' : '#888888'}
                            />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 4. Editorial & Legal Footer */}
      <div className="album-footer-note">
        <p className="album-copyright">
          ℗ {albumMeta.year || '2024'} myPod Music LLC. Apple Lossless Audio Codec (ALAC) bit-perfect master.
        </p>
        <p className="album-lossless-disclaimer">
          Lossless audio retains 100% of the original studio recording data at up to 24-bit / 48 kHz.
        </p>
      </div>
    </div>
  );
}
