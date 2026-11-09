import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDbPool } from "@/lib/db";

export async function GET(req) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const pool = getDbPool();
    if (!pool) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }

    const result = await pool.query(
      `SELECT track_id, title, artist, album, cover, duration, is_liked, in_playlist, src, is_online, created_at 
       FROM user_library 
       WHERE user_id = $1 
       ORDER BY created_at DESC`,
      [session.user.id]
    );

    const tracks = result.rows.map(row => ({
      id: row.track_id,
      title: row.title,
      artist: row.artist || 'Unknown Artist',
      album: row.album || 'Unknown Album',
      cover: row.cover || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300&h=300&fit=crop&q=80',
      duration: row.duration || 0,
      isLiked: Boolean(row.is_liked),
      inPlaylist: Boolean(row.in_playlist),
      src: row.src || '',
      isOnline: Boolean(row.is_online)
    }));

    return NextResponse.json({ tracks });
  } catch (error) {
    console.error("GET /api/library error:", error);
    return NextResponse.json({ error: "Failed to fetch library" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const pool = getDbPool();
    if (!pool) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }

    const body = await req.json();
    const { track, isLiked, inPlaylist } = body;

    if (!track || !track.id) {
      return NextResponse.json({ error: "Missing track data" }, { status: 400 });
    }

    const trackId = String(track.id);
    const title = track.title || 'Unknown Title';
    const artist = track.artist || 'Unknown Artist';
    const album = track.album || 'Unknown Album';
    const cover = track.cover || '';
    const duration = track.duration || 0;
    const src = track.src || '';
    const isOnline = track.isOnline !== false;

    const isLikedVal = isLiked !== undefined ? Boolean(isLiked) : null;
    const inPlaylistVal = inPlaylist !== undefined ? Boolean(inPlaylist) : null;

    // UPSERT track into user_library preserving existing flags when partial update
    await pool.query(
      `INSERT INTO user_library (user_id, track_id, title, artist, album, cover, duration, is_liked, in_playlist, src, is_online)
       VALUES ($1, $2, $3, $4, $5, $6, $7, COALESCE($8, true), COALESCE($9, false), $10, $11)
       ON CONFLICT (user_id, track_id) DO UPDATE SET
         is_liked = CASE WHEN $8::boolean IS NOT NULL THEN $8::boolean ELSE user_library.is_liked END,
         in_playlist = CASE WHEN $9::boolean IS NOT NULL THEN $9::boolean ELSE user_library.in_playlist END,
         title = EXCLUDED.title,
         artist = EXCLUDED.artist,
         album = EXCLUDED.album,
         cover = EXCLUDED.cover,
         src = EXCLUDED.src,
         duration = EXCLUDED.duration`,
      [
        session.user.id,
        trackId,
        title,
        artist,
        album,
        cover,
        duration,
        isLikedVal,
        inPlaylistVal,
        src,
        isOnline
      ]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST /api/library error:", error);
    return NextResponse.json({ error: "Failed to update library" }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const pool = getDbPool();
    if (!pool) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }

    const { searchParams } = new URL(req.url);
    const trackId = searchParams.get("trackId");

    if (!trackId) {
      return NextResponse.json({ error: "trackId required" }, { status: 400 });
    }

    await pool.query(
      `DELETE FROM user_library WHERE user_id = $1 AND track_id = $2`,
      [session.user.id, trackId]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/library error:", error);
    return NextResponse.json({ error: "Failed to remove track from library" }, { status: 500 });
  }
}
