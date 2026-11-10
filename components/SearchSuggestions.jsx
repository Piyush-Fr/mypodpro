'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Search, Music2, Disc, User, Clock } from 'lucide-react';
import Spinner from '@/components/Spinner';

const RECENT_KEY = 'mypod_recent_searches_v1';

// Shown when the box is focused and empty: how to search, by kind
const HELP_ROWS = [
  { kind: 'song', label: 'Songs', hint: 'by title', example: 'Blinding Lights' },
  { kind: 'artist', label: 'Artists', hint: 'by name', example: 'The Weeknd' },
  { kind: 'album', label: 'Albums', hint: 'by album name', example: 'After Hours' }
];

const KIND_ICON = { song: Music2, artist: User, album: Disc };
const KIND_LABEL = { song: 'Song', artist: 'Artist', album: 'Album' };

export function rememberSearch(text) {
  const q = (text || '').trim();
  if (!q) return;
  try {
    const prev = JSON.parse(localStorage.getItem(RECENT_KEY) || '[]');
    const next = [q, ...prev.filter((p) => p.toLowerCase() !== q.toLowerCase())].slice(0, 5);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {}
}

function readRecent() {
  try {
    const list = JSON.parse(localStorage.getItem(RECENT_KEY) || '[]');
    return Array.isArray(list) ? list.slice(0, 5) : [];
  } catch {
    return [];
  }
}

/**
 * Dropdown under the search box. Every selectable row becomes one option so the
 * keyboard can walk the whole list; the parent forwards key presses via `keyRef`.
 */
export default function SearchSuggestions({ query, open, keyRef, onQuery, onPlay, onArtist, onAlbum, onClose }) {
  const [data, setData] = useState({ queries: [], items: [] });
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(-1);
  const [recent, setRecent] = useState([]);
  const q = query.trim();

  useEffect(() => {
    if (open) setRecent(readRecent());
  }, [open]);

  // Debounced fetch; the previous request is aborted when the text changes
  useEffect(() => {
    setActive(-1);
    if (!open || !q) {
      setData({ queries: [], items: [] });
      setLoading(false);
      return;
    }
    const ctrl = new AbortController();
    setLoading(true);
    const timer = setTimeout(() => {
      fetch(`/api/search/suggest?q=${encodeURIComponent(q)}`, { signal: ctrl.signal })
        .then((r) => (r.ok ? r.json() : { queries: [], items: [] }))
        .then((d) => setData({ queries: d.queries || [], items: d.items || [] }))
        .catch(() => {})
        .finally(() => { if (!ctrl.signal.aborted) setLoading(false); });
    }, 200);
    return () => { clearTimeout(timer); ctrl.abort(); };
  }, [q, open]);

  // Flat list of options in display order
  const options = useMemo(() => {
    if (!q) {
      return [
        ...recent.map((text) => ({ type: 'query', text, recent: true })),
        ...HELP_ROWS.map((row) => ({ type: 'query', text: row.example, help: row }))
      ];
    }
    return [
      ...data.items.map((item) => ({ type: 'item', item })),
      ...data.queries.map((text) => ({ type: 'query', text }))
    ];
  }, [q, recent, data]);

  const choose = (opt) => {
    if (!opt) return;
    if (opt.type === 'query') onQuery(opt.text);
    else if (opt.item.kind === 'song') onPlay(opt.item.track);
    else if (opt.item.kind === 'artist') onArtist(opt.item);
    else onAlbum(opt.item);
    onClose();
  };

  // Keyboard handling, called by the input's onKeyDown. Returns true when handled.
  keyRef.current = (e) => {
    if (!open) return false;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => (i + 1) % Math.max(options.length, 1));
      return true;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => (i <= 0 ? options.length - 1 : i - 1));
      return true;
    }
    if (e.key === 'Escape') {
      onClose();
      return true;
    }
    if (e.key === 'Enter' && active >= 0 && options[active]) {
      e.preventDefault();
      choose(options[active]);
      return true;
    }
    return false;
  };

  const listRef = useRef(null);
  useEffect(() => {
    listRef.current?.querySelector('[data-active="true"]')?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  if (!open) return null;

  // Keep focus in the input when a row is pressed
  const keepFocus = (e) => e.preventDefault();
  let index = -1;
  const rowProps = (opt) => {
    index += 1;
    const i = index;
    return {
      role: 'option',
      id: `suggest-opt-${i}`,
      'aria-selected': active === i,
      'data-active': active === i,
      className: `suggest-row ${active === i ? 'active' : ''}`,
      onMouseDown: keepFocus,
      onMouseEnter: () => setActive(i),
      onClick: () => choose(opt)
    };
  };

  const items = options.filter((o) => o.type === 'item');
  const queries = options.filter((o) => o.type === 'query' && !o.help && !o.recent);
  const recentOpts = options.filter((o) => o.recent);
  const helpOpts = options.filter((o) => o.help);

  return (
    <div className="search-suggest" role="listbox" id="search-suggest-list" ref={listRef} onMouseDown={keepFocus}>
      {!q && (
        <>
          {recentOpts.length > 0 && (
            <div className="suggest-group">
              <div className="suggest-heading">Recent searches</div>
              {recentOpts.map((opt) => (
                <div key={`r-${opt.text}`} {...rowProps(opt)}>
                  <Clock size={14} className="suggest-icon" />
                  <span className="suggest-text">{opt.text}</span>
                </div>
              ))}
            </div>
          )}
          <div className="suggest-group">
            <div className="suggest-heading">Search for</div>
            {helpOpts.map((opt) => {
              const Icon = KIND_ICON[opt.help.kind];
              return (
                <div key={`h-${opt.help.kind}`} {...rowProps(opt)}>
                  <Icon size={14} className="suggest-icon" />
                  <span className="suggest-text">
                    {opt.help.label} <span className="suggest-sub">{opt.help.hint}, e.g. “{opt.help.example}”</span>
                  </span>
                </div>
              );
            })}
          </div>
        </>
      )}

      {q && (
        <>
          {items.length > 0 && (
            <div className="suggest-group">
              <div className="suggest-heading">Top matches</div>
              {items.map((opt) => {
                const { item } = opt;
                const isArtist = item.kind === 'artist';
                const title = isArtist ? item.name : item.kind === 'album' ? item.title : item.track.title;
                const sub = isArtist
                  ? 'Artist'
                  : item.kind === 'album'
                    ? ['Album', item.artist, item.year].filter(Boolean).join(' · ')
                    : `Song · ${item.track.artist}`;
                const cover = isArtist || item.kind === 'album' ? item.cover : item.track.cover;
                return (
                  <div key={`i-${item.kind}-${isArtist || item.kind === 'album' ? item.id : item.track.id}`} {...rowProps(opt)}>
                    <img
                      src={cover || '/art/default_album.webp'}
                      alt=""
                      className={`suggest-thumb ${isArtist ? 'round' : ''}`}
                      referrerPolicy="no-referrer"
                      loading="lazy"
                      onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/art/default_album.webp'; }}
                    />
                    <span className="suggest-text">
                      {title}
                      <span className="suggest-sub">{sub}</span>
                    </span>
                    <span className="suggest-kind">{KIND_LABEL[item.kind]}</span>
                  </div>
                );
              })}
            </div>
          )}

          {queries.length > 0 && (
            <div className="suggest-group">
              <div className="suggest-heading">Suggestions</div>
              {queries.map((opt) => (
                <div key={`q-${opt.text}`} {...rowProps(opt)}>
                  <Search size={14} className="suggest-icon" />
                  <span className="suggest-text">{opt.text}</span>
                </div>
              ))}
            </div>
          )}

          {loading && items.length === 0 && queries.length === 0 && (
            <div className="loading-row"><Spinner size={18} label="Loading suggestions" /> Finding songs, artists and albums…</div>
          )}
          {!loading && items.length === 0 && queries.length === 0 && (
            <div className="suggest-empty">No suggestions. Press Enter to search for “{q}”.</div>
          )}
        </>
      )}
    </div>
  );
}
