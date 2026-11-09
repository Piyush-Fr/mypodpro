'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { 
  Play, Pause, SkipBack, SkipForward, Volume2, Search, Upload, 
  Disc, Heart, LogOut, User, Music2, FolderHeart, 
  ChevronLeft, ChevronRight, Sliders, Settings, Radio, Sparkles, Activity, Gauge,
  ListMusic, Plus, Trash2, ArrowUp, ArrowDown, History, Sun, Moon, Palette, Zap,
  Shuffle, RotateCcw, Disc3, Star
} from 'lucide-react';
import gsap from 'gsap';
import Lenis from 'lenis';
import { authClient } from '@/lib/auth-client';
import ArtistProfileView from '@/components/ArtistProfileView';
import AlbumScreenView from '@/components/AlbumScreenView';

const DEFAULT_TRACKS = [
  {
    id: 'local-on-and-on',
    title: 'On & On (feat. Daniel Levi)',
    artist: 'Cartoon',
    album: 'NCS: Uplifting',
    duration: 208,
    cover: '/art/on_and_on.jpg',
    src: '/audio/OnAndOn.m4a',
    isOnline: false,
    isLiked: true,
    inPlaylist: true
  },
  {
    id: 'local-firefly',
    title: 'Firefly',
    artist: 'Jim Yosef',
    album: 'NCS Release',
    duration: 196,
    cover: '/art/firefly.jpg',
    src: '/audio/Firefly.ogg',
    isOnline: false,
    isLiked: true,
    inPlaylist: true
  },
  {
    id: 'local-spectre',
    title: 'The Spectre',
    artist: 'Alan Walker',
    album: 'The Spectre - Single',
    duration: 230,
    cover: '/art/spectre.jpg',
    src: '/audio/Spectre.opus',
    isOnline: false,
    isLiked: true,
    inPlaylist: true
  }
];

// Apple Music Lossless Audio Badge Component
function AppleMusicLosslessBadge({ onClick, className = '' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`apple-lossless-badge ${className}`}
      title="Apple Music Lossless Audio (24-bit/48kHz ALAC) • Click to open Settings"
    >
      <svg
        width="13"
        height="9"
        viewBox="0 0 14 9"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="apple-lossless-icon"
      >
        <path
          fill="currentColor"
          fillRule="evenodd"
          d="M4.5522,0C4.8969,0 5.205,0.1229 5.4844,0.3361C5.5808,0.4095 5.6939,0.5149 5.7751,0.6012C7.2178,2.136 7.8307,6.1801 8.804,7.8187C8.8851,7.9552 8.9397,8.0258 8.9618,8.0559C9.1839,8.3565 9.4261,8.535 9.7017,8.535C9.7951,8.535 9.8926,8.513 9.9941,8.4706C10.091,8.5776 10.1918,8.6744 10.2966,8.7588C10.0427,8.9239 9.7355,9 9.4478,9C9.1031,9 8.795,8.8771 8.5156,8.664C8.4374,8.6043 8.3179,8.4978 8.2249,8.3989C6.7822,6.864 6.1693,2.8199 5.1959,1.1813C4.9026,0.6879 4.5245,0.3133 4.0059,0.5294C3.9089,0.4222 3.8082,0.3258 3.7033,0.2411C3.9572,0.0761 4.2643,0 4.5522,0ZM2.3869,0.0214C5.5605,-0.4229 5.8126,8.535 7.7911,8.535C7.884,8.535 7.981,8.5132 8.0818,8.4714C8.1792,8.5788 8.2807,8.6743 8.386,8.7589C8.132,8.9238 7.8249,9 7.537,9C5.8045,9 4.9435,5.8448 4.2734,3.724C4.229,3.5835 4.1847,3.4448 4.1405,3.3079C3.8674,2.4631 3.5948,1.7027 3.2851,1.1814C3.2223,1.0754 3.1578,0.9796 3.0916,0.8947C2.7131,0.4102 2.305,0.329 1.8286,0.6833C0.8287,1.4214 0.3651,3.8953 0.2183,5.1524L0.2183,5.1524C0.2107,5.2178 0.1637,5.2595 0.1092,5.2595C0.1048,5.2595 0.1005,5.2593 0.0961,5.2587C0.0362,5.2514 -0.0064,5.1959 0.0008,5.1346L0.0008,5.1346C0.2175,3.7154 0.5767,1.2827 1.6123,0.3783C1.8147,0.1972 2.0896,0.0629 2.3869,0.0214ZM6.4629,0C8.1955,0 9.0565,3.1564 9.7265,5.276C9.771,5.4165 9.8153,5.5553 9.8595,5.692C10.1326,6.537 10.4052,7.2972 10.7148,7.8186C10.7777,7.9245 10.8422,8.0205 10.9085,8.1053C11.1207,8.3769 11.3516,8.535 11.6124,8.535C11.7848,8.535 11.9702,8.4663 12.1713,8.3167C13.1712,7.5786 13.6348,5.1048 13.7816,3.8477L13.7816,3.8477C13.7893,3.7822 13.8364,3.7406 13.8908,3.7406C13.8952,3.7406 13.8996,3.7408 13.9039,3.7414C13.9637,3.7486 14.0063,3.8042 13.9992,3.8653L13.9992,3.8653C13.7825,5.2845 13.4234,7.7172 12.3876,8.6217C12.1016,8.8779 11.7247,9 11.3584,9C8.4607,9 8.1211,0.465 6.2089,0.465C6.116,0.465 6.0191,0.4868 5.9182,0.5286C5.8209,0.4213 5.7194,0.3257 5.614,0.2412C5.868,0.0761 6.1751,0 6.4629,0ZM11.9867,3.7407C12.0531,3.7487 12.0957,3.8041 12.0885,3.8654L12.0885,3.8654C11.9128,5.0167 11.6434,6.8324 10.9962,7.9608C10.9326,7.8744 10.8704,7.7766 10.8094,7.6686C11.437,6.6147 11.7543,4.8471 11.8711,3.8477L11.8711,3.8477C11.8787,3.7822 11.9257,3.7405 11.9801,3.7405C11.9845,3.7405 11.9889,3.7408 11.9932,3.7413ZM9.1606,7.1514C9.2138,7.2632 9.2681,7.3719 9.3239,7.4773C9.2504,7.6486 9.1707,7.8106 9.0847,7.9608C9.0215,7.8746 8.9594,7.7769 8.8985,7.6691C8.9927,7.5108 9.0801,7.3368 9.1606,7.1514ZM10.076,3.7407C10.1424,3.7487 10.1851,3.8041 10.1779,3.8654L10.1779,3.8654C10.1111,4.303 10.0313,4.8324 9.9229,5.3838C9.8782,5.2436 9.8336,5.1029 9.7893,4.9621C9.8681,4.5458 9.9239,4.1593 9.9604,3.8477L9.9604,3.8477C9.968,3.7822 10.015,3.7405 10.0695,3.7405C10.0739,3.7405 10.0782,3.7408 10.0826,3.7413ZM3.0038,1.0393C3.0674,1.1256 3.1296,1.2234 3.1906,1.3314C2.563,2.3853 2.2457,4.153 2.1289,5.1523L2.1289,5.1523C2.1213,5.2178 2.0743,5.2595 2.0199,5.2595C2.0155,5.2595 2.0111,5.2592 2.0068,5.2587C1.9469,5.2513 1.9042,5.1958 1.9114,5.1346L1.9114,5.1346C2.0872,3.9834 2.3565,2.1676 3.0038,1.0393ZM4.0771,3.6161C4.1218,3.7564 4.1663,3.8971 4.2107,4.038C4.1319,4.4542 4.076,4.8406 4.0396,5.1523L4.0396,5.1523C4.032,5.2178 3.985,5.2595 3.9305,5.2595C3.9261,5.2595 3.9218,5.2592 3.9174,5.2587C3.8575,5.2513 3.8149,5.1958 3.8221,5.1346L3.8221,5.1346C3.8889,4.697 3.9687,4.1676 4.0771,3.6161ZM4.9153,1.0392C4.9787,1.1253 5.0406,1.2231 5.1014,1.3309C5.0072,1.489 4.92,1.6632 4.8394,1.8486C4.7862,1.7368 4.7319,1.6281 4.6762,1.5227C4.7495,1.3514 4.8293,1.1895 4.9153,1.0392Z"
        />
      </svg>
      <span>Lossless</span>
    </button>
  );
}

// Graphic Equalizer Frequencies & Labels
const EQ_FREQUENCIES = [32, 64, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];
const EQ_LABELS = ['32Hz', '64Hz', '125Hz', '250Hz', '500Hz', '1kHz', '2kHz', '4kHz', '8kHz', '16kHz'];

// Studio Equalizer Presets
const EQ_PRESETS = {
  'Flat': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  'Bass Boost': [5.5, 4.5, 3.2, 2.0, 0.5, 0, 0, 0, 0, 0],
  'Treble Boost': [0, 0, 0, 0, 0, 1.0, 2.5, 4.0, 5.0, 6.0],
  'Rock': [4.5, 3.0, -1.0, -2.0, -0.5, 2.0, 3.5, 4.5, 4.0, 3.5],
  'Pop': [-1.5, 1.5, 3.5, 4.0, 2.5, -0.5, -1.5, -1.5, 1.0, 2.5],
  'Electronic': [4.5, 4.0, 1.5, 0, -1.5, 1.5, 0.5, 2.0, 3.5, 4.0],
  'Classical': [4.0, 3.0, 2.5, 2.0, -1.5, -1.5, 0, 2.0, 3.0, 3.5],
  'Vocal / Acoustic': [-2.0, -1.5, 0, 2.0, 3.5, 3.5, 2.0, 0.5, -0.5, -1.5]
};

// Default High-Fidelity Audio Settings
const DEFAULT_AUDIO_SETTINGS = {
  theme: 'classic', // 'classic' | 'amoled'
  streamingQuality: 'lossless', // 'lossless' | 'high' | 'medium' | 'low'
  crossfadeSeconds: 0, // 0 to 12s
  smartFade: true, // Smooth gain ramp on pause/play
  autoplay: true, // Automix radio recommendations when queue finishes
  playbackSpeed: 1.0, // 0.75x to 2.0x
  eqEnabled: true,
  eqAutoHeadroom: true,
  eqPreset: 'Flat',
  eqGains: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  loudnessLevel: 'normal' // 'off' | 'normal' | 'loud' | 'quiet'
};

export default function MusicPlayerApp() {
  // --- Persistent Authentication with Better Auth & Neon DB ---
  const DEFAULT_GUEST_USER = {
    id: 'guest_local_listener',
    email: 'listener@mypod.local',
    name: 'Retro Listener',
    isGuest: true
  };
  const [authUser, setAuthUser] = useState(DEFAULT_GUEST_USER);
  const [isAuthLoaded, setIsAuthLoaded] = useState(true);
  const [authMode, setAuthMode] = useState('signin'); // 'signin' | 'signup'
  const [nameInput, setNameInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [isSubmittingAuth, setIsSubmittingAuth] = useState(false);
  const isHydrated = useRef(false);

  // Sync user library & settings from Neon DB
  const loadUserDataFromDb = useCallback(async () => {
    try {
      const [libRes, setRes] = await Promise.all([
        fetch('/api/library').then(r => r.ok ? r.json() : null),
        fetch('/api/settings').then(r => r.ok ? r.json() : null)
      ]);
      if (libRes && Array.isArray(libRes.tracks)) {
        setAllTracks(libRes.tracks);
      }
      if (setRes && setRes.settings) {
        setSettings(s => ({ ...s, ...setRes.settings }));
      }
    } catch (e) {
      console.warn('Neon DB sync notice:', e);
    }
  }, []);

  useEffect(() => {
    // 1. Hydrate from localStorage smoothly on client mount to eliminate SSR mismatch
    try {
      const stored = localStorage.getItem('mypod_user_session_v3');
      const explicitlyLoggedOut = localStorage.getItem('mypod_explicit_logout');
      if (stored) {
        setAuthUser(JSON.parse(stored));
      } else if (explicitlyLoggedOut) {
        setAuthUser(null);
      }
    } catch {}

    try {
      const explicitTheme = localStorage.getItem('mypod_theme_choice_v2');
      const saved = localStorage.getItem('mypod_audio_settings_v3');
      if (saved) {
        const parsed = JSON.parse(saved);
        setSettings((s) => ({
          ...s,
          ...parsed,
          theme: explicitTheme || 'classic'
        }));
      } else {
        setSettings((s) => ({ ...s, theme: explicitTheme || 'classic' }));
      }
    } catch {}

    try {
      localStorage.removeItem('mypod_current_track_v6');
      localStorage.removeItem('mypod_library_tracks_v6');
      const savedTracks = localStorage.getItem('mypod_library_tracks_v7');
      if (savedTracks) {
        const parsed = JSON.parse(savedTracks);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const cleaned = parsed.filter((t) => t && t.id !== 'local-faded' && t.title !== 'Faded');
          setAllTracks(cleaned.length > 0 ? cleaned : DEFAULT_TRACKS);
        }
      }
    } catch {}

    try {
      const savedTrack = localStorage.getItem('mypod_current_track_v7');
      if (savedTrack) {
        const parsed = JSON.parse(savedTrack);
        if (parsed && parsed.id !== 'local-faded' && parsed.title !== 'Faded') {
          setCurrentTrack(parsed);
        } else {
          setCurrentTrack(null);
        }
      } else {
        setCurrentTrack(null);
      }
    } catch {}

    isHydrated.current = true;

    // 2. Asynchronously verify session in background
    async function checkSession() {
      try {
        const sessionPromise = authClient.getSession();
        const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve(null), 1200));
        const session = await Promise.race([sessionPromise, timeoutPromise]);
        if (session && session.data?.user) {
          setAuthUser(session.data.user);
          loadUserDataFromDb();
        }
      } catch (e) {
        // Continue with local/guest session
      }
    }
    checkSession();
  }, [loadUserDataFromDb]);

  const handleSignIn = async (e) => {
    if (e) e.preventDefault();
    if (!emailInput.trim() || !passwordInput.trim()) {
      setAuthError('Please enter both email and password.');
      return;
    }
    setAuthError('');
    setIsSubmittingAuth(true);

    try {
      if (authMode === 'signup') {
        const res = await authClient.signUp.email({
          email: emailInput.trim(),
          password: passwordInput.trim(),
          name: nameInput.trim() || emailInput.split('@')[0]
        });
        if (res.error) {
          setAuthError(res.error.message || 'Failed to create account.');
          setIsSubmittingAuth(false);
          return;
        }
        if (res.data?.user) {
          setAuthUser(res.data.user);
          localStorage.setItem('mypod_user_session_v3', JSON.stringify(res.data.user));
          loadUserDataFromDb();
        }
      } else {
        const res = await authClient.signIn.email({
          email: emailInput.trim(),
          password: passwordInput.trim()
        });
        if (res.error) {
          setAuthError(res.error.message || 'Invalid email or password.');
          setIsSubmittingAuth(false);
          return;
        } else if (res.data?.user) {
          setAuthUser(res.data.user);
          localStorage.setItem('mypod_user_session_v3', JSON.stringify(res.data.user));
          loadUserDataFromDb();
        }
      }
    } catch (err) {
      setAuthError(err.message || 'Authentication error.');
    } finally {
      setIsSubmittingAuth(false);
    }
  };

  const handleGuestSignIn = () => {
    const guest = {
      id: 'guest_local_listener',
      email: 'listener@mypod.local',
      name: 'Retro Listener',
      isGuest: true
    };
    try {
      localStorage.removeItem('mypod_explicit_logout');
    } catch {}
    setAuthUser(guest);
    localStorage.setItem('mypod_user_session_v3', JSON.stringify(guest));
  };

  const handleSignOut = async () => {
    try {
      await authClient.signOut();
    } catch {}
    try {
      localStorage.setItem('mypod_explicit_logout', 'true');
    } catch {}
    setAuthUser(null);
    setCurrentTrack(null);
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
    if (ytPlayerRef.current?.pauseVideo) {
      try { ytPlayerRef.current.pauseVideo(); } catch {}
    }
    localStorage.removeItem('mypod_user_session_v3');
  };

  // --- Audio Settings State ---
  const [settings, setSettings] = useState(DEFAULT_AUDIO_SETTINGS);

  useEffect(() => {
    if (!isHydrated.current) return;
    try {
      localStorage.setItem('mypod_audio_settings_v3', JSON.stringify(settings));
    } catch {}
    if (authUser && authUser.id !== 'guest_local_listener') {
      const timer = setTimeout(() => {
        fetch('/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ settings })
        }).catch(() => {});
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [settings, authUser]);

  // --- Track Library ---
  const [allTracks, setAllTracks] = useState(DEFAULT_TRACKS);

  useEffect(() => {
    if (!isHydrated.current) return;
    try {
      localStorage.setItem('mypod_library_tracks_v7', JSON.stringify(allTracks));
    } catch {}
  }, [allTracks]);

  // Active view: 'cover_flow' | 'search' | 'library' | 'playlists' | 'now_playing' | 'queue' | 'settings' | 'upload' | 'artist' | 'album'
  const [activeTab, setActiveTab] = useState('cover_flow');
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [flippedAlbumId, setFlippedAlbumId] = useState(null);
  const [libraryTab, setLibraryTab] = useState('playlists'); // 'playlists' | 'songs' | 'albums' | 'artists'
  const [navHistory, setNavHistory] = useState([]);

  // Liked songs memoized for reactive updates across Liked Music playlist and Cover Flow
  const likedSongs = useMemo(() => allTracks.filter((t) => t.isLiked), [allTracks]);

  // Playback state: null by default (no track preloaded)
  const [currentTrack, setCurrentTrack] = useState(null);

  useEffect(() => {
    if (!isHydrated.current) return;
    try {
      if (currentTrack) {
        localStorage.setItem('mypod_current_track_v7', JSON.stringify(currentTrack));
      } else {
        localStorage.removeItem('mypod_current_track_v7');
      }
    } catch {}
  }, [currentTrack]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.85);

  // Queue state & playback session history
  const [manualQueue, setManualQueue] = useState([]);
  const [automixTracks, setAutomixTracks] = useState([]);
  const [isLoadingAutomix, setIsLoadingAutomix] = useState(false);
  const [playedHistory, setPlayedHistory] = useState([]);

  // Queue & Track lookup refs for atomic access and deduplication
  const currentTrackRef = useRef(null);
  const playedHistoryRef = useRef([]);
  const manualQueueRef = useRef([]);
  const automixTracksRef = useRef([]);

  useEffect(() => { currentTrackRef.current = currentTrack; }, [currentTrack]);
  useEffect(() => { playedHistoryRef.current = playedHistory; }, [playedHistory]);
  useEffect(() => { manualQueueRef.current = manualQueue; }, [manualQueue]);
  useEffect(() => { automixTracksRef.current = automixTracks; }, [automixTracks]);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchAlbums, setSearchAlbums] = useState([]);
  const [searchArtists, setSearchArtists] = useState([]);
  const [searchSortBy, setSearchSortBy] = useState('default'); // 'default' | 'title' | 'artist' | 'duration_desc' | 'duration_asc' | 'album'
  const [isSearching, setIsSearching] = useState(false);
  const [searchFeedback, setSearchFeedback] = useState('');
  const [searchCategory, setSearchCategory] = useState('songs'); // 'songs' | 'albums' | 'artists'

  // Functional Battery Status with Web Battery API & Classic iPod charging
  const [batteryState, setBatteryState] = useState({
    level: 0.88,
    charging: false,
    supported: false
  });

  useEffect(() => {
    let batteryObj = null;

    const handleBatteryUpdate = (b) => {
      setBatteryState({
        level: typeof b.level === 'number' ? b.level : 0.88,
        charging: Boolean(b.charging),
        supported: true
      });
    };

    if (typeof navigator !== 'undefined' && 'getBattery' in navigator) {
      navigator.getBattery().then((battery) => {
        batteryObj = battery;
        handleBatteryUpdate(battery);

        battery.addEventListener('chargingchange', () => handleBatteryUpdate(battery));
        battery.addEventListener('levelchange', () => handleBatteryUpdate(battery));
      }).catch(() => {
        setBatteryState({ level: 0.88, charging: false, supported: false });
      });
    }

    return () => {
      if (batteryObj) {
        try {
          batteryObj.removeEventListener('chargingchange', () => {});
          batteryObj.removeEventListener('levelchange', () => {});
        } catch {}
      }
    };
  }, []);

  // Song ratings (1 to 5 stars) - persistent
  const [trackRatings, setTrackRatings] = useState({});

  useEffect(() => {
    try {
      const saved = localStorage.getItem('mypod_track_ratings_v1');
      if (saved) setTrackRatings(JSON.parse(saved));
    } catch {}
  }, []);

  const handleSetRating = (trackId, rating) => {
    setTrackRatings((prev) => {
      const updated = { ...prev, [trackId]: rating };
      try {
        localStorage.setItem('mypod_track_ratings_v1', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Audio refs & Web Audio API DSP Nodes
  const audioRef = useRef(null);
  const ytPlayerRef = useRef(null);
  const isYtReadyRef = useRef(false);
  const pendingTrackRef = useRef(null);
  const audioContextRef = useRef(null);
  const eqFiltersRef = useRef([]);
  const headroomGainRef = useRef(null);
  const compressorRef = useRef(null);
  const fadeGainRef = useRef(null);
  const isAudioInited = useRef(false);
  const isCrossfading = useRef(false);

  // Initialize Web Audio API DSP Graph
  const initAudioEngine = useCallback(() => {
    if (isAudioInited.current || typeof window === 'undefined') return;
    const audio = audioRef.current;
    if (!audio) return;

    try {
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtxClass) return;
      const ctx = new AudioCtxClass();
      audioContextRef.current = ctx;

      const source = ctx.createMediaElementSource(audio);

      // Create 10-band Biquad Filters
      const filters = EQ_FREQUENCIES.map((freq, i) => {
        const f = ctx.createBiquadFilter();
        f.type = i === 0 ? 'lowshelf' : i === EQ_FREQUENCIES.length - 1 ? 'highshelf' : 'peaking';
        f.frequency.value = freq;
        f.Q.value = 1.41;
        f.gain.value = settings.eqEnabled ? (settings.eqGains[i] || 0) : 0;
        return f;
      });
      eqFiltersRef.current = filters;

      // Auto Headroom Gain Node
      const headroom = ctx.createGain();
      const maxBoost = Math.max(0, ...settings.eqGains);
      const headroomDb = (settings.eqEnabled && settings.eqAutoHeadroom && maxBoost > 0) ? maxBoost : 0;
      headroom.gain.value = Math.pow(10, -headroomDb / 20);
      headroomGainRef.current = headroom;

      // Dynamics Compressor Node for Loudness Normalization
      const comp = ctx.createDynamicsCompressor();
      compressorRef.current = comp;

      // Master Smart Fade Gain Node
      const fade = ctx.createGain();
      fade.gain.value = 1.0;
      fadeGainRef.current = fade;

      // Connect: source -> filter0 -> ... -> filter9 -> headroom -> compressor -> fade -> destination
      let currentConn = source;
      filters.forEach((filter) => {
        currentConn.connect(filter);
        currentConn = filter;
      });
      currentConn.connect(headroom);
      headroom.connect(comp);
      comp.connect(fade);
      fade.connect(ctx.destination);

      isAudioInited.current = true;
    } catch (err) {
      console.warn('Web Audio DSP initialization note:', err);
    }
  }, [settings.eqEnabled, settings.eqGains, settings.eqAutoHeadroom]);

  // Synchronize DSP parameters when settings change
  useEffect(() => {
    const ctx = audioContextRef.current;
    if (!ctx) return;

    // 1. Equalizer Filter Gains
    eqFiltersRef.current.forEach((filter, i) => {
      const targetGain = settings.eqEnabled ? (settings.eqGains[i] ?? 0) : 0;
      filter.gain.setTargetAtTime(targetGain, ctx.currentTime, 0.05);
    });

    // 2. Auto Headroom Preamp
    if (headroomGainRef.current) {
      const maxBoost = Math.max(0, ...settings.eqGains);
      const headroomDb = (settings.eqEnabled && settings.eqAutoHeadroom && maxBoost > 0) ? maxBoost : 0;
      const targetGain = Math.pow(10, -headroomDb / 20);
      headroomGainRef.current.gain.setTargetAtTime(targetGain, ctx.currentTime, 0.05);
    }

    // 3. Dynamics Compressor (Loudness Normalization)
    if (compressorRef.current) {
      const comp = compressorRef.current;
      if (settings.loudnessLevel === 'off') {
        comp.threshold.setTargetAtTime(0, ctx.currentTime, 0.05);
        comp.ratio.setTargetAtTime(1, ctx.currentTime, 0.05);
      } else if (settings.loudnessLevel === 'normal') {
        comp.threshold.setTargetAtTime(-24, ctx.currentTime, 0.05);
        comp.knee.setTargetAtTime(30, ctx.currentTime, 0.05);
        comp.ratio.setTargetAtTime(4, ctx.currentTime, 0.05);
        comp.attack.setTargetAtTime(0.003, ctx.currentTime, 0.05);
        comp.release.setTargetAtTime(0.25, ctx.currentTime, 0.05);
      } else if (settings.loudnessLevel === 'loud') {
        comp.threshold.setTargetAtTime(-18, ctx.currentTime, 0.05);
        comp.knee.setTargetAtTime(20, ctx.currentTime, 0.05);
        comp.ratio.setTargetAtTime(6, ctx.currentTime, 0.05);
        comp.attack.setTargetAtTime(0.003, ctx.currentTime, 0.05);
        comp.release.setTargetAtTime(0.2, ctx.currentTime, 0.05);
      } else if (settings.loudnessLevel === 'quiet') {
        comp.threshold.setTargetAtTime(-32, ctx.currentTime, 0.05);
        comp.knee.setTargetAtTime(40, ctx.currentTime, 0.05);
        comp.ratio.setTargetAtTime(3, ctx.currentTime, 0.05);
        comp.attack.setTargetAtTime(0.005, ctx.currentTime, 0.05);
        comp.release.setTargetAtTime(0.3, ctx.currentTime, 0.05);
      }
    }

    // 4. Playback Speed
    if (audioRef.current) {
      audioRef.current.playbackRate = settings.playbackSpeed || 1.0;
    }
  }, [settings]);

  // Fetch automix recommendations using native radio automix algorithm
  // append = false: initializes a new automix queue for fresh user song selection
  // append = true: extends the existing static queue when running low without resetting it
  const fetchAutomix = useCallback(async (videoId, append = false) => {
    if (!videoId || videoId.startsWith('local-')) return;
    setIsLoadingAutomix(true);
    try {
      const res = await fetch(`/api/radio?id=${encodeURIComponent(videoId)}`);
      const data = await res.json();
      if (data.tracks && data.tracks.length > 0) {
        const currentId = currentTrackRef.current?.id;
        const playedIds = new Set(playedHistoryRef.current.map((t) => t.id));
        const manualIds = new Set(manualQueueRef.current.map((t) => t.id));
        const existingAutoIds = new Set(automixTracksRef.current.map((t) => t.id));

        let filtered = data.tracks.filter((t) => {
          if (!t || !t.id) return false;
          if (t.id === currentId || t.id === videoId) return false;
          if (playedIds.has(t.id)) return false;
          if (manualIds.has(t.id)) return false;
          if (append && existingAutoIds.has(t.id)) return false;
          return true;
        });

        // Fallback: If strict history filter removed everything, ensure at least immediate recent & current are filtered
        if (filtered.length === 0 && !append) {
          const recentImmediateIds = new Set(
            playedHistoryRef.current.slice(-3).map((t) => t.id)
          );
          filtered = data.tracks.filter((t) => {
            if (!t || !t.id) return false;
            if (t.id === currentId || t.id === videoId) return false;
            if (recentImmediateIds.has(t.id)) return false;
            if (manualIds.has(t.id)) return false;
            return true;
          });
        }

        if (append) {
          setAutomixTracks((prev) => {
            const prevIds = new Set(prev.map((p) => p.id));
            const novel = filtered.filter((t) => !prevIds.has(t.id));
            return [...prev, ...novel];
          });
        } else {
          setAutomixTracks(filtered);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch automix:', err);
    } finally {
      setIsLoadingAutomix(false);
    }
  }, []);

  // Play a track: instantly auto-plays audio on click
  // options can be a boolean (legacy shouldSwitchTab) or an options object:
  // { shouldSwitchTab = true, shouldSeedQueue = true, isBackNavigation = false }
  const playTrack = useCallback((track, options = {}) => {
    if (!track) return;

    const shouldSwitchTab = typeof options === 'boolean' ? options : (options.shouldSwitchTab ?? true);
    const shouldSeedQueue = typeof options === 'object' ? (options.shouldSeedQueue ?? true) : false;
    const isBackNavigation = typeof options === 'object' ? (options.isBackNavigation ?? false) : false;

    initAudioEngine();
    const ctx = audioContextRef.current;
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    // Record previous track into session playback history (unless navigating backwards)
    if (!isBackNavigation && currentTrackRef.current && currentTrackRef.current.id !== track.id) {
      const prevTrack = currentTrackRef.current;
      setPlayedHistory((prev) => {
        const filtered = prev.filter((t) => t.id !== prevTrack.id);
        return [...filtered, prevTrack].slice(-50);
      });
    }

    // Set active playing track
    setCurrentTrack(track);
    setCurrentTime(0);

    // If track is not already in allTracks library, add it
    setAllTracks((prev) => {
      if (prev.some((t) => t.id === track.id)) return prev;
      return [track, ...prev];
    });

    const isOnline = track.isOnline && track.id && !track.src?.startsWith('/audio/');

    if (isOnline) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }

      if (ytPlayerRef.current && typeof ytPlayerRef.current.loadVideoById === 'function') {
        try {
          ytPlayerRef.current.loadVideoById(track.id);
          ytPlayerRef.current.playVideo();
          setIsPlaying(true);
        } catch (err) {
          console.warn('YT playVideo error:', err);
        }
      } else {
        pendingTrackRef.current = track;
        setTimeout(() => {
          if (ytPlayerRef.current?.loadVideoById) {
            try {
              ytPlayerRef.current.loadVideoById(track.id);
              ytPlayerRef.current.playVideo();
              setIsPlaying(true);
            } catch {}
          }
        }, 800);
      }
    } else {
      if (ytPlayerRef.current?.pauseVideo) {
        try { ytPlayerRef.current.pauseVideo(); } catch {}
      }
      const audio = audioRef.current;
      if (audio) {
        let targetSrc = track.src;
        if (audio.src !== targetSrc && !audio.src.endsWith(targetSrc)) {
          audio.src = targetSrc;
        }
        audio.currentTime = 0;
        audio.playbackRate = settings.playbackSpeed || 1.0;

        if (fadeGainRef.current) {
          fadeGainRef.current.gain.value = 1.0;
        }

        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setIsPlaying(true);
            })
            .catch((err) => {
              console.warn('Playback error / Autoplay note:', err.message);
              setIsPlaying(false);
            });
        }
      }
    }

    // Only seed a brand-new queue when explicitly requested (e.g. fresh track selection from Search/Library)
    // When playing next in an existing queue, keep the queue static!
    if (shouldSeedQueue) {
      fetchAutomix(track.id, false);
    }

    if (shouldSwitchTab) {
      setActiveTab('now_playing');
    }
  }, [settings.streamingQuality, settings.playbackSpeed, settings.smartFade, initAudioEngine, fetchAutomix]);

  // Handle next song in sequence: checks manual queue, then automix radio, then allTracks
  // Keeps queue static and never wipes or resets the upcoming sequence
  const handleNext = useCallback(() => {
    // 1. If manual queue has items, play next in queue
    if (manualQueue.length > 0) {
      const nextSong = manualQueue[0];
      setManualQueue((prev) => prev.slice(1));
      playTrack(nextSong, { shouldSwitchTab: false, shouldSeedQueue: false });
      return;
    }

    // 2. If autoplay is enabled and automix recommendations exist, play next automix song
    if (settings.autoplay && automixTracks.length > 0) {
      const nextSong = automixTracks[0];
      const remainingAutomix = automixTracks.slice(1);
      setAutomixTracks(remainingAutomix);

      // Play next song with static queue (do NOT seed/wipe queue)
      playTrack(nextSong, { shouldSwitchTab: false, shouldSeedQueue: false });

      // If automix queue is running low (< 4 tracks), quietly fetch more to append to end
      if (remainingAutomix.length < 4 && nextSong.id) {
        fetchAutomix(nextSong.id, true);
      }
      return;
    }

    // 3. Fallback: cycle to next song in allTracks list
    if (allTracks.length > 0 && currentTrack) {
      const currentIndex = allTracks.findIndex((t) => t.id === currentTrack.id);
      const nextIdx = (currentIndex + 1) % allTracks.length;
      const track = allTracks[nextIdx];
      if (track) {
        playTrack(track, { shouldSwitchTab: false, shouldSeedQueue: false });
      }
    }
  }, [manualQueue, automixTracks, settings.autoplay, allTracks, currentTrack, playTrack, fetchAutomix]);

  const handlePrev = useCallback(() => {
    const isOnline = currentTrack?.isOnline && currentTrack?.id && !currentTrack?.src?.startsWith('/audio/');
    const audio = audioRef.current;

    if (currentTime > 3) {
      setCurrentTime(0);
      if (isOnline && ytPlayerRef.current?.seekTo) {
        try { ytPlayerRef.current.seekTo(0, true); } catch {}
      } else if (audio) {
        audio.currentTime = 0;
      }
      return;
    }

    // If we have history of played songs in this session:
    if (playedHistory.length > 0) {
      const prevSong = playedHistory[playedHistory.length - 1];
      setPlayedHistory((prev) => prev.slice(0, -1));

      // Put current track back onto front of queue so user can skip forward back to it
      if (currentTrack) {
        if (manualQueue.length > 0) {
          setManualQueue((prev) => [currentTrack, ...prev]);
        } else {
          setAutomixTracks((prev) => [currentTrack, ...prev]);
        }
      }

      playTrack(prevSong, { shouldSwitchTab: false, shouldSeedQueue: false, isBackNavigation: true });
      return;
    }

    // Fallback: cycle to previous song in allTracks
    if (allTracks.length > 0 && currentTrack) {
      const currentIndex = allTracks.findIndex((t) => t.id === currentTrack.id);
      const prevIdx = (currentIndex - 1 + allTracks.length) % allTracks.length;
      const track = allTracks[prevIdx];
      if (track) {
        playTrack(track, { shouldSwitchTab: false, shouldSeedQueue: false });
      }
    }
  }, [playedHistory, currentTrack, currentTime, manualQueue.length, allTracks, playTrack]);

  // Play / Pause with SmartFade gain transitions
  const togglePlayPause = () => {
    if (!currentTrack) {
      if (allTracks.length > 0) {
        playTrack(allTracks[0]);
      } else {
        setActiveTab('search');
      }
      return;
    }

    const isOnline = currentTrack.isOnline && currentTrack.id && !currentTrack.src?.startsWith('/audio/');

    if (isOnline && ytPlayerRef.current && typeof ytPlayerRef.current.getPlayerState === 'function') {
      try {
        const state = ytPlayerRef.current.getPlayerState();
        if (state === 1) { // Currently playing
          ytPlayerRef.current.pauseVideo();
          setIsPlaying(false);
        } else {
          ytPlayerRef.current.playVideo();
          setIsPlaying(true);
        }
        return;
      } catch {}
    }

    const audio = audioRef.current;
    if (!audio) return;
    initAudioEngine();

    const ctx = audioContextRef.current;
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    if (isPlaying) {
      if (settings.smartFade && fadeGainRef.current && ctx) {
        fadeGainRef.current.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.06);
        setTimeout(() => {
          audio.pause();
          setIsPlaying(false);
        }, 180);
      } else {
        audio.pause();
        setIsPlaying(false);
      }
    } else {
      if (settings.smartFade && fadeGainRef.current && ctx) {
        fadeGainRef.current.gain.setValueAtTime(0.0001, ctx.currentTime);
        audio.play().then(() => {
          setIsPlaying(true);
          fadeGainRef.current.gain.setTargetAtTime(1.0, ctx.currentTime, 0.06);
        }).catch(() => {});
      } else {
        if (fadeGainRef.current) fadeGainRef.current.gain.value = 1.0;
        audio.play().then(() => setIsPlaying(true)).catch(() => {});
      }
    }
  };

  // Audio Event Listeners & Crossfade Monitoring
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);

      // Crossfade auto-transition
      const trackDuration = audio.duration || duration;
      const xfadeSec = settings.crossfadeSeconds;
      if (
        xfadeSec > 0 &&
        trackDuration > 15 &&
        audio.currentTime >= trackDuration - xfadeSec &&
        !isCrossfading.current
      ) {
        isCrossfading.current = true;
        const ctx = audioContextRef.current;
        if (fadeGainRef.current && ctx) {
          fadeGainRef.current.gain.setTargetAtTime(0.0001, ctx.currentTime, xfadeSec / 3);
        }
        setTimeout(() => {
          handleNext();
          setTimeout(() => {
            isCrossfading.current = false;
            if (fadeGainRef.current && audioContextRef.current) {
              fadeGainRef.current.gain.setTargetAtTime(1.0, audioContextRef.current.currentTime, 0.2);
            }
          }, 200);
        }, xfadeSec * 600);
      }
    };

    const onLoadedMetadata = () => setDuration(audio.duration || 0);
    const onEnded = () => {
      isCrossfading.current = false;
      handleNext();
    };

    const onError = async () => {
      console.warn('Audio playback error on:', audio.src);
      const track = currentTrackRef.current;
      if (track && track.id && !track.id.startsWith('local-')) {
        try {
          const res = await fetch(`/api/stream?id=${encodeURIComponent(track.id)}&quality=${settings.streamingQuality}`);
          const data = await res.json();
          if (data.streamUrl && audio.src !== data.streamUrl) {
            audio.src = data.streamUrl;
            audio.play().then(() => setIsPlaying(true)).catch(() => {});
          }
        } catch (e) {
          console.warn('Audio fallback error:', e);
        }
      }
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
    };
  }, [currentTrack, duration, settings.crossfadeSeconds, handleNext]);

  // Initialize YouTube background audio engine for 100% universal cloud playback
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const setupYt = () => {
      if (window.YT && window.YT.Player && !ytPlayerRef.current) {
        try {
          ytPlayerRef.current = new window.YT.Player('mypod-yt-player', {
            height: '1',
            width: '1',
            playerVars: {
              autoplay: 1,
              controls: 0,
              disablekb: 1,
              fs: 0,
              playsinline: 1,
              origin: window.location.origin
            },
            events: {
              onReady: () => {
                isYtReadyRef.current = true;
                if (ytPlayerRef.current && volume) {
                  try { ytPlayerRef.current.setVolume(volume * 100); } catch {}
                }
                if (pendingTrackRef.current) {
                  const pending = pendingTrackRef.current;
                  pendingTrackRef.current = null;
                  try {
                    ytPlayerRef.current.loadVideoById(pending.id);
                    ytPlayerRef.current.playVideo();
                    setIsPlaying(true);
                  } catch {}
                }
              },
              onStateChange: (event) => {
                // 1 = PLAYING, 2 = PAUSED, 0 = ENDED
                if (event.data === 1) {
                  setIsPlaying(true);
                } else if (event.data === 2) {
                  setIsPlaying(false);
                } else if (event.data === 0) {
                  handleNext();
                }
              }
            }
          });
        } catch (e) {
          console.warn('YT Player init note:', e);
        }
      }
    };

    if (!window.YT) {
      const existing = document.getElementById('yt-iframe-api-script');
      if (!existing) {
        const tag = document.createElement('script');
        tag.id = 'yt-iframe-api-script';
        tag.src = 'https://www.youtube.com/iframe_api';
        document.body.appendChild(tag);
      }
      window.onYouTubeIframeAPIReady = setupYt;
    } else {
      setupYt();
    }
  }, [handleNext, volume]);

  // Synchronize time and duration when streaming via YouTube background engine
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      const track = currentTrackRef.current;
      const isOnline = track?.isOnline && track?.id && !track?.src?.startsWith('/audio/');
      if (isOnline && ytPlayerRef.current && typeof ytPlayerRef.current.getCurrentTime === 'function') {
        try {
          const t = ytPlayerRef.current.getCurrentTime();
          const d = ytPlayerRef.current.getDuration();
          if (typeof t === 'number' && !isNaN(t) && t > 0) {
            setCurrentTime(t);
          }
          if (typeof d === 'number' && !isNaN(d) && d > 0) {
            setDuration(d);
          }
        } catch {}
      }
    }, 250);
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Queue helper methods
  const addToQueue = (track) => {
    setManualQueue((prev) => [...prev, track]);
    setAutomixTracks((prev) => prev.filter((t) => t.id !== track.id));
  };

  const removeFromQueue = (index) => {
    setManualQueue((prev) => prev.filter((_, i) => i !== index));
  };

  const clearQueue = () => {
    setManualQueue([]);
  };

  const moveQueueItem = (fromIdx, toIdx) => {
    if (toIdx < 0 || toIdx >= manualQueue.length) return;
    setManualQueue((prev) => {
      const copy = [...prev];
      const item = copy.splice(fromIdx, 1)[0];
      copy.splice(toIdx, 0, item);
      return copy;
    });
  };

  // --- Cover Flow Data & Fluid Momentum (Lenis + GSAP) ---
  // All music in both Library and Liked sections automatically grouped into distinct albums in Cover Flow
  const coverFlowAlbums = useMemo(() => {
    if (!allTracks || allTracks.length === 0) return [];
    const map = new Map();

    const cleanAlbumTitle = (alb) => {
      if (!alb) return '';
      return alb
        .replace(/\s*[\(\[](?:deluxe|anniversary|expanded|remaster(?:ed)?|special|bonus|edition|version|re-issue|reissue|explicit).*?[\)\]]/gi, '')
        .replace(/\s*-\s*(?:single|ep|deluxe|anniversary|remaster(?:ed)?).*?$/i, '')
        .trim();
    };

    const cleanArtistName = (art) => {
      if (!art) return 'Unknown Artist';
      const primary = art.split(/[,&/]|(?:\sfeat\.?)|\sft\.?/i)[0].trim();
      return primary || art.trim();
    };

    allTracks.forEach((track) => {
      const rawAlbum = track.album || '';
      const rawArtist = track.artist || 'Unknown Artist';
      const rawTitle = track.title || 'Unknown Track';

      let normalizedAlbum = cleanAlbumTitle(rawAlbum);
      if (!normalizedAlbum || /^single$/i.test(normalizedAlbum) || /^online track$/i.test(normalizedAlbum) || /^automix radio$/i.test(normalizedAlbum)) {
        normalizedAlbum = rawAlbum || rawTitle;
      }

      const primaryArtist = cleanArtistName(rawArtist);
      const cleanTitleKey = cleanAlbumTitle(normalizedAlbum).toLowerCase();
      const key = `${primaryArtist.toLowerCase()}:::${cleanTitleKey}`;

      if (!map.has(key)) {
        map.set(key, {
          id: key,
          title: cleanAlbumTitle(rawAlbum) || normalizedAlbum || rawTitle,
          artist: rawArtist,
          primaryArtist: primaryArtist,
          cover: track.cover || '/art/default_album.webp',
          tracks: [track],
          isLiked: Boolean(track.isLiked),
          isOnline: Boolean(track.isOnline),
          year: track.year || '2024',
          genre: track.genre || 'Electronic / Pop'
        });
      } else {
        const existing = map.get(key);
        if (!existing.tracks.some((t) => t.id === track.id)) {
          existing.tracks.push(track);
        }
        const currentClean = cleanAlbumTitle(existing.title);
        const thisClean = cleanAlbumTitle(rawAlbum);
        if (thisClean && thisClean.length < currentClean.length && thisClean.length > 2) {
          existing.title = thisClean;
        }
        if (track.isLiked) existing.isLiked = true;
      }
    });

    return Array.from(map.values());
  }, [allTracks]);

  const [coverFlowIndex, setCoverFlowIndex] = useState(0);
  const cardRefs = useRef([]);
  const targetProgress = useRef(0);
  const currentProgress = useRef(0);
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const dragStartProgress = useRef(0);
  const hasDragged = useRef(false);

  const renderCards = useCallback((progress) => {
    cardRefs.current.forEach((el, index) => {
      if (!el) return;
      const offset = index - progress;
      let xPos, zPos, rotY, scale, brightness, zIndex;

      if (Math.abs(offset) < 0.5) {
        xPos = offset * 165;
        zPos = 120 - Math.abs(offset) * 160;
        rotY = offset * -45;
        scale = 1.15 - Math.abs(offset) * 0.28;
        brightness = 1.08 - Math.abs(offset) * 0.38;
        zIndex = 100;
      } else if (offset > 0) {
        const extra = offset - 0.5;
        xPos = 140 + extra * 48;
        zPos = -30 - extra * 50;
        rotY = -52;
        scale = 0.85;
        brightness = Math.max(0.32, 0.68 - extra * 0.08);
        zIndex = Math.max(1, 90 - Math.round(offset * 10));
      } else {
        const absExtra = Math.abs(offset) - 0.5;
        xPos = -140 - absExtra * 48;
        zPos = -30 - absExtra * 50;
        rotY = 52;
        scale = 0.85;
        brightness = Math.max(0.32, 0.68 - absExtra * 0.08);
        zIndex = Math.max(1, 90 - Math.round(Math.abs(offset) * 10));
      }

      const opacity = coverFlowAlbums.length <= 5 ? 1 : (Math.abs(offset) > 6 ? 0 : 1);

      gsap.set(el, {
        x: xPos,
        z: zPos,
        rotationY: rotY,
        scale: scale,
        opacity: opacity,
        zIndex: zIndex,
        filter: `brightness(${brightness})`,
        transformPerspective: 1200,
        transformOrigin: '50% 50%'
      });
    });
  }, [coverFlowAlbums.length]);

  // Synchronize and clamp Cover Flow progress when tracks change or view opens
  useEffect(() => {
    if (coverFlowAlbums.length > 0) {
      const maxIdx = Math.max(0, coverFlowAlbums.length - 1);
      if (targetProgress.current > maxIdx) targetProgress.current = maxIdx;
      if (currentProgress.current > maxIdx) currentProgress.current = maxIdx;
      if (coverFlowIndex > maxIdx) setCoverFlowIndex(maxIdx);
      cardRefs.current = cardRefs.current.slice(0, coverFlowAlbums.length);
      renderCards(currentProgress.current);
    }
  }, [coverFlowAlbums.length, coverFlowIndex, renderCards]);

  useEffect(() => {
    if (activeTab !== 'cover_flow' || !coverFlowAlbums.length) return;

    let animId;
    const ticker = () => {
      const diff = targetProgress.current - currentProgress.current;
      if (Math.abs(diff) > 0.0003) {
        currentProgress.current += diff * 0.065;
        renderCards(currentProgress.current);
        const rounded = Math.round(currentProgress.current);
        if (rounded !== coverFlowIndex) {
          setCoverFlowIndex(rounded);
        }
      } else {
        currentProgress.current = targetProgress.current;
        renderCards(currentProgress.current);
      }
      animId = requestAnimationFrame(ticker);
    };

    animId = requestAnimationFrame(ticker);
    return () => cancelAnimationFrame(animId);
  }, [activeTab, coverFlowAlbums.length, coverFlowIndex, renderCards]);

  const scrollToAlbum = useCallback((targetIndex) => {
    const clamped = Math.max(0, Math.min(coverFlowAlbums.length - 1, targetIndex));
    targetProgress.current = clamped;
  }, [coverFlowAlbums.length]);

  const wheelAccumulator = useRef(0);
  const handleCoverFlowWheel = (e) => {
    e.preventDefault();
    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    wheelAccumulator.current += delta;

    if (Math.abs(wheelAccumulator.current) >= 50) {
      const step = wheelAccumulator.current > 0 ? 1 : -1;
      wheelAccumulator.current = 0;
      targetProgress.current = Math.max(0, Math.min(coverFlowAlbums.length - 1, Math.round(targetProgress.current) + step));
    }
  };

  const handlePointerDown = (e) => {
    // If clicking on an interactive control, do NOT intercept or start dragging!
    if (e.target.closest('button, a, input, .coverflow-info-bar, .coverflow-bottom-drawer, .coverflow-back-tracklist, .coverflow-slider-row')) {
      return;
    }
    isDragging.current = true;
    hasDragged.current = false;
    dragStartX.current = e.clientX;
    dragStartProgress.current = targetProgress.current;
  };

  const handlePointerMove = (e) => {
    if (!isDragging.current) return;
    const dx = e.clientX - dragStartX.current;
    if (Math.abs(dx) > 5) {
      hasDragged.current = true;
      const progressDelta = -dx / 260;
      targetProgress.current = Math.max(0, Math.min(coverFlowAlbums.length - 1, dragStartProgress.current + progressDelta));
    }
  };

  const handlePointerUp = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    if (hasDragged.current) {
      targetProgress.current = Math.round(targetProgress.current);
    }
  };

  // Navigation handlers for Artist Profile & Album templates
  const openArtistProfile = useCallback((artistName, artistAvatar = null, artistId = null) => {
    if (!artistName) return;
    setNavHistory((prev) => [...prev, activeTab]);
    const localMatches = allTracks.filter(
      (t) => t.artist && t.artist.toLowerCase().includes(artistName.toLowerCase())
    );
    setSelectedArtist({
      id: artistId,
      name: artistName,
      avatar: artistAvatar || localMatches[0]?.cover || '/art/default_album.webp',
      topTracks: localMatches,
      albums: []
    });
    setActiveTab('artist');
  }, [activeTab, allTracks]);

  const openAlbumScreen = useCallback((albumData) => {
    if (!albumData) return;
    setNavHistory((prev) => [...prev, activeTab]);
    setSelectedAlbum(albumData);
    setActiveTab('album');
  }, [activeTab]);

  const handleBackNavigation = useCallback(() => {
    setNavHistory((prev) => {
      if (prev.length === 0) {
        setActiveTab('library');
        return [];
      }
      const next = [...prev];
      const lastTab = next.pop();
      setActiveTab(lastTab || 'library');
      return next;
    });
  }, []);

  const playAllTracks = useCallback((tracksToPlay, shuffle = false) => {
    if (!tracksToPlay || tracksToPlay.length === 0) return;
    let sequence = [...tracksToPlay];
    if (shuffle) {
      sequence = [...sequence].sort(() => Math.random() - 0.5);
    }
    const firstTrack = sequence[0];
    const upcoming = sequence.slice(1);
    setManualQueue(upcoming);
    playTrack(firstTrack, { shouldSwitchTab: false, shouldSeedQueue: false });
  }, [playTrack]);

  const toggleLikeAlbum = useCallback((album) => {
    if (!album || !album.tracks || album.tracks.length === 0) return;
    const shouldLike = !album.isLiked;
    const trackIds = new Set(album.tracks.map((t) => t.id));

    setAllTracks((prev) => {
      return prev.map((t) => {
        if (trackIds.has(t.id)) {
          return { ...t, isLiked: shouldLike };
        }
        return t;
      });
    });

    if (authUser && authUser.id !== 'guest_local_listener') {
      album.tracks.forEach((track) => {
        fetch('/api/library', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            track: { ...track, isLiked: shouldLike },
            isLiked: shouldLike
          })
        }).catch(() => {});
      });
    }
  }, [authUser]);

  const addToLibrary = useCallback((track) => {
    if (!track) return;
    setAllTracks((prev) => {
      if (prev.some((t) => t.id === track.id)) return prev;
      return [{ ...track, inPlaylist: true }, ...prev];
    });

    if (authUser && authUser.id !== 'guest_local_listener') {
      fetch('/api/library', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          track: { ...track, inPlaylist: true },
          inPlaylist: true
        })
      }).catch(() => {});
    }
  }, [authUser]);

  const removeTrackFromLibrary = useCallback((trackId) => {
    setAllTracks((prev) => prev.filter((t) => t.id !== trackId));
    if (authUser && authUser.id !== 'guest_local_listener') {
      fetch(`/api/library?trackId=${encodeURIComponent(trackId)}`, {
        method: 'DELETE'
      }).catch(() => {});
    }
  }, [authUser]);

  const toggleLikeTrack = (trackId, trackToAdd = null) => {
    let targetTrack = null;
    let nextLiked = false;

    setAllTracks((prev) => {
      const exists = prev.some((t) => t.id === trackId);
      if (!exists && trackToAdd) {
        targetTrack = { ...trackToAdd, isLiked: true };
        nextLiked = true;
        return [targetTrack, ...prev];
      }
      return prev.map((t) => {
        if (t.id === trackId) {
          nextLiked = !t.isLiked;
          targetTrack = { ...t, isLiked: nextLiked };
          return targetTrack;
        }
        return t;
      });
    });

    setCurrentTrack((prev) => {
      if (prev && prev.id === trackId) {
        return { ...prev, isLiked: !prev.isLiked };
      }
      return prev;
    });

    // Synchronize to Neon DB if user is signed in
    if (authUser && authUser.id !== 'guest_local_listener') {
      const trackPayload = targetTrack || trackToAdd;
      if (trackPayload) {
        fetch('/api/library', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            track: trackPayload,
            isLiked: nextLiked
          })
        }).catch(() => {});
      }
    }
  };

  // Search online submit handler
  const handleSearchSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setSearchFeedback('');
    setActiveTab('search');
    setSearchSortBy('default');

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery.trim())}`);
      const data = await res.json();
      if (data.tracks && data.tracks.length > 0) {
        setSearchResults(data.tracks);
      } else {
        setSearchResults([]);
        setSearchFeedback('No online results found. Try another song title or artist.');
      }
      setSearchAlbums(data.albums || []);
      setSearchArtists(data.artists || []);
    } catch (err) {
      setSearchFeedback('Streaming search error: ' + err.message);
    } finally {
      setIsSearching(false);
    }
  };

  // File upload handler
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const uploaded = files.map((f, i) => {
      const url = URL.createObjectURL(f);
      const nameParts = f.name.replace(/\.[^/.]+$/, '').split(' - ');
      return {
        id: `local-${Date.now()}-${i}`,
        title: nameParts.length > 1 ? nameParts[1].trim() : nameParts[0].trim(),
        artist: nameParts.length > 1 ? nameParts[0].trim() : 'Local Artist',
        album: 'My Uploads',
        src: url,
        cover: '/art/default_album.webp',
        duration: 180,
        isLiked: true,
        inPlaylist: true
      };
    });

    setAllTracks((prev) => [...uploaded, ...prev]);
    setActiveTab('library');
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT') return;

      if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        togglePlayPause();
      } else if (e.key === 'ArrowLeft') {
        if (activeTab === 'cover_flow') {
          e.preventDefault();
          scrollToAlbum(coverFlowIndex - 1);
        }
      } else if (e.key === 'ArrowRight') {
        if (activeTab === 'cover_flow') {
          e.preventDefault();
          scrollToAlbum(coverFlowIndex + 1);
        }
      } else if (e.key === 'Enter') {
        if (activeTab === 'cover_flow' && coverFlowAlbums[coverFlowIndex]) {
          playAllTracks(coverFlowAlbums[coverFlowIndex].tracks, false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, coverFlowIndex, coverFlowAlbums, scrollToAlbum, playAllTracks]);

  // Unique groupings for Search Categories
  const uniqueAlbums = useMemo(() => {
    if (searchAlbums.length > 0) return searchAlbums;
    const map = new Map();
    searchResults.forEach((track) => {
      const albName = track.album || track.title;
      if (!map.has(albName)) {
        map.set(albName, {
          id: `${albName}:::${track.artist}`,
          title: albName,
          album: albName,
          artist: track.artist,
          cover: track.cover || '/art/default_album.webp',
          trackCount: 1,
          year: '2024'
        });
      } else {
        map.get(albName).trackCount += 1;
      }
    });
    return Array.from(map.values());
  }, [searchResults, searchAlbums]);

  const uniqueArtists = useMemo(() => {
    if (searchArtists.length > 0) return searchArtists;
    const map = new Map();
    searchResults.forEach((track) => {
      if (track.artist && !map.has(track.artist)) {
        map.set(track.artist, {
          id: `artist-${encodeURIComponent(track.artist)}`,
          name: track.artist,
          avatar: track.cover || '/art/default_album.webp',
          songCount: 1
        });
      } else if (track.artist) {
        map.get(track.artist).songCount += 1;
      }
    });
    return Array.from(map.values());
  }, [searchResults, searchArtists]);

  // Sorted search tracks
  const sortedSearchResults = useMemo(() => {
    const list = [...searchResults];
    if (searchSortBy === 'title') {
      return list.sort((a, b) => a.title.localeCompare(b.title));
    }
    if (searchSortBy === 'artist') {
      return list.sort((a, b) => a.artist.localeCompare(b.artist));
    }
    if (searchSortBy === 'duration_desc') {
      return list.sort((a, b) => (b.duration || 0) - (a.duration || 0));
    }
    if (searchSortBy === 'duration_asc') {
      return list.sort((a, b) => (a.duration || 0) - (b.duration || 0));
    }
    if (searchSortBy === 'album') {
      return list.sort((a, b) => (a.album || '').localeCompare(b.album || ''));
    }
    return list; // 'default' / popularity
  }, [searchResults, searchSortBy]);

  // Unique groupings for Library Tabs
  const libraryAlbums = useMemo(() => {
    const map = new Map();
    allTracks.forEach((track) => {
      const albName = track.album || track.title || 'Unknown Album';
      const albArtist = track.artist || 'Unknown Artist';
      const key = `${albName}:::${albArtist}`;
      if (!map.has(key)) {
        map.set(key, {
          id: key,
          title: albName,
          artist: albArtist,
          cover: track.cover || '/art/default_album.webp',
          tracks: [track],
          year: track.year || '2024'
        });
      } else {
        map.get(key).tracks.push(track);
      }
    });
    return Array.from(map.values());
  }, [allTracks]);

  const libraryArtists = useMemo(() => {
    const map = new Map();
    allTracks.forEach((track) => {
      const artName = track.artist || 'Unknown Artist';
      if (!map.has(artName)) {
        map.set(artName, {
          name: artName,
          avatar: track.cover || '/art/default_album.webp',
          tracks: [track]
        });
      } else {
        map.get(artName).tracks.push(track);
      }
    });
    return Array.from(map.values());
  }, [allTracks]);

  const formatTime = (secs) => {
    if (!secs || isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Loading gate
  if (!isAuthLoaded) {
    return (
      <div className="laptop-stage">
        <div className="auth-dialog">
          <div style={{ textAlign: 'center', color: '#666666', fontSize: '13px' }}>
            Starting myPod...
          </div>
        </div>
      </div>
    );
  }

  // --- Login Screen ---
  if (!authUser) {
    return (
      <div 
        className={`laptop-stage ${settings.theme === 'classic' ? 'theme-classic' : 'theme-amoled'}`} 
        data-theme={settings.theme || 'amoled'}
        suppressHydrationWarning
      >
        <div className="auth-dialog">
          <div className="auth-icon-circle">
            <Music2 size={26} color="#38bdf8" />
          </div>
          <h1 className="auth-heading">
            {authMode === 'signup' ? 'Create your myPod Account' : 'Welcome to myPod'}
          </h1>
          <p className="auth-sub">
            {authMode === 'signup' 
              ? 'Sign up to sync your Cover Flow, favorites, and high-fidelity presets across devices.' 
              : 'Sign in to access online lossless streaming, Cover Flow, and personalized high-fidelity audio presets.'}
          </p>

          {authError && (
            <div style={{ background: '#2c0b0e', color: '#f87171', border: '1px solid #7f1d1d', borderRadius: '6px', padding: '8px 12px', fontSize: '12px', marginBottom: '14px', textAlign: 'center', width: '100%' }}>
              {authError}
            </div>
          )}

          <form onSubmit={handleSignIn} className="auth-form">
            {authMode === 'signup' && (
              <div className="auth-field">
                <label className="auth-label">
                  YOUR NAME
                </label>
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="Alex"
                  className="auth-input"
                  required
                />
              </div>
            )}
            <div className="auth-field">
              <label className="auth-label">
                EMAIL ADDRESS
              </label>
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="name@example.com"
                className="auth-input"
                required
              />
            </div>
            <div className="auth-field">
              <label className="auth-label">
                PASSWORD
              </label>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="••••••••"
                className="auth-input"
                required
              />
            </div>
            <button type="submit" className="auth-btn-primary" disabled={isSubmittingAuth}>
              {isSubmittingAuth 
                ? 'Connecting...' 
                : authMode === 'signup' 
                  ? 'Create Account & Sign In' 
                  : 'Sign In & Keep Logged In'}
            </button>
          </form>

          {/* Mode Switcher */}
          <div style={{ marginTop: '12px', textAlign: 'center' }}>
            <button
              type="button"
              onClick={() => {
                setAuthMode((m) => (m === 'signin' ? 'signup' : 'signin'));
                setAuthError('');
              }}
              style={{ background: 'none', border: 'none', color: '#38bdf8', fontSize: '12px', fontWeight: 600, cursor: 'pointer', padding: '4px' }}
            >
              {authMode === 'signin' 
                ? "Don't have an account? Sign up" 
                : 'Already have an account? Sign in'}
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', margin: '14px 0', gap: '8px', width: '100%' }}>
            <div style={{ flex: 1, height: '1px', background: '#222222' }} />
            <span style={{ fontSize: '10.5px', color: '#666666', fontWeight: 600 }}>OR</span>
            <div style={{ flex: 1, height: '1px', background: '#222222' }} />
          </div>

          <button onClick={handleGuestSignIn} className="auth-btn-guest">
            Continue as Guest Listener
          </button>
        </div>
      </div>
    );
  }

  // --- Main Application Window ---
  return (
    <div 
      className={`laptop-stage ${settings.theme === 'classic' ? 'theme-classic' : 'theme-amoled'}`} 
      data-theme={settings.theme || 'amoled'}
      suppressHydrationWarning
    >
      {/* Hidden audio element with crossOrigin for Web Audio API DSP pipeline */}
      <audio ref={audioRef} crossOrigin="anonymous" preload="metadata" />
      <div
        id="mypod-yt-player"
        style={{
          position: 'fixed',
          top: '-20px',
          left: '-20px',
          width: '1px',
          height: '1px',
          opacity: 0.001,
          pointerEvents: 'none',
          zIndex: -1
        }}
      />

      <div className="classic-window">
        {/* 1. Status Bar */}
        <div className="status-bar">
          <div className="status-left">
            <span className="status-brand">
              myPod Pro
            </span>
            <span className="status-divider">|</span>
            <div className="status-playing-info" suppressHydrationWarning>
              <span>{isPlaying ? '▶' : '❚❚'}</span>
              <span>{currentTrack ? `${currentTrack.title} — ${currentTrack.artist}` : 'No track playing'}</span>
            </div>
          </div>
          <div className="status-right">
            <button
              onClick={() => {
                setSettings((s) => {
                  const nextTheme = s.theme === 'classic' ? 'amoled' : 'classic';
                  try { localStorage.setItem('mypod_theme_choice_v2', nextTheme); } catch {}
                  return { ...s, theme: nextTheme };
                });
              }}
              className="btn-theme-toggle"
              title={settings.theme === 'classic' ? 'Switch to AMOLED Pitch Black' : 'Switch to Classic iPod Theme'}
              suppressHydrationWarning
            >
              {settings.theme === 'classic' ? (
                <>
                  <Moon size={11} />
                  <span>AMOLED</span>
                </>
              ) : (
                <>
                  <Sun size={11} color="#38bdf8" />
                  <span>Classic</span>
                </>
              )}
            </button>
            <div className="user-badge" suppressHydrationWarning>
              <User size={12} />
              <span>{authUser ? (authUser.name || authUser.email) : 'Guest'}</span>
            </div>
            <button onClick={handleSignOut} className="btn-small-gray" title="Sign Out">
              Sign Out
            </button>
            <div
              className={`battery-box ${batteryState.charging ? 'charging' : ''}`}
              title={batteryState.charging ? `Charging (${Math.round(batteryState.level * 100)}%) • Click to toggle charging simulation` : `Battery: ${Math.round(batteryState.level * 100)}% • Click to toggle charging simulation`}
              onClick={() => setBatteryState((b) => ({ ...b, charging: !b.charging }))}
            >
              <div
                className="battery-fill"
                style={{
                  width: `${Math.max(10, Math.round(batteryState.level * 100))}%`,
                  background: batteryState.level <= 0.2 && !batteryState.charging ? '#ef4444' : '#10b981'
                }}
              />
              {batteryState.charging && (
                <Zap size={9} className="battery-bolt-icon" fill="#ffffff" color="#ffffff" />
              )}
            </div>
          </div>
        </div>

        {/* 2. Navigation & Search Header */}
        <div className="nav-header">
          <form onSubmit={handleSearchSubmit} className="search-box">
            <Search size={14} className="search-box-icon" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search lossless songs, artists, albums..."
              className="search-input"
            />
          </form>

          <div className="nav-tabs">
            <button
              onClick={() => setActiveTab('cover_flow')}
              className={`nav-tab-btn ${activeTab === 'cover_flow' ? 'active' : ''}`}
            >
              <Disc size={13} />
              Cover Flow ({coverFlowAlbums.length})
            </button>
            <button
              onClick={() => setActiveTab('now_playing')}
              className={`nav-tab-btn ${activeTab === 'now_playing' ? 'active' : ''}`}
            >
              <Play size={13} />
              Now Playing
            </button>
            <button
              onClick={() => setActiveTab('queue')}
              className={`nav-tab-btn ${activeTab === 'queue' ? 'active' : ''}`}
            >
              <ListMusic size={13} />
              Queue {manualQueue.length > 0 && `(${manualQueue.length})`}
            </button>
            <button
              onClick={() => setActiveTab('search')}
              className={`nav-tab-btn ${activeTab === 'search' ? 'active' : ''}`}
            >
              <Search size={13} />
              Search {searchResults.length > 0 && `(${searchResults.length})`}
            </button>
            <button
              onClick={() => {
                openAlbumScreen({
                  type: 'playlist',
                  id: 'liked-music-playlist',
                  title: 'Liked Music',
                  artist: 'Curated by You',
                  cover: '/art/liked_music_cover.webp',
                  year: '2024',
                  genre: 'Favorites',
                  tracks: likedSongs,
                  isLiked: true,
                  description: 'All your favorite hearted songs, automatically synchronized with Cover Flow.'
                });
              }}
              className={`nav-tab-btn ${(activeTab === 'album' && selectedAlbum?.id === 'liked-music-playlist') || activeTab === 'playlists' ? 'active' : ''}`}
            >
              <FolderHeart size={13} />
              Liked Music ({likedSongs.length})
            </button>
            <button
              onClick={() => setActiveTab('library')}
              className={`nav-tab-btn ${activeTab === 'library' ? 'active' : ''}`}
            >
              <Music2 size={13} />
              Library ({allTracks.length})
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`nav-tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
            >
              <Settings size={13} />
              Settings
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={`nav-tab-btn ${activeTab === 'upload' ? 'active' : ''}`}
            >
              <Upload size={13} />
              Add Files
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="main-stage">
          {/* --- 1. COVER FLOW VIEW (GSAP + Lenis Smooth Momentum) --- */}
          {activeTab === 'cover_flow' && (
            <div
              className="coverflow-stage"
              onWheel={handleCoverFlowWheel}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
            >
              {coverFlowAlbums.length === 0 ? (
                <div className="empty-coverflow">
                  <Disc size={54} color="#666" style={{ opacity: 0.6 }} />
                  <h3 style={{ fontSize: '20px', fontWeight: 800, margin: '10px 0 6px', letterSpacing: '-0.3px' }}>
                    Your Cover Flow is Empty
                  </h3>
                  <p style={{ fontSize: '13px', maxWidth: '380px', lineHeight: 1.5, margin: '6px 0 20px' }}>
                    Click the heart (❤️) on any track in Search or Library to display your albums in 3D Cover Flow.
                  </p>
                  <button onClick={() => setActiveTab('library')} className="btn-play-album">
                    Browse Library
                  </button>
                </div>
              ) : (
                <>
                  <div className="coverflow-track">
                    {coverFlowAlbums.map((album, idx) => {
                      const isFlipped = flippedAlbumId === album.id;
                      return (
                        <div
                          key={album.id}
                          ref={(el) => (cardRefs.current[idx] = el)}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (hasDragged.current) return;
                            if (Math.abs(currentProgress.current - idx) < 0.5 || coverFlowIndex === idx) {
                              setFlippedAlbumId((prev) => (prev === album.id ? null : album.id));
                            } else {
                              setFlippedAlbumId(null);
                              scrollToAlbum(idx);
                            }
                          }}
                          className={`coverflow-card ${isFlipped ? 'flipped' : ''}`}
                        >
                          <div className="coverflow-card-inner">
                            {/* Front Face: Album Art & Mirror Reflection */}
                            <div className="coverflow-card-front">
                              <img
                                src={album.cover || '/art/default_album.webp'}
                                alt={album.title}
                                className="coverflow-art"
                                width={220}
                                height={220}
                                referrerPolicy="no-referrer"
                                decoding="async"
                                onError={(e) => {
                                  e.currentTarget.onerror = null;
                                  e.currentTarget.src = '/art/default_album.webp';
                                }}
                              />
                              <div className="coverflow-reflection">
                                <img
                                  src={album.cover || '/art/default_album.webp'}
                                  alt=""
                                  aria-hidden="true"
                                  width={220}
                                  height={220}
                                  loading="lazy"
                                  referrerPolicy="no-referrer"
                                  decoding="async"
                                  onError={(e) => {
                                    e.currentTarget.onerror = null;
                                    e.currentTarget.src = '/art/default_album.webp';
                                  }}
                                />
                              </div>
                            </div>

                            {/* Back Face: Tracklist of Album */}
                            <div className="coverflow-card-back">
                              <div className="coverflow-back-header">
                                <div className="coverflow-back-title">{album.title}</div>
                                <div className="coverflow-back-artist">{album.artist}</div>
                              </div>
                              <div className="coverflow-back-tracklist">
                                {album.tracks.map((t, tIdx) => (
                                  <div
                                    key={t.id || tIdx}
                                    className={`coverflow-back-row ${currentTrack && currentTrack.id === t.id ? 'active' : ''}`}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const upcoming = album.tracks.slice(tIdx + 1);
                                      setManualQueue(upcoming);
                                      playTrack(t, { shouldSwitchTab: false, shouldSeedQueue: false });
                                    }}
                                  >
                                    <span className="cf-back-num">{tIdx + 1}</span>
                                    <span className="cf-back-title">{t.title}</span>
                                    <span className="cf-back-dur">{formatTime(t.duration)}</span>
                                  </div>
                                ))}
                              </div>
                              <button
                                className="coverflow-back-flip-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setFlippedAlbumId(null);
                                }}
                              >
                                Flip Back
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Scrubber slider */}
                  {coverFlowAlbums.length > 1 && !flippedAlbumId && (
                    <div className="coverflow-slider-row">
                      <span className="coverflow-counter">{coverFlowIndex + 1} / {coverFlowAlbums.length}</span>
                      <input
                        type="range"
                        min="0"
                        max={coverFlowAlbums.length - 1}
                        value={coverFlowIndex}
                        onChange={(e) => scrollToAlbum(parseInt(e.target.value, 10))}
                        className="coverflow-slider"
                      />
                    </div>
                  )}

                  {/* Centered Track Badge & Controls */}
                  {coverFlowAlbums[coverFlowIndex] && !flippedAlbumId && (
                    <div className="coverflow-info-bar">
                      <button
                        onClick={() => scrollToAlbum(coverFlowIndex - 1)}
                        className="coverflow-nav-btn"
                        title="Previous Album"
                      >
                        <ChevronLeft size={20} />
                      </button>

                      <div className="coverflow-info-text">
                        <div className="coverflow-info-title">
                          {coverFlowAlbums[coverFlowIndex].title}
                        </div>
                        <div className="coverflow-info-sub">
                          <span
                            className="coverflow-artist-link"
                            onClick={() => openArtistProfile(coverFlowAlbums[coverFlowIndex].artist, coverFlowAlbums[coverFlowIndex].cover)}
                            title="View Artist Profile"
                          >
                            {coverFlowAlbums[coverFlowIndex].artist}
                          </span>
                          <span className="coverflow-bullet">•</span>
                          <span>
                            {coverFlowAlbums[coverFlowIndex].tracks.length} {coverFlowAlbums[coverFlowIndex].tracks.length === 1 ? 'song' : 'songs'}
                          </span>
                        </div>

                        {/* Action Buttons Row */}
                        <div className="coverflow-actions-row">
                          <button
                            onClick={() => {
                              const alb = coverFlowAlbums[coverFlowIndex];
                              if (alb && alb.tracks.length > 0) {
                                if (currentTrack && alb.tracks.some(t => t.id === currentTrack.id) && isPlaying) {
                                  togglePlayPause();
                                } else {
                                  playAllTracks(alb.tracks, false);
                                  setFlippedAlbumId(alb.id);
                                }
                              }
                            }}
                            className="btn-play-album"
                            title="Play all tracks in album"
                          >
                            {currentTrack && coverFlowAlbums[coverFlowIndex].tracks.some(t => t.id === currentTrack.id) && isPlaying ? (
                              <>
                                <Pause size={14} fill="currentColor" />
                                <span>Pause</span>
                              </>
                            ) : (
                              <>
                                <Play size={14} fill="currentColor" />
                                <span>Play Album</span>
                              </>
                            )}
                          </button>

                          <button
                            onClick={() => {
                              const alb = coverFlowAlbums[coverFlowIndex];
                              if (alb && alb.tracks.length > 0) {
                                playAllTracks(alb.tracks, true);
                                setFlippedAlbumId(alb.id);
                              }
                            }}
                            className="btn-cf-action"
                            title="Shuffle Album Tracks"
                          >
                            <Shuffle size={14} />
                            <span>Shuffle</span>
                          </button>
                        </div>
                      </div>

                      <button
                        onClick={() => scrollToAlbum(coverFlowIndex + 1)}
                        className="coverflow-nav-btn"
                        title="Next Album"
                      >
                        <ChevronRight size={20} />
                      </button>
                    </div>
                  )}

                  {/* Bottom Drawer Playlist: Apple iPod / Apple Music style slide-up menu bar */}
                  {flippedAlbumId && coverFlowAlbums[coverFlowIndex] && flippedAlbumId === coverFlowAlbums[coverFlowIndex].id && (
                    <div className="coverflow-bottom-drawer" onClick={(e) => e.stopPropagation()}>
                      <div className="cf-drawer-bar">
                        <div className="cf-drawer-meta">
                          <img
                            src={coverFlowAlbums[coverFlowIndex].cover || '/art/default_album.webp'}
                            alt={coverFlowAlbums[coverFlowIndex].title}
                            className="cf-drawer-thumb"
                            width={42}
                            height={42}
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = '/art/default_album.webp';
                            }}
                          />
                          <div className="cf-drawer-titles">
                            <div className="cf-drawer-album-name">{coverFlowAlbums[coverFlowIndex].title}</div>
                            <div className="cf-drawer-artist-name">
                              <span
                                onClick={() => openArtistProfile(coverFlowAlbums[coverFlowIndex].artist, coverFlowAlbums[coverFlowIndex].cover)}
                                className="clickable-artist-link"
                              >
                                {coverFlowAlbums[coverFlowIndex].artist}
                              </span>
                              <span className="cf-drawer-dot">•</span>
                              <span>{coverFlowAlbums[coverFlowIndex].tracks.length} {coverFlowAlbums[coverFlowIndex].tracks.length === 1 ? 'song' : 'songs'}</span>
                            </div>
                          </div>
                        </div>
                        <div className="cf-drawer-actions">
                          <button
                            onClick={() => playAllTracks(coverFlowAlbums[coverFlowIndex].tracks, false)}
                            className="btn-cf-drawer-action primary"
                            title="Play All Songs in Sequence"
                          >
                            <Play size={12} fill="currentColor" />
                            <span>Play All</span>
                          </button>
                          <button
                            onClick={() => playAllTracks(coverFlowAlbums[coverFlowIndex].tracks, true)}
                            className="btn-cf-drawer-action"
                            title="Shuffle Album Songs"
                          >
                            <Shuffle size={12} />
                            <span>Shuffle</span>
                          </button>
                          <button
                            onClick={() => setFlippedAlbumId(null)}
                            className="btn-cf-drawer-close"
                            title="Close Playlist"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                      <div className="cf-drawer-tracklist">
                        {coverFlowAlbums[coverFlowIndex].tracks.map((t, tIdx) => {
                          const isCurrentSongPlaying = currentTrack && currentTrack.id === t.id && isPlaying;
                          return (
                            <div
                              key={t.id || tIdx}
                              className={`cf-drawer-track-row ${currentTrack && currentTrack.id === t.id ? 'active' : ''}`}
                              onClick={() => {
                                const upcoming = coverFlowAlbums[coverFlowIndex].tracks.slice(tIdx + 1);
                                setManualQueue(upcoming);
                                playTrack(t, { shouldSwitchTab: false, shouldSeedQueue: false });
                              }}
                            >
                              <div className="cf-drawer-track-left">
                                <span className="cf-drawer-num">
                                  {isCurrentSongPlaying ? (
                                    <span className="cf-mini-soundwave">
                                      <span /><span /><span />
                                    </span>
                                  ) : (
                                    tIdx + 1
                                  )}
                                </span>
                                <Play size={11} className="cf-row-play-icon" fill="currentColor" />
                                <span className="cf-drawer-track-title">{t.title}</span>
                              </div>
                              <span className="cf-drawer-track-time">{formatTime(t.duration)}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* --- 2. SEARCH RESULTS VIEW (Full Length Online Streaming Table & Categories) --- */}
          {activeTab === 'search' && (
            <div className="playlist-container">
              <div className="playlist-header">
                <div>
                  <h2 className="playlist-title">Online Streaming Search Results</h2>
                  <p className="playlist-subtitle">
                    Showing results for "{searchQuery}". Click any song or cover to stream immediately, or click ❤️ to add to Cover Flow!
                  </p>
                </div>
              </div>

              {/* Search Category Filter Bar: Song, Album, Artist & Sorting Controls */}
              <div className="search-toolbar-row">
                <div className="search-category-tabs">
                  <button
                    type="button"
                    onClick={() => setSearchCategory('songs')}
                    className={`search-cat-tab ${searchCategory === 'songs' ? 'active' : ''}`}
                  >
                    <Music2 size={13} />
                    <span>Songs</span>
                    {searchResults.length > 0 && <span className="search-cat-count">{searchResults.length}</span>}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSearchCategory('albums')}
                    className={`search-cat-tab ${searchCategory === 'albums' ? 'active' : ''}`}
                  >
                    <Disc size={13} />
                    <span>Albums</span>
                    {uniqueAlbums.length > 0 && <span className="search-cat-count">{uniqueAlbums.length}</span>}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSearchCategory('artists')}
                    className={`search-cat-tab ${searchCategory === 'artists' ? 'active' : ''}`}
                  >
                    <User size={13} />
                    <span>Artists</span>
                    {uniqueArtists.length > 0 && <span className="search-cat-count">{uniqueArtists.length}</span>}
                  </button>
                </div>

                {searchCategory === 'songs' && searchResults.length > 0 && (
                  <div className="search-sort-container">
                    <span className="search-sort-label">Sort:</span>
                    <div className="search-sort-pills">
                      <button
                        type="button"
                        onClick={() => setSearchSortBy('default')}
                        className={`sort-pill ${searchSortBy === 'default' ? 'active' : ''}`}
                        title="Sort by Popularity / Relevance"
                      >
                        Relevance
                      </button>
                      <button
                        type="button"
                        onClick={() => setSearchSortBy('title')}
                        className={`sort-pill ${searchSortBy === 'title' ? 'active' : ''}`}
                        title="Sort Alphabetically by Song Title"
                      >
                        Title (A-Z)
                      </button>
                      <button
                        type="button"
                        onClick={() => setSearchSortBy('artist')}
                        className={`sort-pill ${searchSortBy === 'artist' ? 'active' : ''}`}
                        title="Sort Alphabetically by Artist Name"
                      >
                        Artist (A-Z)
                      </button>
                      <button
                        type="button"
                        onClick={() => setSearchSortBy(searchSortBy === 'duration_desc' ? 'duration_asc' : 'duration_desc')}
                        className={`sort-pill ${searchSortBy.startsWith('duration') ? 'active' : ''}`}
                        title="Sort by Track Duration"
                      >
                        Duration {searchSortBy === 'duration_asc' ? '↑' : '↓'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setSearchSortBy('album')}
                        className={`sort-pill ${searchSortBy === 'album' ? 'active' : ''}`}
                        title="Sort Alphabetically by Album Title"
                      >
                        Album
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {searchFeedback && (
                <div style={{ padding: '24px', textAlign: 'center', color: '#888888', fontSize: '13px' }}>
                  {searchFeedback}
                </div>
              )}

              {/* 2A. Songs View */}
              {searchCategory === 'songs' && (
                <table className="track-table">
                  <thead>
                    <tr>
                      <th style={{ width: '45px' }}>#</th>
                      <th style={{ width: '60px' }}>Cover</th>
                      <th>Title</th>
                      <th style={{ width: '22%' }}>Artist</th>
                      <th style={{ width: '24%' }}>Album</th>
                      <th style={{ width: '70px' }}>Time</th>
                      <th style={{ width: '110px', textAlign: 'center' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedSearchResults.map((track, i) => {
                      const isCurrent = currentTrack && currentTrack.id === track.id;
                      const inLib = allTracks.some((t) => t.id === track.id && (t.isLiked || t.inPlaylist));

                      return (
                        <tr
                          key={track.id || i}
                          className={`track-row ${isCurrent ? 'active' : ''}`}
                        >
                          <td className="cell-num">{i + 1}</td>
                          <td
                            className="clickable-cover"
                            onClick={() => playTrack(track)}
                            title={`Play "${track.title}"`}
                          >
                            <img
                              src={track.cover || '/art/default_album.webp'}
                              alt={track.title}
                              width={38}
                              height={38}
                              loading="lazy"
                              decoding="async"
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = '/art/default_album.webp';
                              }}
                              style={{ width: '38px', height: '38px', borderRadius: '4px', objectFit: 'cover', display: 'block' }}
                            />
                          </td>
                          <td
                            className="clickable-title cell-title"
                            onClick={() => playTrack(track)}
                            title={`Play "${track.title}"`}
                          >
                            {track.title}
                          </td>
                          <td className="cell-artist">
                            <span 
                              className="clickable-artist-link"
                              onClick={() => openArtistProfile(track.artist, track.cover)}
                              title={`View ${track.artist}'s profile`}
                            >
                              {track.artist}
                            </span>
                          </td>
                          <td className="cell-album">
                            <span
                              className="clickable-album-link"
                              onClick={() => openAlbumScreen({
                                id: `${track.album || track.title}:::${track.artist}`,
                                title: track.album || track.title,
                                artist: track.artist,
                                cover: track.cover,
                                tracks: searchResults.filter((t) => (t.album || t.title) === (track.album || track.title))
                              })}
                              title={`View "${track.album}" album`}
                            >
                              {track.album}
                            </span>
                          </td>
                          <td className="cell-time">{formatTime(track.duration)}</td>
                          <td onClick={(e) => e.stopPropagation()} style={{ textAlign: 'center' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  addToLibrary(track);
                                  addToQueue(track);
                                }}
                                className="btn-icon-heart"
                                title="Add to Library & Queue"
                              >
                                <Plus size={16} color="#38bdf8" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleLikeTrack(track.id, track);
                                }}
                                className="btn-icon-heart"
                                title={inLib ? 'In Liked Music & Cover Flow' : 'Add to Liked Music & Cover Flow'}
                              >
                                <Heart size={16} fill={inLib ? '#ef4444' : 'none'} color={inLib ? '#ef4444' : '#888888'} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}

              {/* 2B. Albums View */}
              {searchCategory === 'albums' && (
                <div className="search-albums-grid">
                  {uniqueAlbums.length === 0 ? (
                    <div className="search-cat-empty">
                      No albums found. Try searching for an artist or album title above.
                    </div>
                  ) : (
                    <div className="albums-card-grid">
                      {uniqueAlbums.map((alb, idx) => (
                        <div 
                          key={`album-${idx}`} 
                          className="album-card"
                          onClick={() => openAlbumScreen({
                            id: alb.id,
                            title: alb.title || alb.album,
                            artist: alb.artist,
                            cover: alb.cover,
                            year: alb.year
                          })}
                          style={{ cursor: 'pointer' }}
                          title={`Open "${alb.title || alb.album}" album`}
                        >
                          <img
                            src={alb.cover}
                            alt={alb.title || alb.album}
                            className="album-card-cover"
                            width={160}
                            height={160}
                            loading="lazy"
                            decoding="async"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = '/art/default_album.webp';
                            }}
                          />
                          <div className="album-card-title">{alb.title || alb.album}</div>
                          <div className="album-card-artist">{alb.artist} • {alb.year || 'Album'}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 2C. Artists View */}
              {searchCategory === 'artists' && (
                <div className="search-artists-stage">
                  {uniqueArtists.length === 0 ? (
                    <div className="search-cat-empty">
                      No artists found. Try searching for an artist above.
                    </div>
                  ) : (
                    <div className="artists-card-grid">
                      {uniqueArtists.map((art, idx) => (
                        <div 
                          key={`artist-${idx}`} 
                          className="artist-preview-card"
                          onClick={() => openArtistProfile(art.name, art.avatar, art.id)}
                          style={{ cursor: 'pointer' }}
                          title={`Open ${art.name}'s profile`}
                        >
                          <div className="artist-avatar-wrap">
                            <img
                              src={art.avatar}
                              alt={art.name}
                              className="artist-avatar-img"
                              width={64}
                              height={64}
                              loading="lazy"
                              decoding="async"
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = '/art/default_album.webp';
                              }}
                            />
                          </div>
                          <div className="artist-info-wrap">
                            <div className="artist-name-text">{art.name}</div>
                            <div className="artist-sub-text">Artist • {art.songCount} {art.songCount === 1 ? 'song' : 'songs'} in results</div>
                            <span className="artist-tag-badge">Open Artist Profile</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* --- 3. FAVORITES / PLAYLISTS VIEW (Apple Music Liked Music Template) --- */}
          {activeTab === 'playlists' && (
            <AlbumScreenView
              album={{
                type: 'playlist',
                id: 'liked-music-playlist',
                title: 'Liked Music',
                artist: 'Curated by You',
                cover: '/art/liked_music_cover.webp',
                year: '2024',
                genre: 'Favorites',
                tracks: likedSongs,
                isLiked: true,
                description: 'All your favorite hearted tracks, automatically synchronized with Cover Flow.'
              }}
              onBack={handleBackNavigation}
              onPlayTrack={playTrack}
              onPlayAll={playAllTracks}
              onSelectArtist={openArtistProfile}
              currentTrack={currentTrack}
              isPlaying={isPlaying}
              toggleLikeTrack={toggleLikeTrack}
              toggleLikeAlbum={toggleLikeAlbum}
              addToQueue={addToQueue}
              allTracks={allTracks}
              theme={settings.theme}
            />
          )}

          {/* --- 4. LIBRARY VIEW (Playlists, Songs, Albums, Artists) --- */}
          {activeTab === 'library' && (
            <div className="playlist-container">
              <div className="playlist-header">
                <div>
                  <h2 className="playlist-title">Library</h2>
                  <p className="playlist-subtitle">
                    Manage your saved music, albums, and curated playlists. Fully synchronized with Cover Flow.
                  </p>
                </div>
              </div>

              {/* Library Navigation Tabs: Playlists, Songs, Albums, Artists */}
              <div className="library-subnav-tabs">
                <button
                  type="button"
                  onClick={() => setLibraryTab('playlists')}
                  className={`library-subnav-btn ${libraryTab === 'playlists' ? 'active' : ''}`}
                >
                  <FolderHeart size={13} />
                  <span>Playlists (1)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLibraryTab('songs')}
                  className={`library-subnav-btn ${libraryTab === 'songs' ? 'active' : ''}`}
                >
                  <Music2 size={13} />
                  <span>Songs ({allTracks.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLibraryTab('albums')}
                  className={`library-subnav-btn ${libraryTab === 'albums' ? 'active' : ''}`}
                >
                  <Disc size={13} />
                  <span>Albums ({libraryAlbums.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLibraryTab('artists')}
                  className={`library-subnav-btn ${libraryTab === 'artists' ? 'active' : ''}`}
                >
                  <User size={13} />
                  <span>Artists ({libraryArtists.length})</span>
                </button>
              </div>

              {/* 4A. Playlists Tab (Featured Liked Music Smart Playlist) */}
              {libraryTab === 'playlists' && (
                <div className="playlists-card-grid">
                  <div
                    className="featured-playlist-card"
                    onClick={() => {
                      openAlbumScreen({
                        type: 'playlist',
                        id: 'liked-music-playlist',
                        title: 'Liked Music',
                        artist: 'Curated by You',
                        cover: '/art/liked_music_cover.webp',
                        year: '2024',
                        genre: 'Favorites',
                        tracks: likedSongs,
                        isLiked: true,
                        description: 'All your favorite hearted tracks, automatically synchronized with Cover Flow.'
                      });
                    }}
                  >
                    <div className="featured-playlist-art-wrap gradient-liked">
                      <Heart size={48} fill="#ffffff" color="#ffffff" className="featured-playlist-heart" />
                    </div>
                    <div className="featured-playlist-info">
                      <div>
                        <span className="featured-playlist-tag">Smart Playlist</span>
                        <h3 className="featured-playlist-title">Liked Music</h3>
                        <p className="featured-playlist-sub">
                          {likedSongs.length} {likedSongs.length === 1 ? 'song' : 'songs'} • Auto-updated with every hearted track
                        </p>
                      </div>
                      <div className="featured-playlist-actions">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (likedSongs.length > 0) {
                              playAllTracks(likedSongs, false);
                            }
                          }}
                          className="apple-pill-btn apple-pill-btn-primary"
                          style={{ height: '28px', padding: '0 12px', fontSize: '11.5px' }}
                        >
                          <Play size={12} fill="currentColor" />
                          <span>Play</span>
                        </button>
                        <span className="btn-open-playlist">Open Playlist →</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 4B. Songs Tab (All Tracks Table) */}
              {libraryTab === 'songs' && (
                <>
                  {allTracks.length === 0 ? (
                    <div style={{ padding: '60px 20px', textAlign: 'center', color: '#666', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      <Music2 size={36} color="#444" style={{ marginBottom: '10px' }} />
                      <p style={{ fontSize: '14px', fontWeight: 600, color: '#e5e5e5' }}>Your library is empty.</p>
                      <p style={{ fontSize: '12px', color: '#888888', marginTop: '4px' }}>
                        Search for songs or click the heart (❤️) on any track to add it here.
                      </p>
                      <button onClick={() => setActiveTab('search')} className="btn-small-gray" style={{ height: '30px', padding: '0 16px', marginTop: '14px' }}>
                        Search Music
                      </button>
                    </div>
                  ) : (
                    <table className="track-table">
                      <thead>
                        <tr>
                          <th style={{ width: '45px' }}>#</th>
                          <th style={{ width: '60px' }}>Cover</th>
                          <th>Title</th>
                          <th style={{ width: '22%' }}>Artist</th>
                          <th style={{ width: '24%' }}>Album</th>
                          <th style={{ width: '70px' }}>Time</th>
                          <th style={{ width: '130px', textAlign: 'center' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allTracks.map((track, i) => {
                          const isCurrent = currentTrack && currentTrack.id === track.id;

                          return (
                            <tr
                              key={track.id}
                              className={`track-row ${isCurrent ? 'active' : ''}`}
                            >
                              <td className="cell-num">{i + 1}</td>
                              <td
                                className="clickable-cover"
                                onClick={() => playTrack(track)}
                                title={`Play "${track.title}"`}
                              >
                                <img
                                  src={track.cover || '/art/default_album.webp'}
                                  alt={track.title}
                                  width={38}
                                  height={38}
                                  loading="lazy"
                                  decoding="async"
                                  referrerPolicy="no-referrer"
                                  onError={(e) => {
                                    e.currentTarget.onerror = null;
                                    e.currentTarget.src = '/art/default_album.webp';
                                  }}
                                  style={{ width: '38px', height: '38px', borderRadius: '4px', objectFit: 'cover', display: 'block' }}
                                />
                              </td>
                              <td
                                className="clickable-title cell-title"
                                onClick={() => playTrack(track)}
                                title={`Play "${track.title}"`}
                              >
                                {track.title}
                              </td>
                              <td className="cell-artist">
                                <span
                                  className="clickable-artist-link"
                                  onClick={() => openArtistProfile(track.artist, track.cover)}
                                  title={`View ${track.artist}'s profile`}
                                >
                                  {track.artist}
                                </span>
                              </td>
                              <td className="cell-album">
                                <span
                                  className="clickable-album-link"
                                  onClick={() => openAlbumScreen({
                                    id: `${track.album || track.title}:::${track.artist}`,
                                    title: track.album || track.title,
                                    artist: track.artist,
                                    cover: track.cover,
                                    tracks: allTracks.filter((t) => (t.album || t.title) === (track.album || track.title))
                                  })}
                                  title={`View "${track.album}" album`}
                                >
                                  {track.album}
                                </span>
                              </td>
                              <td className="cell-time">{formatTime(track.duration)}</td>
                              <td onClick={(e) => e.stopPropagation()} style={{ textAlign: 'center' }}>
                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      addToQueue(track);
                                    }}
                                    className="btn-icon-heart"
                                    title="Add to Up Next Queue"
                                  >
                                    <Plus size={16} color="#38bdf8" />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleLikeTrack(track.id, track);
                                    }}
                                    className="btn-icon-heart"
                                    title={track.isLiked ? 'In Liked Music & Cover Flow' : 'Add to Liked Music & Cover Flow'}
                                  >
                                    <Heart size={16} fill={track.isLiked ? '#ef4444' : 'none'} color={track.isLiked ? '#ef4444' : '#888888'} />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      removeTrackFromLibrary(track.id);
                                    }}
                                    className="btn-icon-heart"
                                    title="Remove from Library"
                                  >
                                    <Trash2 size={15} color="#ef4444" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </>
              )}

              {/* 4C. Albums Tab */}
              {libraryTab === 'albums' && (
                <div className="search-albums-grid">
                  {libraryAlbums.length === 0 ? (
                    <div className="search-cat-empty">
                      No albums in your library yet. Like songs or add tracks to showcase albums here.
                    </div>
                  ) : (
                    <div className="albums-card-grid">
                      {libraryAlbums.map((alb, idx) => (
                        <div
                          key={`lib-album-${idx}`}
                          className="album-card"
                          onClick={() => openAlbumScreen({
                            id: alb.id,
                            title: alb.title,
                            artist: alb.artist,
                            cover: alb.cover,
                            tracks: alb.tracks
                          })}
                          style={{ cursor: 'pointer' }}
                          title={`Open ${alb.title} album`}
                        >
                          <img
                            src={alb.cover}
                            alt={alb.title}
                            className="album-card-cover"
                            width={160}
                            height={160}
                            loading="lazy"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = '/art/default_album.webp';
                            }}
                          />
                          <div className="album-card-title">{alb.title}</div>
                          <div className="album-card-artist">{alb.artist} • {alb.tracks.length} {alb.tracks.length === 1 ? 'song' : 'songs'}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 4D. Artists Tab */}
              {libraryTab === 'artists' && (
                <div className="search-artists-stage">
                  {libraryArtists.length === 0 ? (
                    <div className="search-cat-empty">
                      No artists in your library yet.
                    </div>
                  ) : (
                    <div className="artists-card-grid">
                      {libraryArtists.map((art, idx) => (
                        <div
                          key={`lib-art-${idx}`}
                          className="artist-preview-card"
                          onClick={() => openArtistProfile(art.name, art.avatar)}
                          style={{ cursor: 'pointer' }}
                          title={`Open ${art.name}'s profile`}
                        >
                          <div className="artist-avatar-wrap">
                            <img
                              src={art.avatar}
                              alt={art.name}
                              className="artist-avatar-img"
                              width={64}
                              height={64}
                              loading="lazy"
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = '/art/default_album.webp';
                              }}
                            />
                          </div>
                          <div className="artist-info-wrap">
                            <div className="artist-name-text">{art.name}</div>
                            <div className="artist-sub-text">Artist • {art.tracks.length} {art.tracks.length === 1 ? 'song' : 'songs'} in library</div>
                            <span className="artist-tag-badge">Open Artist Profile</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* --- 5. ARTIST PROFILE TEMPLATE VIEW --- */}
          {activeTab === 'artist' && selectedArtist && (
            <ArtistProfileView
              artist={selectedArtist}
              onBack={handleBackNavigation}
              onPlayTrack={playTrack}
              onPlayAll={playAllTracks}
              onSelectAlbum={openAlbumScreen}
              currentTrack={currentTrack}
              isPlaying={isPlaying}
              toggleLikeTrack={toggleLikeTrack}
              addToQueue={addToQueue}
              allTracks={allTracks}
              theme={settings.theme}
            />
          )}

          {/* --- 6. ALBUM & PLAYLIST SCREEN TEMPLATE VIEW --- */}
          {activeTab === 'album' && selectedAlbum && (
            <AlbumScreenView
              album={selectedAlbum.id === 'liked-music-playlist' ? { ...selectedAlbum, tracks: likedSongs } : selectedAlbum}
              onBack={handleBackNavigation}
              onPlayTrack={playTrack}
              onPlayAll={playAllTracks}
              onSelectArtist={openArtistProfile}
              currentTrack={currentTrack}
              isPlaying={isPlaying}
              toggleLikeTrack={toggleLikeTrack}
              toggleLikeAlbum={toggleLikeAlbum}
              addToQueue={addToQueue}
              allTracks={allTracks}
              theme={settings.theme}
            />
          )}

          {/* --- 5. NOW PLAYING VIEW --- */}
          {activeTab === 'now_playing' && (
            !currentTrack ? (
              <div className="now-playing-empty">
                <div className="np-empty-icon-box">
                  <Disc size={46} color="#444444" />
                </div>
                <h2 className="np-empty-title">No Track Playing</h2>
                <p className="np-empty-desc">
                  Select a song from Search, your Library, or Cover Flow to start listening.
                </p>
                <button onClick={() => setActiveTab('search')} className="btn-empty-search">
                  <Search size={15} />
                  <span>Search Songs</span>
                </button>
              </div>
            ) : (
              <div className="now-playing-stage">
                {/* 3D Angled Cover Art with Mirror Reflection & Glass Sheen */}
                <div className="now-playing-cover-stage">
                  <div className="now-playing-cover-3d">
                    <div className="now-playing-art-wrap">
                      <img
                        src={currentTrack.cover || '/art/default_album.webp'}
                        alt={currentTrack.title}
                        className="now-playing-art-img"
                        width={340}
                        height={340}
                        fetchPriority="high"
                        decoding="async"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = '/art/default_album.webp';
                        }}
                      />
                      <div className="now-playing-glass-sheen" />
                    </div>
                    <div className="now-playing-reflection">
                      <img
                        src={currentTrack.cover || '/art/default_album.webp'}
                        alt=""
                        aria-hidden="true"
                        width={340}
                        height={340}
                        loading="lazy"
                        decoding="async"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = '/art/default_album.webp';
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Track Details & Scrubber */}
                <div className="now-playing-details-box">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span className="np-track-num">
                      {allTracks.findIndex((t) => t.id === currentTrack.id) >= 0 
                        ? `Track ${allTracks.findIndex((t) => t.id === currentTrack.id) + 1} of ${allTracks.length}` 
                        : 'Streaming Online'}
                    </span>
                    <button
                      onClick={() => toggleLikeTrack(currentTrack.id, currentTrack)}
                      className="np-heart-btn"
                    >
                      <Heart
                        size={14}
                        fill={allTracks.some((t) => t.id === currentTrack.id && t.isLiked) ? '#ef4444' : 'none'}
                        color={allTracks.some((t) => t.id === currentTrack.id && t.isLiked) ? '#ef4444' : 'currentColor'}
                      />
                      <span>{allTracks.some((t) => t.id === currentTrack.id && t.isLiked) ? 'In Cover Flow' : 'Add to Cover Flow'}</span>
                    </button>
                  </div>

                  <div>
                    <h1 className="np-song-title">{currentTrack.title}</h1>
                    <h2 
                      className="np-song-artist clickable-artist-link"
                      onClick={() => openArtistProfile(currentTrack.artist, currentTrack.cover)}
                      title={`View ${currentTrack.artist}'s profile`}
                      style={{ cursor: 'pointer' }}
                    >
                      {currentTrack.artist}
                    </h2>
                    <h3 
                      className="np-song-album clickable-album-link"
                      onClick={() => openAlbumScreen({
                        id: `${currentTrack.album || currentTrack.title}:::${currentTrack.artist}`,
                        title: currentTrack.album || currentTrack.title,
                        artist: currentTrack.artist,
                        cover: currentTrack.cover,
                        tracks: allTracks.filter((t) => (t.album || t.title) === (currentTrack.album || currentTrack.title))
                      })}
                      title={`View "${currentTrack.album}" album`}
                      style={{ cursor: 'pointer' }}
                    >
                      {currentTrack.album}
                    </h3>

                    {/* Classic 5-star rating widget & track counter */}
                    <div className="np-star-rating-row" title="Rate this song">
                      <div className="np-stars">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span
                            key={star}
                            className={`np-star-glyph ${star <= (trackRatings[currentTrack.id] ?? 5) ? 'active' : ''}`}
                            onClick={() => handleSetRating(currentTrack.id, star === (trackRatings[currentTrack.id] ?? 5) ? star - 1 : star)}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                      <span className="np-star-track-counter">
                        {allTracks.findIndex((t) => t.id === currentTrack.id) >= 0 
                          ? `${allTracks.findIndex((t) => t.id === currentTrack.id) + 1} of ${allTracks.length}` 
                          : ''}
                      </span>
                    </div>

                    {settings.streamingQuality === 'lossless' && (
                      <div className="np-audio-badge-row">
                        <AppleMusicLosslessBadge onClick={() => setActiveTab('settings')} />
                        <span className="np-audio-spec">
                          ALAC 24-bit / 48 kHz Lossless
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Scrubber */}
                  <div className="scrub-box">
                    <div
                      className="scrub-track"
                      onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const clickPos = (e.clientX - rect.left) / rect.width;
                        if (duration) {
                          const targetTime = clickPos * duration;
                          setCurrentTime(targetTime);
                          if (currentTrack?.isOnline && ytPlayerRef.current?.seekTo) {
                            try { ytPlayerRef.current.seekTo(targetTime, true); } catch {}
                          } else if (audioRef.current) {
                            audioRef.current.currentTime = targetTime;
                          }
                        }
                      }}
                    >
                      <div
                        className="scrub-fill"
                        style={{
                          width: `${duration ? (currentTime / duration) * 100 : 0}%`
                        }}
                      />
                    </div>
                    <div className="scrub-times">
                      <span>{formatTime(currentTime)}</span>
                      <span>-{formatTime(duration - currentTime)}</span>
                    </div>
                  </div>

                  {/* Live Audio Engine Badges & View Queue CTA */}
                  <div className="np-audio-footer-row">
                    <div className="np-audio-specs-line">
                      {settings.eqEnabled && (
                        <span className="np-spec-text">EQ {settings.eqPreset}</span>
                      )}
                      {settings.crossfadeSeconds > 0 && (
                        <>
                          <span className="np-spec-dot">•</span>
                          <span className="np-spec-text">Crossfade {settings.crossfadeSeconds}s</span>
                        </>
                      )}
                      {settings.playbackSpeed !== 1.0 && (
                        <>
                          <span className="np-spec-dot">•</span>
                          <span className="np-spec-text">{settings.playbackSpeed}x Speed</span>
                        </>
                      )}
                    </div>
                    <button
                      onClick={() => setActiveTab('queue')}
                      className="btn-np-view-queue"
                      title="View Up Next Queue"
                    >
                      <ListMusic size={13} />
                      <span>View Queue {manualQueue.length > 0 ? `(${manualQueue.length})` : ''}</span>
                    </button>
                  </div>
                </div>
              </div>
            )
          )}

          {/* --- 6. PLAYBACK QUEUE & AUTOPLAY VIEW --- */}
          {activeTab === 'queue' && (
            <div className="playlist-container">
              <div className="playlist-header">
                <div>
                  <h2 className="playlist-title">Playback Queue</h2>
                  <p className="playlist-subtitle">
                    Manage upcoming tracks, manual playback order, and intelligent automix recommendations.
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button
                    onClick={() => setSettings((s) => ({ ...s, autoplay: !s.autoplay }))}
                    className={`queue-btn-action queue-autoplay-toggle ${settings.autoplay ? 'active' : ''}`}
                  >
                    <Sparkles size={12} />
                    <span>Autoplay: {settings.autoplay ? 'ON' : 'OFF'}</span>
                  </button>
                  {manualQueue.length > 0 && (
                    <button onClick={clearQueue} className="queue-btn-action">
                      <Trash2 size={12} />
                      <span>Clear Queue</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Now Playing Card */}
              {currentTrack ? (
                <div className="queue-card-current">
                  <div className="queue-current-left">
                    <img
                      src={currentTrack.cover || '/art/default_album.webp'}
                      alt={currentTrack.title}
                      className="queue-current-cover clickable-cover"
                      width={54}
                      height={54}
                      decoding="async"
                      referrerPolicy="no-referrer"
                      onClick={() => setActiveTab('now_playing')}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = '/art/default_album.webp';
                      }}
                    />
                    <div className="queue-current-meta">
                      <div className="queue-now-badge">
                        <span>Now Playing</span>
                        {isPlaying && (
                          <div className="queue-soundwave">
                            <div className="soundwave-bar" />
                            <div className="soundwave-bar" />
                            <div className="soundwave-bar" />
                            <div className="soundwave-bar" />
                          </div>
                        )}
                      </div>
                      <div
                        className="queue-current-title clickable-title"
                        onClick={() => setActiveTab('now_playing')}
                      >
                        {currentTrack.title}
                      </div>
                      <div className="queue-current-artist">{currentTrack.artist} • {currentTrack.album}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '12px', fontFamily: 'monospace', color: '#888' }}>
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                    <button onClick={togglePlayPause} className="transport-btn-round" style={{ width: '36px', height: '36px' }}>
                      {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" style={{ marginLeft: '2px' }} />}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="queue-card-current" style={{ opacity: 0.7 }}>
                  <div className="queue-current-left">
                    <div className="transport-thumb-empty">
                      <Music2 size={18} color="#666" />
                    </div>
                    <div className="queue-current-meta">
                      <div className="queue-current-title" style={{ color: '#888' }}>No track playing</div>
                      <div className="queue-current-artist">Select a song from Search or Library to start the queue</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Manual Queue Section */}
              <div className="queue-section-header">
                <span className="queue-section-title">
                  <ListMusic size={15} color="#38bdf8" />
                  Up Next ({manualQueue.length})
                </span>
                <span style={{ fontSize: '12px', color: '#666' }}>
                  {manualQueue.length > 0 ? 'Plays in listed order' : 'Queue is empty'}
                </span>
              </div>

              {manualQueue.length === 0 ? (
                <div className="queue-empty-box">
                  No upcoming tracks in your manual queue. Click the (+) button on any track in Search or Library to add it here.
                </div>
              ) : (
                <table className="track-table" style={{ marginBottom: '24px' }}>
                  <thead>
                    <tr>
                      <th style={{ width: '45px' }}>#</th>
                      <th style={{ width: '60px' }}>Cover</th>
                      <th>Title</th>
                      <th style={{ width: '22%' }}>Artist</th>
                      <th style={{ width: '70px' }}>Time</th>
                      <th style={{ width: '120px', textAlign: 'center' }}>Reorder / Remove</th>
                    </tr>
                  </thead>
                  <tbody>
                    {manualQueue.map((track, idx) => (
                      <tr key={`${track.id}-${idx}`} className="track-row">
                        <td className="cell-num">{idx + 1}</td>
                        <td
                          className="clickable-cover"
                          onClick={() => {
                            setManualQueue((prev) => prev.slice(idx + 1));
                            playTrack(track, { shouldSwitchTab: false, shouldSeedQueue: false });
                          }}
                          title={`Play "${track.title}"`}
                        >
                          <img
                            src={track.cover || '/art/default_album.webp'}
                            alt={track.title}
                            width={38}
                            height={38}
                            loading="lazy"
                            decoding="async"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = '/art/default_album.webp';
                            }}
                            style={{ width: '38px', height: '38px', borderRadius: '4px', objectFit: 'cover', display: 'block' }}
                          />
                        </td>
                        <td
                          className="clickable-title cell-title"
                          onClick={() => {
                            setManualQueue((prev) => prev.slice(idx + 1));
                            playTrack(track, { shouldSwitchTab: false, shouldSeedQueue: false });
                          }}
                          title={`Play "${track.title}"`}
                        >
                          {track.title}
                        </td>
                        <td className="cell-artist">{track.artist}</td>
                        <td className="cell-time">{formatTime(track.duration)}</td>
                        <td onClick={(e) => e.stopPropagation()} style={{ textAlign: 'center' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                moveQueueItem(idx, idx - 1);
                              }}
                              disabled={idx === 0}
                              className="btn-icon-heart"
                              title="Move Up"
                              style={{ opacity: idx === 0 ? 0.3 : 1 }}
                            >
                              <ArrowUp size={14} color="#888" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                moveQueueItem(idx, idx + 1);
                              }}
                              disabled={idx === manualQueue.length - 1}
                              className="btn-icon-heart"
                              title="Move Down"
                              style={{ opacity: idx === manualQueue.length - 1 ? 0.3 : 1 }}
                            >
                              <ArrowDown size={14} color="#888" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeFromQueue(idx);
                              }}
                              className="btn-icon-heart"
                              title="Remove from Queue"
                            >
                              <Trash2 size={14} color="#ef4444" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* Automix Recommendations Section */}
              <div className="queue-section-header">
                <span className="queue-section-title">
                  <Sparkles size={15} color="#38bdf8" />
                  Autoplay Recommendations (Automix)
                </span>
                <span style={{ fontSize: '12px', color: '#666' }}>
                  {settings.autoplay ? 'Plays automatically when queue finishes' : 'Autoplay paused'}
                </span>
              </div>

              {isLoadingAutomix ? (
                <div style={{ padding: '24px', textAlign: 'center', color: '#666', fontSize: '13px' }}>
                  Loading intelligent automix suggestions...
                </div>
              ) : automixTracks.length === 0 ? (
                <div className="queue-empty-box">
                  Play any online track to generate endless automix recommendations.
                </div>
              ) : (
                <table className="track-table">
                  <thead>
                    <tr>
                      <th style={{ width: '45px' }}>#</th>
                      <th style={{ width: '60px' }}>Cover</th>
                      <th>Title</th>
                      <th style={{ width: '25%' }}>Artist</th>
                      <th style={{ width: '70px' }}>Time</th>
                      <th style={{ width: '110px', textAlign: 'center' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {automixTracks.slice(0, 15).map((track, i) => (
                      <tr key={`auto-${track.id}-${i}`} className="track-row">
                        <td className="cell-num">{i + 1}</td>
                        <td
                          className="clickable-cover"
                          onClick={() => {
                            const remaining = automixTracks.slice(i + 1);
                            setAutomixTracks(remaining);
                            playTrack(track, { shouldSwitchTab: false, shouldSeedQueue: false });
                            if (remaining.length < 4 && track.id) {
                              fetchAutomix(track.id, true);
                            }
                          }}
                          title={`Play "${track.title}"`}
                        >
                          <img
                            src={track.cover || '/art/default_album.webp'}
                            alt={track.title}
                            width={38}
                            height={38}
                            loading="lazy"
                            decoding="async"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = '/art/default_album.webp';
                            }}
                            style={{ width: '38px', height: '38px', borderRadius: '4px', objectFit: 'cover', display: 'block' }}
                          />
                        </td>
                        <td
                          className="clickable-title cell-title"
                          onClick={() => {
                            const remaining = automixTracks.slice(i + 1);
                            setAutomixTracks(remaining);
                            playTrack(track, { shouldSwitchTab: false, shouldSeedQueue: false });
                            if (remaining.length < 4 && track.id) {
                              fetchAutomix(track.id, true);
                            }
                          }}
                          title={`Play "${track.title}"`}
                        >
                          {track.title}
                        </td>
                        <td className="cell-artist">{track.artist}</td>
                        <td className="cell-time">{formatTime(track.duration)}</td>
                        <td onClick={(e) => e.stopPropagation()} style={{ textAlign: 'center' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                addToQueue(track);
                              }}
                              className="btn-icon-heart"
                              title="Move to Up Next Queue"
                            >
                              <Plus size={16} color="#38bdf8" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleLikeTrack(track.id, track);
                              }}
                              className="btn-icon-heart"
                              title="Like for Cover Flow"
                            >
                              <Heart
                                size={16}
                                fill={allTracks.some((t) => t.id === track.id && t.isLiked) ? '#ef4444' : 'none'}
                                color={allTracks.some((t) => t.id === track.id && t.isLiked) ? '#ef4444' : '#888888'}
                              />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* Recently Played History Section */}
              {playedHistory.length > 0 && (
                <>
                  <div className="queue-section-header" style={{ marginTop: '28px' }}>
                    <span className="queue-section-title" style={{ color: '#888888' }}>
                      <History size={15} color="#888888" />
                      Recently Played ({playedHistory.length})
                    </span>
                    <span style={{ fontSize: '12px', color: '#666' }}>
                      Tracks played in this session (won't repeat in queue)
                    </span>
                  </div>
                  <table className="track-table" style={{ opacity: 0.82 }}>
                    <thead>
                      <tr>
                        <th style={{ width: '45px' }}>#</th>
                        <th style={{ width: '60px' }}>Cover</th>
                        <th>Title</th>
                        <th style={{ width: '25%' }}>Artist</th>
                        <th style={{ width: '70px' }}>Time</th>
                        <th style={{ width: '110px', textAlign: 'center' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...playedHistory].reverse().slice(0, 10).map((track, i) => (
                        <tr key={`history-${track.id}-${i}`} className="track-row">
                          <td className="cell-num">{i + 1}</td>
                          <td
                            className="clickable-cover"
                            onClick={() => playTrack(track, { shouldSwitchTab: false, shouldSeedQueue: false })}
                            title={`Replay "${track.title}"`}
                          >
                            <img
                              src={track.cover || '/art/default_album.webp'}
                              alt={track.title}
                              width={38}
                              height={38}
                              loading="lazy"
                              decoding="async"
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = '/art/default_album.webp';
                              }}
                              style={{ width: '38px', height: '38px', borderRadius: '4px', objectFit: 'cover', display: 'block' }}
                            />
                          </td>
                          <td
                            className="clickable-title cell-title"
                            onClick={() => playTrack(track, { shouldSwitchTab: false, shouldSeedQueue: false })}
                            title={`Replay "${track.title}"`}
                          >
                            {track.title}
                          </td>
                          <td className="cell-artist">{track.artist}</td>
                          <td className="cell-time">{formatTime(track.duration)}</td>
                          <td onClick={(e) => e.stopPropagation()} style={{ textAlign: 'center' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  addToQueue(track);
                                }}
                                className="btn-icon-heart"
                                title="Add back to Up Next Queue"
                              >
                                <Plus size={16} color="#38bdf8" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleLikeTrack(track.id, track);
                                }}
                                className="btn-icon-heart"
                                title="Like for Cover Flow"
                              >
                                <Heart
                                  size={16}
                                  fill={allTracks.some((t) => t.id === track.id && t.isLiked) ? '#ef4444' : 'none'}
                                  color={allTracks.some((t) => t.id === track.id && t.isLiked) ? '#ef4444' : '#888888'}
                                />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}
            </div>
          )}

          {/* --- 7. AUDIO ENGINE & SETTINGS VIEW --- */}
          {activeTab === 'settings' && (
            <div className="settings-wrapper">
              <div className="settings-inner">
                {/* Header */}
                <div className="settings-header">
                  <h1 className="settings-main-title">
                    <Settings size={22} color="#38bdf8" />
                    Audio Engine & Preferences
                  </h1>
                  <p className="settings-main-sub">
                    Configure online lossless streaming bitrates, visual themes, 10-band graphic equalizer, auto headroom preamp, crossfade blending, and smart fade transitions.
                  </p>
                </div>

                {/* Theme & Visual Appearance Card */}
                <div className="settings-card">
                  <div className="settings-card-head">
                    <div>
                      <h3 className="settings-card-title">
                        <Palette size={16} color="#38bdf8" />
                        Theme & Visual Appearance
                      </h3>
                      <p className="settings-card-desc">
                        Switch between the nostalgic Classic iPod silver finish and the modern AMOLED Pitch Black interface.
                      </p>
                    </div>
                  </div>

                  <div className="pill-grid">
                    {[
                      { 
                        id: 'classic', 
                        title: 'Classic iPod', 
                        badge: 'Iconic 2007' 
                      },
                      { 
                        id: 'amoled', 
                        title: 'AMOLED Pitch Black', 
                        badge: 'AMOLED Dark' 
                      }
                    ].map((th) => (
                      <div
                        key={th.id}
                        onClick={() => {
                          try { localStorage.setItem('mypod_theme_choice_v2', th.id); } catch {}
                          setSettings((s) => ({ ...s, theme: th.id }));
                        }}
                        className={`pill-card ${(settings.theme || 'classic') === th.id ? 'active' : ''}`}
                      >
                        <div className="pill-card-title">
                          <span>{th.title}</span>
                          <span className="pill-card-badge">{th.badge}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 1. Streaming Quality Card */}
                <div className="settings-card">
                  <div className="settings-card-head">
                    <div>
                      <h3 className="settings-card-title">
                        <Radio size={16} color="#38bdf8" />
                        Online Streaming Quality
                      </h3>
                      <p className="settings-card-desc">
                        Select audio fidelity format and streaming profile.
                      </p>
                    </div>
                  </div>

                  <div className="pill-grid">
                    {[
                      { id: 'lossless', title: 'Lossless', sub: 'FLAC', badge: 'Studio Master' },
                      { id: 'high', title: 'High', sub: 'Universal Clarity', badge: 'Recommended' },
                      { id: 'medium', title: 'Medium', sub: 'Balanced, Bandwidth', badge: 'Standard' },
                      { id: 'low', title: 'Low', sub: 'Data Saver', badge: 'Eco' }
                    ].map((opt) => (
                      <div
                        key={opt.id}
                        onClick={() => setSettings((s) => ({ ...s, streamingQuality: opt.id }))}
                        className={`pill-card ${settings.streamingQuality === opt.id ? 'active' : ''}`}
                      >
                        <div className="pill-card-title">
                          <span>{opt.title}</span>
                          <span className="pill-card-badge">{opt.badge}</span>
                        </div>
                        <div className="pill-card-sub">{opt.sub}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. Transitions Card */}
                <div className="settings-card">
                  <div className="settings-card-head">
                    <div>
                      <h3 className="settings-card-title">
                        <Sparkles size={16} color="#38bdf8" />
                        Transitions & Smart Mixing
                      </h3>
                      <p className="settings-card-desc">
                        Smooth fading between tracks and click-free playback transitions.
                      </p>
                    </div>
                  </div>

                  {/* Crossfade */}
                  <div className="slider-group">
                    <div className="slider-header">
                      <div>
                        <span className="switch-label-title">Crossfade Duration</span>
                        <div className="switch-label-note">Blend the ending of the current track into the next</div>
                      </div>
                      <span className="slider-val-badge">
                        {settings.crossfadeSeconds === 0 ? 'Off' : `${settings.crossfadeSeconds}s`}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="12"
                      step="1"
                      value={settings.crossfadeSeconds}
                      onChange={(e) => setSettings((s) => ({ ...s, crossfadeSeconds: parseInt(e.target.value, 10) }))}
                      className="range-slider-input"
                    />
                  </div>

                  {/* SmartFade / Automix */}
                  <div className="switch-row" style={{ marginTop: '18px' }}>
                    <div>
                      <div className="switch-label-title">Smart Fade (Fade In / Fade Out)</div>
                      <div className="switch-label-note">
                        Applies gentle 0.25s exponential gain ramps on play/pause, eliminating harsh audio cutoffs.
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSettings((s) => ({ ...s, smartFade: !s.smartFade }))}
                      className={`toggle-btn ${settings.smartFade ? 'on' : ''}`}
                    >
                      <div className="toggle-handle" />
                    </button>
                  </div>

                  {/* Autoplay Toggle */}
                  <div className="switch-row" style={{ marginTop: '14px' }}>
                    <div>
                      <div className="switch-label-title">Autoplay (Keep the Music Going)</div>
                      <div className="switch-label-note">
                        When your queue runs out, automatically play similar genre-matched songs endlessly.
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSettings((s) => ({ ...s, autoplay: !s.autoplay }))}
                      className={`toggle-btn ${settings.autoplay ? 'on' : ''}`}
                    >
                      <div className="toggle-handle" />
                    </button>
                  </div>
                </div>

                {/* 3. 10-Band Graphic Equalizer */}
                <div className="settings-card">
                  <div className="settings-card-head">
                    <div>
                      <h3 className="settings-card-title">
                        <Activity size={16} color="#38bdf8" />
                        10-Band Graphic Equalizer (Web Audio DSP)
                      </h3>
                      <p className="settings-card-desc">
                        Active BiquadFilterNodes (lowshelf, peaking, highshelf) with real-time frequency shaping.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSettings((s) => ({ ...s, eqEnabled: !s.eqEnabled }))}
                      className={`toggle-btn ${settings.eqEnabled ? 'on' : ''}`}
                    >
                      <div className="toggle-handle" />
                    </button>
                  </div>

                  {/* Auto Headroom Toggle */}
                  <div className="switch-row" style={{ padding: '8px 0 14px' }}>
                    <div>
                      <div className="switch-label-title">Auto Headroom Preamp</div>
                      <div className="switch-label-note">
                        Calculates maximum positive EQ boost and dynamically attenuates master preamp to prevent digital clipping distortion.
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSettings((s) => ({ ...s, eqAutoHeadroom: !s.eqAutoHeadroom }))}
                      className={`toggle-btn ${settings.eqAutoHeadroom ? 'on' : ''}`}
                    >
                      <div className="toggle-handle" />
                    </button>
                  </div>

                  {/* Presets Bar */}
                  <div className="eq-preset-bar">
                    {Object.keys(EQ_PRESETS).map((pName) => (
                      <button
                        key={pName}
                        onClick={() => {
                          setSettings((s) => ({
                            ...s,
                            eqPreset: pName,
                            eqGains: [...EQ_PRESETS[pName]]
                          }));
                        }}
                        className={`eq-preset-chip ${settings.eqPreset === pName ? 'active' : ''}`}
                      >
                        {pName}
                      </button>
                    ))}
                  </div>

                  {/* 10 Vertical Sliders Rack */}
                  <div className="eq-rack">
                    {EQ_FREQUENCIES.map((freq, idx) => {
                      const gain = settings.eqGains[idx] || 0;
                      return (
                        <div key={freq} className="eq-band-col">
                          <span className={`eq-band-gain ${gain === 0 ? 'zero' : ''}`}>
                            {gain > 0 ? `+${gain.toFixed(1)}` : gain.toFixed(1)}
                          </span>
                          <input
                            type="range"
                            min="-12"
                            max="12"
                            step="0.5"
                            value={gain}
                            disabled={!settings.eqEnabled}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value);
                              setSettings((s) => {
                                const newGains = [...s.eqGains];
                                newGains[idx] = val;
                                return {
                                  ...s,
                                  eqPreset: 'Custom',
                                  eqGains: newGains
                                };
                              });
                            }}
                            className="eq-band-slider"
                          />
                          <span className="eq-band-label">{EQ_LABELS[idx]}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 4. Loudness Normalization */}
                <div className="settings-card">
                  <div className="settings-card-head">
                    <div>
                      <h3 className="settings-card-title">
                        <Gauge size={16} color="#38bdf8" />
                        Loudness Normalization
                      </h3>
                      <p className="settings-card-desc">
                        Dynamics compressor node preventing volume spikes between tracks of differing masters.
                      </p>
                    </div>
                  </div>

                  <div className="pill-grid">
                    {[
                      { id: 'off', title: 'Off', sub: 'Raw uncompressed dynamics without leveling', badge: 'Direct' },
                      { id: 'normal', title: 'Normal (-24 dB)', sub: 'Broadcast standard reference loudness level', badge: 'Standard' },
                      { id: 'loud', title: 'Loud (-18 dB)', sub: 'Punchy club compression for high-energy playback', badge: 'Punchy' },
                      { id: 'quiet', title: 'Quiet (-32 dB)', sub: 'Subtle late-night listening compression', badge: 'Gentle' }
                    ].map((lvl) => (
                      <div
                        key={lvl.id}
                        onClick={() => setSettings((s) => ({ ...s, loudnessLevel: lvl.id }))}
                        className={`pill-card ${settings.loudnessLevel === lvl.id ? 'active' : ''}`}
                      >
                        <div className="pill-card-title">
                          <span>{lvl.title}</span>
                          <span className="pill-card-badge">{lvl.badge}</span>
                        </div>
                        <div className="pill-card-sub">{lvl.sub}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 5. Playback Speed */}
                <div className="settings-card">
                  <div className="settings-card-head">
                    <div>
                      <h3 className="settings-card-title">
                        <Gauge size={16} color="#38bdf8" />
                        Playback Speed
                      </h3>
                      <p className="settings-card-desc">
                        Fine-tune tempo while maintaining pitch accuracy.
                      </p>
                    </div>
                  </div>

                  <div className="eq-preset-bar" style={{ marginTop: '10px' }}>
                    {[0.75, 1.0, 1.25, 1.5, 2.0].map((spd) => (
                      <button
                        key={spd}
                        onClick={() => setSettings((s) => ({ ...s, playbackSpeed: spd }))}
                        className={`eq-preset-chip ${settings.playbackSpeed === spd ? 'active' : ''}`}
                        style={{ padding: '8px 18px', fontSize: '13px' }}
                      >
                        {spd === 1.0 ? '1.0x (Normal)' : `${spd}x`}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* --- 8. ADD LOCAL FILES --- */}
          {activeTab === 'upload' && (
            <div className="upload-stage">
              <Upload size={48} color="#0284c7" style={{ marginBottom: '14px' }} />
              <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#ffffff', margin: '0 0 6px' }}>
                Add Local Audio Files
              </h2>
              <p style={{ fontSize: '13px', color: '#888888', maxWidth: '420px', textAlign: 'center', lineHeight: 1.5, margin: '0 0 20px' }}>
                Import MP3, FLAC, AAC, WAV, M4A, or OPUS files from your computer. Added songs will be instantly playable and can be added to Cover Flow.
              </p>
              <label className="btn-upload-label">
                Select Audio Files
                <input
                  type="file"
                  multiple
                  accept="audio/*"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
              </label>
            </div>
          )}
        </div>

        {/* Persistent Bottom Transport Bar */}
        <div className="transport-bar">
          {/* Left: Current Track Thumbnail & Info */}
          {currentTrack ? (
            <div className="transport-left">
              <img
                src={currentTrack.cover || '/art/default_album.webp'}
                alt={currentTrack.title}
                className="transport-thumb clickable-cover"
                width={44}
                height={44}
                decoding="async"
                referrerPolicy="no-referrer"
                onClick={() => setActiveTab('now_playing')}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = '/art/default_album.webp';
                }}
              />
              <div className="transport-info">
                <div className="transport-title clickable-title" onClick={() => setActiveTab('now_playing')}>
                  {currentTrack.title}
                </div>
                <div 
                  className="transport-artist clickable-artist-link"
                  onClick={() => openArtistProfile(currentTrack.artist, currentTrack.cover)}
                  title={`View ${currentTrack.artist}'s profile`}
                  style={{ cursor: 'pointer' }}
                >
                  {currentTrack.artist}
                </div>
              </div>
            </div>
          ) : (
            <div className="transport-left">
              <div className="transport-thumb-empty">
                <Music2 size={18} color="#444444" />
              </div>
              <div className="transport-info">
                <div className="transport-title-empty">No track playing</div>
                <div className="transport-artist-empty">Select a song to start streaming</div>
              </div>
            </div>
          )}

          {/* Center: Playback Controls */}
          <div className="transport-center">
            <button onClick={handlePrev} className="transport-btn-plain" title="Previous Track">
              <SkipBack size={22} fill="currentColor" />
            </button>
            <button onClick={togglePlayPause} className="transport-btn-round" title={isPlaying ? 'Pause' : 'Play'}>
              {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" style={{ marginLeft: '2px' }} />}
            </button>
            <button onClick={handleNext} className="transport-btn-plain" title="Next Track">
              <SkipForward size={22} fill="currentColor" />
            </button>
          </div>

          {/* Right: Time, Apple Music Lossless Badge & Volume */}
          <div className="transport-right">
            {settings.streamingQuality === 'lossless' && (
              <AppleMusicLosslessBadge onClick={() => setActiveTab('settings')} />
            )}
            <span style={{ fontSize: '11.5px', fontFamily: 'monospace', fontWeight: 700, color: '#888888' }}>
              {currentTrack ? `${formatTime(currentTime)} / ${formatTime(duration)}` : '--:-- / --:--'}
            </span>
            <Volume2 size={16} color="#888888" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setVolume(val);
                if (audioRef.current) audioRef.current.volume = val;
                if (ytPlayerRef.current?.setVolume) {
                  try { ytPlayerRef.current.setVolume(val * 100); } catch {}
                }
              }}
              className="transport-vol-slider"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
