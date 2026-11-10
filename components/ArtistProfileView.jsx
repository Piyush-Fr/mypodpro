'use client';

import React, { useState, useEffect } from 'react';
import { 
  Play, Pause, Shuffle, Heart, Plus, ChevronLeft, Check, Star, 
  Disc, Music2, Radio, ExternalLink, Sparkles, Volume2, ChevronDown, ChevronUp
} from 'lucide-react';

export default function ArtistProfileView({
  artist,
  onBack,
  onPlayTrack,
  onPlayAll,
  onSelectAlbum,
  currentTrack,
  isPlaying,
  toggleLikeTrack,
  addToQueue,
  allTracks = [],
  theme = 'modern'
}) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [artistTracks, setArtistTracks] = useState(artist.topTracks || []);
  const [artistAlbums, setArtistAlbums] = useState(artist.albums || []);
  const [artistBio, setArtistBio] = useState(artist.bio || '');
  const [artistAvatar, setArtistAvatar] = useState(artist.avatar || null);
  const [isLoading, setIsLoading] = useState(false);
  const [showAllTracks, setShowAllTracks] = useState(false);

  // Fetch full artist catalog, top songs (20+), albums, and bio from dedicated artist API
  useEffect(() => {
    if (!artist.name) return;

    let isMounted = true;
    setIsLoading(true);

    const queryUrl = `/api/artist?name=${encodeURIComponent(artist.name)}${artist.id ? `&id=${encodeURIComponent(artist.id)}` : ''}`;

    fetch(queryUrl)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!isMounted || !data) return;

        // Local matching tracks from user library to prioritize liked state
        const localMatches = allTracks.filter(
          (t) => t.artist && t.artist.toLowerCase().includes(artist.name.toLowerCase())
        );

        const onlineTracks = data.topTracks || [];
        const combined = [...localMatches];
        onlineTracks.forEach((ot) => {
          if (!combined.some((c) => c.id === ot.id)) {
            combined.push(ot);
          }
        });

        setArtistTracks(combined);
        if (data.albums && data.albums.length > 0) {
          setArtistAlbums(data.albums);
        }
        if (data.artist?.bio) {
          setArtistBio(data.artist.bio);
        }
        if (data.artist?.avatar) {
          setArtistAvatar(data.artist.avatar);
        }
      })
      .catch((err) => {
        console.warn('Failed to load full artist catalog:', err);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [artist.name, artist.id, allTracks]);

  const formatTime = (secs) => {
    if (!secs || isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const isCurrentArtistPlaying = 
    currentTrack && 
    artistTracks.some((t) => t.id === currentTrack.id) && 
    isPlaying;

  const topSongsToDisplay = showAllTracks ? artistTracks : artistTracks.slice(0, 10);

  return (
    <div className="artist-profile-container">
      {/* 1. Top Navigation Bar */}
      <div className="artist-nav-bar">
        <button onClick={onBack} className="btn-artist-back" title="Go back">
          <ChevronLeft size={16} />
          <span>Back</span>
        </button>
        <span className="artist-nav-breadcrumb">
          Artist Profile • <strong style={{ color: 'inherit' }}>{artist.name}</strong>
        </span>
      </div>

      {/* 2. Apple Music Hero Banner */}
      <div className="artist-hero-banner">
        {/* Ambient Blur Backdrop */}
        <div 
          className="artist-hero-backdrop"
          style={{
            backgroundImage: `url(${artistAvatar || artist.avatar || artist.banner || '/art/default_album.webp'})`
          }}
        />
        <div className="artist-hero-overlay" />

        <div className="artist-hero-content">
          <div className="artist-avatar-wrapper">
            <img
              src={artistAvatar || artist.avatar || artist.banner || '/art/default_album.webp'}
              alt={artist.name}
              className="artist-avatar-img-large"
              width={160}
              height={160}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = '/art/default_album.webp';
              }}
            />
          </div>

          <div className="artist-meta-wrapper">
            <div className="artist-badge-row">
              <span className="artist-verified-pill">
                <Check size={12} strokeWidth={3} />
                <span>Verified Artist</span>
              </span>
              <span className="artist-genre-pill">{artist.genre || 'Lossless Master'}</span>
            </div>

            <h1 className="artist-hero-title">{artist.name}</h1>

            <div className="artist-hero-stats">
              <span>{artistTracks.length} Songs Available</span>
              <span className="artist-stat-dot">•</span>
              <span>{artistAlbums.length} Albums & EPs</span>
              <span className="artist-stat-dot">•</span>
              <span>Apple Lossless (ALAC)</span>
            </div>

            {/* Apple Music Action Row */}
            <div className="artist-actions-row">
              <button
                onClick={() => {
                  if (artistTracks.length > 0) {
                    onPlayAll(artistTracks, false);
                  }
                }}
                className="apple-pill-btn apple-pill-btn-primary"
                title="Play all artist songs"
              >
                {isCurrentArtistPlaying ? (
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
                  if (artistTracks.length > 0) {
                    onPlayAll(artistTracks, true);
                  }
                }}
                className="apple-pill-btn apple-pill-btn-secondary"
                title="Shuffle all songs"
              >
                <Shuffle size={14} />
                <span>Shuffle</span>
              </button>

              <button
                onClick={() => setIsFollowing(!isFollowing)}
                className={`apple-pill-btn apple-pill-btn-secondary ${isFollowing ? 'following' : ''}`}
                title={isFollowing ? 'Following' : 'Follow Artist'}
              >
                <Star size={14} fill={isFollowing ? 'currentColor' : 'none'} />
                <span>{isFollowing ? 'Following' : 'Follow'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Top Songs Section */}
      <div className="artist-section">
        <div className="artist-section-header">
          <div>
            <h2 className="artist-section-title">Songs</h2>
            <span className="artist-section-subtitle">
              {artistTracks.length > 0 ? `Showing ${topSongsToDisplay.length} of ${artistTracks.length} tracks` : 'Top catalog tracks'}
            </span>
          </div>
          {artistTracks.length > 10 && (
            <button
              onClick={() => setShowAllTracks(!showAllTracks)}
              className="btn-artist-toggle-more"
            >
              <span>{showAllTracks ? 'Show Less' : `View All (${artistTracks.length})`}</span>
              {showAllTracks ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          )}
        </div>

        {isLoading && artistTracks.length === 0 ? (
          <div className="artist-loading-box">
            <Music2 size={24} className="spin-slow" />
            <span>Loading complete artist discography...</span>
          </div>
        ) : topSongsToDisplay.length === 0 ? (
          <div className="artist-empty-box">No songs found for this artist.</div>
        ) : (
          <div className="apple-tracklist-wrap">
            <table className="track-table apple-table">
              <thead>
                <tr>
                  <th style={{ width: '45px' }}>#</th>
                  <th style={{ width: '60px' }}>Cover</th>
                  <th>Title</th>
                  <th style={{ width: '28%' }}>Album</th>
                  <th style={{ width: '80px' }}>Time</th>
                  <th style={{ width: '100px', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {topSongsToDisplay.map((track, i) => {
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
                        <span className="row-index-num">{i + 1}</span>
                      </td>

                      <td className="cell-cover" onClick={() => onPlayTrack(track)}>
                        <img
                          src={track.cover || '/art/default_album.webp'}
                          alt={track.title}
                          className="table-cover-art"
                          width={40}
                          height={40}
                          loading="lazy"
                          decoding="async"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = '/art/default_album.webp';
                          }}
                        />
                      </td>

                      <td className="cell-title" onClick={() => onPlayTrack(track)}>
                        <div className="track-title-text">{track.title}</div>
                        <div className="track-sub-text">
                          <span className="apple-lossless-inline-tag">Lossless</span>
                        </div>
                      </td>

                      <td 
                        className="cell-album" 
                        onClick={() => {
                          if (onSelectAlbum) {
                            onSelectAlbum({
                              id: `${track.album || track.title}:::${track.artist}`,
                              title: track.album || track.title,
                              artist: track.artist,
                              cover: track.cover,
                              tracks: [track],
                              year: track.year || '2024'
                            });
                          }
                        }}
                      >
                        <span className="clickable-album-link">{track.album || 'Single'}</span>
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

      {/* 4. Discography / Albums Grid */}
      {artistAlbums.length > 0 && (
        <div className="artist-section">
          <div className="artist-section-header">
            <div>
              <h2 className="artist-section-title">Albums & Releases</h2>
              <span className="artist-section-subtitle">{artistAlbums.length} studio albums and releases</span>
            </div>
          </div>

          <div className="artist-discography-grid">
            {artistAlbums.map((alb, idx) => (
              <div
                key={alb.id || idx}
                className="artist-album-card"
                onClick={() => onSelectAlbum && onSelectAlbum({
                  id: alb.id,
                  title: alb.title,
                  artist: alb.artist || artist.name,
                  cover: alb.cover,
                  year: alb.year
                })}
                title={`Open "${alb.title}" album`}
                style={{ cursor: 'pointer' }}
              >
                <div className="artist-album-cover-wrap">
                  <img
                    src={alb.cover || '/art/default_album.webp'}
                    alt={alb.title}
                    className="artist-album-cover"
                    width={180}
                    height={180}
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = '/art/default_album.webp';
                    }}
                  />
                  <div className="artist-album-hover-play">
                    <Play size={20} fill="#ffffff" color="#ffffff" />
                  </div>
                </div>
                <div className="artist-album-title">{alb.title}</div>
                <div className="artist-album-sub">{alb.year || '2024'} • Album</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Editorial Biography */}
      <div className="artist-section">
        <div className="artist-section-header">
          <h2 className="artist-section-title">About {artist.name}</h2>
        </div>

        <div className="artist-bio-card">
          <p className="artist-bio-text">
            {artistBio || 
              `${artist.name} is a celebrated musical artist featured in high-fidelity on myPod. Enjoy their full catalog with bit-perfect Apple Lossless Audio Codec (ALAC) decoding, pristine dynamic range, and seamless Cover Flow presentation.`}
          </p>
          <div className="artist-bio-footer">
            <div className="artist-bio-tag">
              <strong>Origin:</strong> Global Artist
            </div>
            <div className="artist-bio-tag">
              <strong>Quality:</strong> 24-bit / 48 kHz Lossless
            </div>
            <div className="artist-bio-tag">
              <strong>Platform:</strong> myPod Music Pro
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
