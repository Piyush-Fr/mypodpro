import { Innertube } from 'youtubei.js';

let ytPromise = null;

export async function getYT() {
  if (!ytPromise) {
    ytPromise = Innertube.create({
      retrieve_player: true,
      enable_session_cache: true
    }).catch((err) => {
      ytPromise = null;
      throw err;
    });
  }
  return ytPromise;
}

const STREAM_CLIENTS = ['VISIONOS', 'ANDROID_VR', 'IOS', 'WEB', 'YTMUSIC'];
let preferredClientIdx = 0;

// Quality target itags
const QUALITY_ITAG_PREFERENCE = {
  lossless: [251, 141, 140, 250, 249, 139],
  high: [140, 251, 141, 250, 249, 139],
  medium: [250, 140, 249, 139, 251],
  low: [249, 139, 250, 140, 251]
};

// Stream Cache: key -> { url, mime, itag, expiresAt }
const streamCache = new Map();

function setBoundedCache(map, key, value, maxItems = 200) {
  if (map.size >= maxItems) {
    const oldestKey = map.keys().next().value;
    if (oldestKey) map.delete(oldestKey);
  }
  map.set(key, value);
}

function cleanCache() {
  const now = Date.now();
  for (const [key, item] of streamCache.entries()) {
    if (now > item.expiresAt) {
      streamCache.delete(key);
    }
  }
}

export function cleanTitle(str = '') {
  if (typeof str !== 'string') {
    str = str?.text || String(str || '');
  }
  return str
    .replace(/\s*[\(\[](?:official\s*(?:music\s*)?video|official\s*audio|lyric\s*video|audio|visualizer|4k|remastered|hd|hq|music\s*video)[\)\]]/gi, '')
    .trim();
}

export function getHdCover(thumbUrl) {
  if (!thumbUrl) return '/art/default_album.webp';
  if (thumbUrl.includes('=w')) {
    return thumbUrl.replace(/=w\d+-h\d+.*$/, '=w600-h600-l90-rj');
  }
  return thumbUrl.replace(/\?.*$/, '');
}

export async function resolveStream(videoId, quality = 'lossless', forceFresh = false) {
  cleanCache();
  const cacheKey = `${videoId}:${quality}`;
  if (!forceFresh) {
    const cached = streamCache.get(cacheKey);
    if (cached && Date.now() < cached.expiresAt) {
      return cached;
    }
  } else {
    streamCache.delete(cacheKey);
  }

  const yt = await getYT();
  const targetItags = QUALITY_ITAG_PREFERENCE[quality] || QUALITY_ITAG_PREFERENCE.lossless;
  let lastErr = null;

  for (let round = 0; round < 2; round++) {
    for (let i = 0; i < STREAM_CLIENTS.length; i++) {
      const clientIdx = (preferredClientIdx + i) % STREAM_CLIENTS.length;
      const client = STREAM_CLIENTS[clientIdx];

      try {
        const info = await yt.getBasicInfo(videoId, { client });
        const sd = info?.streaming_data;
        if (!sd) continue;

        const audioFormats = (sd.adaptive_formats || []).filter(
          (f) => f && f.has_audio && !f.has_video
        );

        if (!audioFormats.length) continue;

        // Sort candidates based on target preference
        const sorted = [...audioFormats].sort((a, b) => {
          const rankA = targetItags.indexOf(a.itag);
          const rankB = targetItags.indexOf(b.itag);
          const valA = rankA === -1 ? 999 : rankA;
          const valB = rankB === -1 ? 999 : rankB;
          if (valA !== valB) return valA - valB;
          return (b.bitrate || 0) - (a.bitrate || 0);
        });

        const chosen = sorted[0];
        let url = chosen.url;

        if (!url && typeof chosen.decipher === 'function' && yt.session?.player) {
          try {
            url = await chosen.decipher(yt.session.player);
          } catch {}
        }

        if (url) {
          preferredClientIdx = clientIdx;
          const result = {
            url,
            mime: chosen.mime_type || 'audio/webm',
            itag: chosen.itag,
            bitrate: chosen.bitrate,
            contentLength: chosen.content_length ? Number(chosen.content_length) : undefined,
            expiresAt: Date.now() + 4 * 60 * 60 * 1000 // 4 hours
          };
          setBoundedCache(streamCache, cacheKey, result, 300);
          return result;
        }
      } catch (err) {
        lastErr = err;
      }
    }

    if (round === 0) {
      ytPromise = null; // Re-create session if all clients failed once
    }
  }

  throw lastErr || new Error('Could not resolve playable audio stream for ' + videoId);
}

/**
 * Standard track search (backward compatible)
 */
export async function searchTracks(query) {
  const res = await searchComprehensive(query, 'songs');
  return res.tracks;
}

// In-memory response caches with TTL for blazingly fast navigation
const artistCache = new Map();
const albumCache = new Map();
const searchCache = new Map();

/**
 * Comprehensive multi-category search: songs, albums, and artists
 */
export async function searchComprehensive(query, category = 'all') {
  const q = (query || '').trim();
  if (!q) return { tracks: [], albums: [], artists: [] };

  const cacheKey = `${q.toLowerCase()}:${category}`;
  const cached = searchCache.get(cacheKey);
  if (cached && Date.now() < cached.expiresAt) {
    return cached.data;
  }

  const yt = await getYT();

  try {
    const [songRes, albumRes, artistRes] = await Promise.allSettled([
      yt.music.search(q, { type: 'song' }),
      yt.music.search(q, { type: 'album' }),
      yt.music.search(q, { type: 'artist' })
    ]);

    const rawSongs = songRes.status === 'fulfilled' ? songRes.value.songs?.contents || [] : [];
    const rawAlbums = albumRes.status === 'fulfilled' ? albumRes.value.albums?.contents || [] : [];
    const rawArtists = artistRes.status === 'fulfilled' ? artistRes.value.artists?.contents || [] : [];

    let tracks = rawSongs.map((item) => {
      const hdCover = getHdCover(item.thumbnails?.[0]?.url);
      const artists = Array.isArray(item.artists)
        ? item.artists.map((a) => a.name).join(', ')
        : (item.artists?.name || 'Unknown Artist');

      return {
        id: item.id,
        title: cleanTitle(item.title || 'Unknown Title'),
        artist: artists,
        album: item.album?.name || 'Single',
        duration: item.duration?.seconds || 200,
        cover: hdCover,
        src: `/api/stream/proxy?id=${item.id}`,
        isOnline: true,
        isLiked: false
      };
    });

    // If songs are sparse (< 8), supplement with general search for maximum music availability
    if (tracks.length < 8) {
      try {
        const generalSearch = await yt.search(q);
        const videos = generalSearch.videos || [];
        const seenIds = new Set(tracks.map((t) => t.id));

        for (const item of videos.slice(0, 15)) {
          if (!item.id || seenIds.has(item.id)) continue;
          seenIds.add(item.id);
          tracks.push({
            id: item.id,
            title: cleanTitle(item.title?.text || item.title || 'Unknown Title'),
            artist: item.author?.name || 'Various Artists',
            album: 'Online Stream',
            duration: item.duration?.seconds || 200,
            cover: getHdCover(item.thumbnails?.[0]?.url),
            src: `/api/stream/proxy?id=${item.id}`,
            isOnline: true,
            isLiked: false
          });
        }
      } catch {}
    }

    const albums = rawAlbums.map((item) => {
      const hdCover = getHdCover(item.thumbnails?.[0]?.url);
      const artists = Array.isArray(item.artists)
        ? item.artists.map((a) => a.name).join(', ')
        : (item.artists?.name || item.artists || 'Various Artists');

      return {
        id: item.id,
        title: item.title || 'Unknown Album',
        artist: artists,
        year: item.year || '2024',
        cover: hdCover,
        type: 'album'
      };
    });

    const artists = rawArtists.map((item) => {
      const hdAvatar = getHdCover(item.thumbnails?.[0]?.url);
      return {
        id: item.id,
        name: item.name || 'Unknown Artist',
        avatar: hdAvatar,
        subscribers: item.subscribers || '',
        type: 'artist'
      };
    });

    const result = { tracks, albums, artists };
    setBoundedCache(searchCache, cacheKey, { data: result, expiresAt: Date.now() + 30 * 60 * 1000 }, 150);
    return result;
  } catch (err) {
    console.error('searchComprehensive error:', err);
    return { tracks: [], albums: [], artists: [] };
  }
}

/**
 * Fetch full artist catalog: top songs (20+), albums, bio, avatar
 */
export async function getArtistCatalog(artistName, artistId = null) {
  const name = (artistName || '').trim();
  if (!name) return { artist: null, topTracks: [], albums: [] };

  const cacheKey = `${name.toLowerCase()}:${artistId || ''}`;
  const cached = artistCache.get(cacheKey);
  if (cached && Date.now() < cached.expiresAt) {
    return cached.data;
  }

  const yt = await getYT();
  let realArtistId = artistId;
  let artistAvatar = null;
  let artistBio = '';

  // 1. If artistId not given, find artist
  if (!realArtistId) {
    try {
      const artSearch = await yt.music.search(name, { type: 'artist' });
      const first = artSearch.artists?.contents?.[0];
      if (first) {
        realArtistId = first.id;
        artistAvatar = getHdCover(first.thumbnails?.[0]?.url);
      }
    } catch {}
  }

  // 2. Fetch artist top songs, albums, and full profile concurrently
  const [songRes, albumRes, artistDataRes] = await Promise.allSettled([
    yt.music.search(`${name} songs`, { type: 'song' }),
    yt.music.search(name, { type: 'album' }),
    realArtistId ? yt.music.getArtist(realArtistId) : Promise.resolve(null)
  ]);

  const rawSongs = songRes.status === 'fulfilled' ? songRes.value?.songs?.contents || [] : [];
  const rawAlbums = albumRes.status === 'fulfilled' ? albumRes.value?.albums?.contents || [] : [];

  const topTracks = rawSongs.map((s) => ({
    id: s.id,
    title: cleanTitle(s.title || 'Unknown Title'),
    artist: Array.isArray(s.artists) ? s.artists.map((a) => a.name).join(', ') : (s.artists?.name || name),
    album: s.album?.name || 'Single',
    duration: s.duration?.seconds || 200,
    cover: getHdCover(s.thumbnails?.[0]?.url),
    src: `/api/stream/proxy?id=${s.id}`,
    isOnline: true,
    isLiked: false
  }));

  const albums = rawAlbums.map((a) => ({
    id: a.id,
    title: a.title,
    artist: Array.isArray(a.artists) ? a.artists.map((x) => x.name).join(', ') : name,
    year: a.year || '2024',
    cover: getHdCover(a.thumbnails?.[0]?.url),
    type: 'album'
  }));

  // 3. Inspect artist details if artist data returned
  if (artistDataRes.status === 'fulfilled' && artistDataRes.value?.header) {
    const hdr = artistDataRes.value.header;
    artistBio = hdr.description?.text || hdr.description || '';
    if (!artistAvatar && hdr.thumbnails?.[0]?.url) {
      artistAvatar = getHdCover(hdr.thumbnails[0].url);
    }
  }

  const result = {
    artist: {
      id: realArtistId || `artist-${encodeURIComponent(name)}`,
      name,
      avatar: artistAvatar || topTracks[0]?.cover || '/art/default_album.webp',
      bio: artistBio,
      genre: 'Top Artist'
    },
    topTracks,
    albums
  };

  setBoundedCache(artistCache, cacheKey, { data: result, expiresAt: Date.now() + 60 * 60 * 1000 }, 150);
  return result;
}

/**
 * Fetch full album details including complete tracklist
 */
export async function getAlbumDetails(albumId, albumTitle = '', artistName = '') {
  const cacheKey = `${albumId || ''}:${albumTitle.toLowerCase()}:${artistName.toLowerCase()}`;
  const cached = albumCache.get(cacheKey);
  if (cached && Date.now() < cached.expiresAt) {
    return cached.data;
  }

  const yt = await getYT();
  let targetId = albumId;

  // If albumId is missing or composite, search for album ID
  if (!targetId || !targetId.startsWith('MPREb_')) {
    try {
      const albSearch = await yt.music.search(`${albumTitle} ${artistName}`.trim(), { type: 'album' });
      const first = albSearch.albums?.contents?.[0];
      if (first?.id) {
        targetId = first.id;
      }
    } catch {}
  }

  if (!targetId) {
    return null;
  }

  try {
    const albData = await yt.music.getAlbum(targetId);
    const title = albData.title || albumTitle || 'Album';
    const cover = getHdCover(albData.header?.thumbnail?.thumbnails?.[0]?.url);
    const year = albData.year || '2024';
    
    let artistStr = artistName;
    if (albData.header?.strapline_text_one) {
      const s = albData.header.strapline_text_one;
      artistStr = typeof s === 'string' ? s : (s.text || s.toString() || artistName);
    }

    const tracks = (albData.contents || []).map((t, idx) => ({
      id: t.id,
      title: cleanTitle(t.title || `Track ${idx + 1}`),
      artist: Array.isArray(t.artists) ? t.artists.map((a) => a.name).join(', ') : (artistStr || 'Various Artists'),
      album: title,
      duration: t.duration?.seconds || 200,
      cover: cover || '/art/default_album.webp',
      src: `/api/stream/proxy?id=${t.id}`,
      isOnline: true,
      isLiked: false,
      trackNumber: idx + 1
    }));

    const result = {
      id: targetId,
      title,
      artist: artistStr || 'Various Artists',
      year,
      cover,
      tracks
    };

    setBoundedCache(albumCache, cacheKey, { data: result, expiresAt: Date.now() + 60 * 60 * 1000 }, 150);
    return result;
  } catch (err) {
    console.error('getAlbumDetails error:', err);
    return null;
  }
}

export async function getRadioTracks(videoId) {
  const yt = await getYT();
  try {
    const res = await yt.actions.execute('next', {
      videoId,
      playlistId: `RDAMVM${videoId}`,
      enablePersistentPlaylistPanel: true,
      tunerSettingValue: 'AUTOMIX_SETTING_NORMAL',
      client: 'YTMUSIC'
    });

    const panel =
      res.data?.contents?.singleColumnMusicWatchNextResultsRenderer
        ?.tabbedRenderer?.watchNextTabbedResultsRenderer?.tabs?.[0]?.tabRenderer
        ?.content?.musicQueueRenderer?.content?.playlistPanelRenderer;

    const contents = panel?.contents || [];
    const tracks = [];
    const seenIds = new Set([videoId]);

    for (const item of contents) {
      const r = item?.playlistPanelVideoRenderer;
      if (!r || !r.videoId || seenIds.has(r.videoId)) continue;
      seenIds.add(r.videoId);

      const title = cleanTitle(r.title?.runs?.[0]?.text || 'Unknown Title');
      const artist = r.shortBylineText?.runs?.[0]?.text || 'Unknown Artist';
      const hdCover = getHdCover(r.thumbnail?.thumbnails?.[0]?.url);

      const durStr = r.lengthText?.runs?.[0]?.text || '';
      const parts = durStr.split(':').map((p) => parseInt(p, 10));
      let durationSec = 200;
      if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        durationSec = parts[0] * 60 + parts[1];
      } else if (parts.length === 3) {
        durationSec = parts[0] * 3600 + parts[1] * 60 + parts[2];
      }

      tracks.push({
        id: r.videoId,
        title,
        artist,
        album: 'Automix Radio',
        duration: durationSec,
        cover: hdCover,
        src: `/api/stream/proxy?id=${r.videoId}`,
        isOnline: true,
        isLiked: false
      });
    }

    return tracks;
  } catch (err) {
    console.error('getRadioTracks error:', err);
    return [];
  }
}
