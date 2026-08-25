"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Member } from "@/lib/database.types";
import { MemberSongs } from "@/components/MemberSongs";

interface JukeboxContentProps {
  initialMembers: Member[];
}

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("");
}

export function JukeboxContent({ initialMembers }: JukeboxContentProps) {
  const [query, setQuery] = useState("");

  const members = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return initialMembers;
    return initialMembers.filter((m) =>
      [
        m.name,
        m.song_title,
        m.song_artist,
        m.song_credit,
        m.song2_title,
        m.song2_artist,
        m.song2_credit,
        m.title,
      ]
        .filter(Boolean)
        .some((field) => (field as string).toLowerCase().includes(q))
    );
  }, [initialMembers, query]);

  return (
    <div className="max-w-4xl mx-auto px-5 py-12">
      <header className="mb-8 text-center">
        <h1 className="font-display text-3xl font-bold text-rvno-ink">
          The Jukebox
        </h1>
        <p className="font-body text-base text-rvno-ink-muted italic mt-2">
          Everybody picks a song. These are theirs.
        </p>
      </header>

      {initialMembers.length === 0 ? (
        <div className="text-center">
          <p className="font-body text-base text-rvno-ink-dim">
            No songs yet. Add one from a member&apos;s card over on{" "}
            <Link href="/members" className="text-rvno-teal">
              The Crew
            </Link>
            .
          </p>
        </div>
      ) : (
        <>
          <div className="mb-8 flex justify-center">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search a name, song, or band..."
              className="w-full max-w-md bg-rvno-elevated border border-rvno-border rounded-lg px-4 py-3 font-body text-base text-rvno-ink placeholder:text-rvno-ink-dim focus:outline-none focus:border-[#C4853A]/50"
              aria-label="Search the jukebox"
            />
          </div>

          {members.length === 0 ? (
            <p className="font-body text-base text-rvno-ink-dim text-center">
              Nothing matches &ldquo;{query}&rdquo;.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="bg-rvno-card rounded-lg border-2 border-rvno-border p-5 flex flex-col gap-4"
                >
                  <div className="flex gap-4 items-start">
                    <div className="w-14 h-14 rounded-full bg-rvno-surface flex-shrink-0 flex items-center justify-center overflow-hidden">
                      {member.photo_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={member.photo_url}
                          alt={member.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="font-display text-base text-rvno-ink-dim">
                          {initials(member.name)}
                        </span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h2 className="font-display text-lg font-semibold text-rvno-ink">
                        {member.name}
                      </h2>
                      {member.title && (
                        <p className="font-mono text-xs text-rvno-teal tracking-wide uppercase mt-0.5 font-medium">
                          {member.title}
                        </p>
                      )}
                    </div>
                  </div>

                  <MemberSongs member={member} />
                </div>
              ))}
            </div>
          )}

          <p className="font-body text-sm text-rvno-ink-dim text-center mt-10">
            Players show a 30-second preview unless you&apos;re signed in to
            Spotify, in which case you get the whole song.
          </p>
        </>
      )}
    </div>
  );
}
