"use client";

import type { Member } from "@/lib/database.types";
import { SpotifyPlayer } from "@/components/SpotifyPlayer";

/**
 * Renders a member's favorite song(s).
 *
 * Most members have one song. Joint cards (couples) have two, and each one
 * carries a `credit` — the first name of whoever picked it — so you can tell
 * Barney's song from Maggie's. When there's no credit we just show the song.
 */

type Pick = {
  title: string;
  artist: string | null;
  spotifyId: string | null;
  credit: string | null;
  note: string | null;
};

export function songsFor(member: Member): Pick[] {
  const picks: Pick[] = [];
  if (member.song_title) {
    picks.push({
      title: member.song_title,
      artist: member.song_artist,
      spotifyId: member.song_spotify_id,
      credit: member.song_credit,
      note: member.song_note,
    });
  }
  if (member.song2_title) {
    picks.push({
      title: member.song2_title,
      artist: member.song2_artist,
      spotifyId: member.song2_spotify_id,
      credit: member.song2_credit,
      note: null,
    });
  }
  return picks;
}

interface MemberSongsProps {
  member: Member;
  /** Hidden while an admin is dragging cards around. */
  showPlayers?: boolean;
  className?: string;
}

export function MemberSongs({
  member,
  showPlayers = true,
  className = "",
}: MemberSongsProps) {
  const picks = songsFor(member);
  if (picks.length === 0) return null;

  return (
    <div className={className}>
      {picks.map((pick, i) => (
        <div key={i} className={i > 0 ? "mt-4" : ""}>
          <p className="font-body text-sm text-rvno-ink-muted">
            🎵{" "}
            {pick.credit && (
              <span className="text-rvno-teal font-medium">
                {pick.credit}:{" "}
              </span>
            )}
            <span className="italic">{pick.title}</span>
            {pick.artist ? ` — ${pick.artist}` : ""}
          </p>
          {pick.note && (
            <p className="font-body text-xs text-rvno-ink-dim italic mt-0.5">
              {pick.note}
            </p>
          )}
          {pick.spotifyId && showPlayers && (
            <SpotifyPlayer
              trackId={pick.spotifyId}
              variant="compact"
              className="mt-2"
              title={`${pick.title}${pick.artist ? ` — ${pick.artist}` : ""}`}
            />
          )}
        </div>
      ))}
    </div>
  );
}
