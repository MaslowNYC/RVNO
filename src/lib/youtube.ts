/**
 * YouTube links.
 *
 * We don't embed YouTube — the players are large, they carry ads we can't turn
 * off, and a lot of label uploads refuse to embed at all. Instead each song
 * gets a plain link out, so the Spotify preview plays on the page and the whole
 * song is one click away.
 */

/** Accepts youtu.be/ID, /watch?v=ID, /embed/ID, /shorts/ID, or a bare 11-char ID. */
export function parseYouTubeId(input: string | null | undefined): string | null {
  if (!input) return null;
  const value = input.trim();
  if (!value) return null;

  const patterns = [
    /youtu\.be\/([A-Za-z0-9_-]{11})/,
    /youtube(?:-nocookie)?\.com\/watch\?[^#]*\bv=([A-Za-z0-9_-]{11})/,
    /youtube(?:-nocookie)?\.com\/embed\/([A-Za-z0-9_-]{11})/,
    /youtube(?:-nocookie)?\.com\/shorts\/([A-Za-z0-9_-]{11})/,
    /youtube(?:-nocookie)?\.com\/v\/([A-Za-z0-9_-]{11})/,
  ];
  for (const re of patterns) {
    const m = value.match(re);
    if (m) return m[1];
  }

  if (/^[A-Za-z0-9_-]{11}$/.test(value)) return value;
  return null;
}

export function youtubeWatchUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`;
}
