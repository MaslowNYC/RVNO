/**
 * Helpers for turning whatever a person pastes into a Spotify track ID.
 *
 * Accepts:
 *   - a bare ID:        11OFYsUK9EVJsQ6nutH32M
 *   - a share link:     https://open.spotify.com/track/11OFYsUK9EVJsQ6nutH32M?si=abc123
 *   - a localised link: https://open.spotify.com/intl-de/track/11OFYsUK9EVJsQ6nutH32M
 *   - a URI:            spotify:track:11OFYsUK9EVJsQ6nutH32M
 */

const TRACK_ID = /[A-Za-z0-9]{22}/;

export function parseSpotifyTrackId(input: string | null | undefined): string | null {
  if (!input) return null;
  const value = input.trim();
  if (!value) return null;

  // spotify:track:ID
  const uri = value.match(/^spotify:track:([A-Za-z0-9]{22})$/);
  if (uri) return uri[1];

  // any open.spotify.com/.../track/ID URL
  const url = value.match(/open\.spotify\.com\/(?:[a-z-]+\/)?track\/([A-Za-z0-9]{22})/);
  if (url) return url[1];

  // a bare ID on its own
  if (/^[A-Za-z0-9]{22}$/.test(value)) return value;

  // last resort: something that looks like an ID hiding in the string
  const loose = value.match(TRACK_ID);
  return loose ? loose[0] : null;
}

export function spotifyEmbedUrl(trackId: string, compact = true): string {
  const theme = compact ? "&theme=0" : "&theme=0";
  return `https://open.spotify.com/embed/track/${trackId}?utm_source=generator${theme}`;
}

export function spotifyTrackUrl(trackId: string): string {
  return `https://open.spotify.com/track/${trackId}`;
}
