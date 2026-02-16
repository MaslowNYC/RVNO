"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { Album } from "@/lib/database.types";

export default function AdminPage() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [showNewAlbum, setShowNewAlbum] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");

  // Check auth
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Load albums
  useEffect(() => {
    if (session) loadAlbums();
  }, [session]);

  async function loadAlbums() {
    const { data } = await supabase
      .from("albums")
      .select("*")
      .order("event_date", { ascending: false });
    if (data) setAlbums(data);
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setAuthError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setAuthError(error.message);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setSession(null);
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-5 py-20 text-center">
        <p className="font-mono text-sm text-rvno-ink-dim">Loading...</p>
      </div>
    );
  }

  // Login screen
  if (!session) {
    return (
      <div className="max-w-sm mx-auto px-5 py-20">
        <h1 className="font-display text-2xl font-bold text-rvno-ink mb-2 text-center">
          RVNO Admin
        </h1>
        <p className="font-body text-sm text-rvno-ink-muted text-center mb-8">
          For Mark&apos;s eyes only.
        </p>
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-rvno-card border border-white/[0.06] rounded px-3 py-2.5 font-mono text-sm text-rvno-ink placeholder:text-rvno-ink-dim focus:outline-none focus:border-rvno-teal/40"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-rvno-card border border-white/[0.06] rounded px-3 py-2.5 font-mono text-sm text-rvno-ink placeholder:text-rvno-ink-dim focus:outline-none focus:border-rvno-teal/40"
          />
          {authError && (
            <p className="font-mono text-xs text-rvno-dot">{authError}</p>
          )}
          <button
            type="submit"
            className="w-full bg-rvno-teal-dark text-rvno-white font-mono text-sm py-2.5 rounded hover:bg-rvno-teal transition-colors"
          >
            Sign In
          </button>
        </form>
      </div>
    );
  }

  // Admin dashboard
  return (
    <div className="max-w-3xl mx-auto px-5 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-2xl font-bold text-rvno-ink">
          RVNO Admin
        </h1>
        <button
          onClick={handleLogout}
          className="font-mono text-[10px] text-rvno-ink-dim hover:text-rvno-teal tracking-wide"
        >
          Sign Out
        </button>
      </div>

      {/* New album button */}
      <button
        onClick={() => setShowNewAlbum(!showNewAlbum)}
        className="mb-6 bg-rvno-teal-dark text-rvno-white font-mono text-sm px-4 py-2 rounded hover:bg-rvno-teal transition-colors"
      >
        + New Album
      </button>

      {/* New album form */}
      {showNewAlbum && (
        <NewAlbumForm
          onCreated={() => {
            setShowNewAlbum(false);
            loadAlbums();
          }}
        />
      )}

      {/* Album list */}
      <div className="space-y-3">
        {albums.map((album) => (
          <AlbumRow
            key={album.id}
            album={album}
            onUpdate={loadAlbums}
          />
        ))}
      </div>

      {albums.length === 0 && (
        <p className="text-center font-mono text-sm text-rvno-ink-dim py-10">
          No albums yet. Create your first one above.
        </p>
      )}
    </div>
  );
}

function NewAlbumForm({ onCreated }: { onCreated: () => void }) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title || !date) return;
    setSaving(true);

    const { error } = await supabase.from("albums").insert({
      title,
      event_date: date,
      location_name: location,
      description: description || null,
      cover_photo_url: null,
      location_lat: null,
      location_lng: null,
    });

    setSaving(false);
    if (!error) onCreated();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-rvno-card rounded-lg border border-white/[0.06] p-5 mb-6 space-y-3"
    >
      <input
        type="text"
        placeholder="Album title (e.g., Blue Ridge Fall Ride)"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full bg-rvno-elevated border border-white/[0.06] rounded px-3 py-2 font-mono text-sm text-rvno-ink placeholder:text-rvno-ink-dim focus:outline-none focus:border-rvno-teal/40"
        required
      />
      <div className="grid grid-cols-2 gap-3">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="bg-rvno-elevated border border-white/[0.06] rounded px-3 py-2 font-mono text-sm text-rvno-ink focus:outline-none focus:border-rvno-teal/40"
          required
        />
        <input
          type="text"
          placeholder="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="bg-rvno-elevated border border-white/[0.06] rounded px-3 py-2 font-mono text-sm text-rvno-ink placeholder:text-rvno-ink-dim focus:outline-none focus:border-rvno-teal/40"
        />
      </div>
      <textarea
        placeholder="Quick description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={2}
        className="w-full bg-rvno-elevated border border-white/[0.06] rounded px-3 py-2 font-mono text-sm text-rvno-ink placeholder:text-rvno-ink-dim focus:outline-none focus:border-rvno-teal/40 resize-none"
      />
      <button
        type="submit"
        disabled={saving}
        className="bg-rvno-teal-dark text-rvno-white font-mono text-sm px-4 py-2 rounded hover:bg-rvno-teal transition-colors disabled:opacity-50"
      >
        {saving ? "Creating..." : "Create Album"}
      </button>
    </form>
  );
}

function AlbumRow({ album, onUpdate }: { album: Album; onUpdate: () => void }) {
  const [uploading, setUploading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [photos, setPhotos] = useState<any[]>([]);

  async function loadPhotos() {
    const { data } = await supabase
      .from("photos")
      .select("*")
      .eq("album_id", album.id)
      .order("sort_order", { ascending: true });
    if (data) setPhotos(data);
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const ext = file.name.split(".").pop();
      const fileName = `${album.id}/${Date.now()}-${i}.${ext}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from("album-photos")
        .upload(fileName, file);

      if (uploadError) {
        console.error("Upload error:", uploadError);
        continue;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("album-photos")
        .getPublicUrl(fileName);

      // Insert photo record
      await supabase.from("photos").insert({
        album_id: album.id,
        url: urlData.publicUrl,
        caption: null,
        sort_order: photos.length + i,
      });

      // Set first photo as cover if none exists
      if (!album.cover_photo_url && i === 0) {
        await supabase
          .from("albums")
          .update({ cover_photo_url: urlData.publicUrl })
          .eq("id", album.id);
      }
    }

    setUploading(false);
    loadPhotos();
    onUpdate();
    // Reset the input
    e.target.value = "";
  }

  async function deleteAlbum() {
    if (!confirm(`Delete "${album.title}" and all its photos?`)) return;

    // Delete photos from storage
    const { data: albumPhotos } = await supabase
      .from("photos")
      .select("url")
      .eq("album_id", album.id);

    if (albumPhotos) {
      const paths = albumPhotos.map((p) => {
        const url = new URL(p.url);
        return url.pathname.split("/album-photos/")[1];
      }).filter(Boolean);

      if (paths.length > 0) {
        await supabase.storage.from("album-photos").remove(paths);
      }
    }

    // Delete album (cascade deletes photo records)
    await supabase.from("albums").delete().eq("id", album.id);
    onUpdate();
  }

  return (
    <div className="bg-rvno-card rounded-lg border border-white/[0.06] p-4">
      <div className="flex items-center justify-between">
        <div
          className="flex-1 cursor-pointer"
          onClick={() => {
            setExpanded(!expanded);
            if (!expanded) loadPhotos();
          }}
        >
          <h3 className="font-display text-sm font-semibold text-rvno-ink">
            {album.title}
          </h3>
          <p className="font-mono text-[10px] text-rvno-teal tracking-wide mt-0.5">
            {new Date(album.event_date + "T00:00:00").toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
            {album.location_name ? ` · ${album.location_name}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={`/album/${album.id}`}
            className="font-mono text-[9px] text-rvno-ink-dim hover:text-rvno-teal tracking-wide"
          >
            View
          </a>
          <button
            onClick={deleteAlbum}
            className="font-mono text-[9px] text-rvno-ink-dim hover:text-rvno-dot tracking-wide"
          >
            Delete
          </button>
        </div>
      </div>

      {expanded && (
        <div className="mt-4 pt-3 border-t border-white/[0.06]">
          {/* Upload */}
          <label className="inline-block bg-rvno-elevated border border-white/[0.06] rounded px-3 py-1.5 font-mono text-xs text-rvno-ink-muted hover:text-rvno-teal hover:border-rvno-teal/20 transition-colors cursor-pointer mb-3">
            {uploading ? "Uploading..." : "+ Add Photos"}
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoUpload}
              className="hidden"
              disabled={uploading}
            />
          </label>

          {/* Photo thumbnails */}
          {photos.length > 0 && (
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5">
              {photos.map((photo) => (
                <div
                  key={photo.id}
                  className="aspect-square bg-rvno-surface rounded overflow-hidden relative group"
                >
                  <img
                    src={photo.url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={async () => {
                      await supabase.from("photos").delete().eq("id", photo.id);
                      loadPhotos();
                    }}
                    className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full text-white/60 hover:text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          {photos.length === 0 && !uploading && (
            <p className="font-mono text-[10px] text-rvno-ink-dim">
              No photos yet. Click &quot;+ Add Photos&quot; to upload some.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
