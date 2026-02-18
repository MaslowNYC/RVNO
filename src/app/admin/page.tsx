"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { Album, Photo } from "@/lib/database.types";
import Link from "next/link";

export default function AdminPage() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [showNewAlbum, setShowNewAlbum] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) {
      loadAlbums();
    }
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
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
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
            className="w-full bg-rvno-card border-2 border-rvno-border rounded-lg px-4 py-3 font-body text-base text-rvno-ink placeholder:text-rvno-ink-dim focus:outline-none focus:border-rvno-teal/40"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-rvno-card border-2 border-rvno-border rounded-lg px-4 py-3 font-body text-base text-rvno-ink placeholder:text-rvno-ink-dim focus:outline-none focus:border-rvno-teal/40"
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

  return (
    <div className="max-w-3xl mx-auto px-5 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold text-rvno-ink">
          RVNO Admin
        </h1>
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="font-body text-sm text-rvno-teal hover:text-rvno-teal-dark tracking-wide"
          >
            Go to site →
          </Link>
          <button
            onClick={handleLogout}
            className="font-body text-sm text-rvno-ink-dim hover:text-rvno-ink tracking-wide"
          >
            Sign Out
          </button>
        </div>
      </div>

      <div className="bg-rvno-card rounded-lg border border-rvno-border p-4 mb-6">
        <p className="font-body text-sm text-rvno-ink-muted">
          <span className="text-[#C4853A] font-semibold">Tip:</span> You can now edit members, events, resources, and page content directly on the site.
          Just go to any page and look for the edit buttons in the bottom-right corner of each section.
        </p>
      </div>

      <h2 className="font-display text-lg font-semibold text-rvno-ink mb-4">
        Album Management
      </h2>
      <p className="font-body text-sm text-rvno-ink-muted mb-4">
        Create albums and upload photos here. Photos require the file upload interface.
      </p>

      <button
        onClick={() => setShowNewAlbum(!showNewAlbum)}
        className="mb-6 bg-rvno-teal text-white font-body text-base font-semibold px-6 py-3 rounded-lg min-h-[48px] hover:bg-rvno-teal transition-colors"
      >
        + New Album
      </button>

      {showNewAlbum && (
        <NewAlbumForm
          onCreated={() => {
            setShowNewAlbum(false);
            loadAlbums();
          }}
        />
      )}

      <div className="space-y-3">
        {albums.map((album) => (
          <AlbumRow key={album.id} album={album} onUpdate={loadAlbums} />
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
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title || !date) return;
    setSaving(true);

    await supabase.from("albums").insert({
      title,
      event_date: date,
      location_name: location,
      description: description || null,
      cover_photo_url: null,
      location_lat: lat ? parseFloat(lat) : null,
      location_lng: lng ? parseFloat(lng) : null,
    });

    setSaving(false);
    onCreated();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-rvno-card rounded-lg border border-rvno-border p-5 mb-6 space-y-3"
    >
      <input
        type="text"
        placeholder="Album title (e.g., Blue Ridge Fall Ride)"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full bg-rvno-elevated border-2 border-rvno-border rounded-lg px-4 py-3 font-body text-base text-rvno-ink placeholder:text-rvno-ink-dim focus:outline-none focus:border-rvno-teal/40"
        required
      />
      <div className="grid grid-cols-2 gap-3">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="bg-rvno-elevated border-2 border-rvno-border rounded-lg px-4 py-3 font-body text-base text-rvno-ink focus:outline-none focus:border-rvno-teal/40"
          required
        />
        <input
          type="text"
          placeholder="Location name"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="bg-rvno-elevated border-2 border-rvno-border rounded-lg px-4 py-3 font-body text-base text-rvno-ink placeholder:text-rvno-ink-dim focus:outline-none focus:border-rvno-teal/40"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <input
          type="text"
          placeholder="Latitude (e.g., 37.27)"
          value={lat}
          onChange={(e) => setLat(e.target.value)}
          className="bg-rvno-elevated border-2 border-rvno-border rounded-lg px-4 py-3 font-body text-base text-rvno-ink placeholder:text-rvno-ink-dim focus:outline-none focus:border-rvno-teal/40"
        />
        <input
          type="text"
          placeholder="Longitude (e.g., -79.94)"
          value={lng}
          onChange={(e) => setLng(e.target.value)}
          className="bg-rvno-elevated border-2 border-rvno-border rounded-lg px-4 py-3 font-body text-base text-rvno-ink placeholder:text-rvno-ink-dim focus:outline-none focus:border-rvno-teal/40"
        />
      </div>
      <p className="font-body text-sm text-rvno-ink-dim">
        Coordinates are optional — photos with GPS data will auto-fill these
        on first upload.
      </p>
      <textarea
        placeholder="Quick description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={2}
        className="w-full bg-rvno-elevated border-2 border-rvno-border rounded-lg px-4 py-3 font-body text-base text-rvno-ink placeholder:text-rvno-ink-dim focus:outline-none focus:border-rvno-teal/40 resize-none"
      />
      <button
        type="submit"
        disabled={saving}
        className="bg-rvno-teal text-white font-body text-base font-semibold px-6 py-3 rounded-lg min-h-[48px] hover:bg-rvno-teal transition-colors disabled:opacity-50"
      >
        {saving ? "Creating..." : "Create Album"}
      </button>
    </form>
  );
}

function AlbumRow({
  album,
  onUpdate,
}: {
  album: Album;
  onUpdate: () => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [editingPhoto, setEditingPhoto] = useState<Photo | null>(null);

  async function loadPhotos() {
    const { data } = await supabase
      .from("photos")
      .select("*")
      .eq("album_id", album.id)
      .order("sort_order", { ascending: true });
    if (data) setPhotos(data);
  }

  async function extractGPSAndDate(file: File): Promise<{
    lat: number | null;
    lng: number | null;
    takenAt: string | null;
  }> {
    try {
      const exifr = await import("exifr");
      const data = await exifr.parse(file, ["GPSLatitude", "GPSLongitude", "DateTimeOriginal"]);

      let lat: number | null = null;
      let lng: number | null = null;
      let takenAt: string | null = null;

      if (data) {
        const gps = await exifr.gps(file);
        if (gps && gps.latitude && gps.longitude) {
          lat = gps.latitude;
          lng = gps.longitude;
        }

        if (data.DateTimeOriginal) {
          takenAt = new Date(data.DateTimeOriginal).toISOString();
        }
      }

      return { lat, lng, takenAt };
    } catch {
      return { lat: null, lng: null, takenAt: null };
    }
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);

    let firstGPS: { lat: number; lng: number } | null = null;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const ext = file.name.split(".").pop();
      const fileName = `${album.id}/${Date.now()}-${i}.${ext}`;

      const { lat, lng, takenAt } = await extractGPSAndDate(file);

      if (i === 0 && lat && lng) {
        firstGPS = { lat, lng };
      }

      const { error: uploadError } = await supabase.storage
        .from("album-photos")
        .upload(fileName, file);

      if (uploadError) {
        console.error("Upload error:", uploadError);
        continue;
      }

      const { data: urlData } = supabase.storage
        .from("album-photos")
        .getPublicUrl(fileName);

      await supabase.from("photos").insert({
        album_id: album.id,
        url: urlData.publicUrl,
        caption: null,
        sort_order: photos.length + i,
        location_lat: lat,
        location_lng: lng,
        taken_at: takenAt,
      });

      if (!album.cover_photo_url && i === 0) {
        await supabase
          .from("albums")
          .update({ cover_photo_url: urlData.publicUrl })
          .eq("id", album.id);
      }
    }

    if (firstGPS && !album.location_lat) {
      await supabase
        .from("albums")
        .update({
          location_lat: firstGPS.lat,
          location_lng: firstGPS.lng,
        })
        .eq("id", album.id);
    }

    setUploading(false);
    loadPhotos();
    onUpdate();
    e.target.value = "";
  }

  async function deleteAlbum() {
    if (!confirm(`Delete "${album.title}" and all its photos?`)) return;

    const { data: albumPhotos } = await supabase
      .from("photos")
      .select("url")
      .eq("album_id", album.id);

    if (albumPhotos) {
      const paths = albumPhotos
        .map((p) => {
          try {
            const url = new URL(p.url);
            return url.pathname.split("/album-photos/")[1];
          } catch {
            return null;
          }
        })
        .filter(Boolean) as string[];

      if (paths.length > 0) {
        await supabase.storage.from("album-photos").remove(paths);
      }
    }

    await supabase.from("albums").delete().eq("id", album.id);
    onUpdate();
  }

  return (
    <div className="bg-rvno-card rounded-lg border border-rvno-border p-4">
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
          <p className="font-body text-sm text-rvno-teal tracking-wide mt-0.5">
            {new Date(album.event_date + "T00:00:00").toLocaleDateString(
              "en-US",
              { month: "long", day: "numeric", year: "numeric" }
            )}
            {album.location_name ? ` · ${album.location_name}` : ""}
            {album.location_lat
              ? ` · 📍 ${album.location_lat.toFixed(2)}, ${album.location_lng?.toFixed(2)}`
              : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={`/album/${album.id}`}
            className="font-body text-sm text-rvno-ink-dim hover:text-rvno-teal tracking-wide"
          >
            View
          </a>
          <button
            onClick={deleteAlbum}
            className="font-body text-sm text-rvno-ink-dim hover:text-rvno-dot tracking-wide"
          >
            Delete
          </button>
        </div>
      </div>

      {expanded && (
        <div className="mt-4 pt-3 border-t border-rvno-border">
          <label className="inline-block bg-rvno-elevated border border-rvno-border rounded px-3 py-1.5 font-mono text-xs text-rvno-ink-muted hover:text-rvno-teal hover:border-rvno-teal/20 transition-colors cursor-pointer mb-3">
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

          {photos.length > 0 && (
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5">
              {photos.map((photo) => (
                <div
                  key={photo.id}
                  className="aspect-square bg-rvno-surface rounded overflow-hidden relative group cursor-pointer"
                  onClick={() => setEditingPhoto(photo)}
                >
                  <img
                    src={photo.url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                  {photo.location_lat && (
                    <span className="absolute bottom-0.5 left-0.5 text-[8px] bg-black/50 text-white/80 px-1 rounded">
                      📍
                    </span>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                    <span className="text-white/0 group-hover:text-white/80 text-[10px] font-mono">
                      Edit
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {photos.length === 0 && !uploading && (
            <p className="font-body text-sm text-rvno-ink-dim">
              No photos yet. Click &quot;+ Add Photos&quot; to upload some.
            </p>
          )}

          {editingPhoto && (
            <PhotoEditModal
              photo={editingPhoto}
              onClose={() => setEditingPhoto(null)}
              onSave={() => {
                setEditingPhoto(null);
                loadPhotos();
              }}
            />
          )}
        </div>
      )}
    </div>
  );
}

function PhotoEditModal({
  photo,
  onClose,
  onSave,
}: {
  photo: Photo;
  onClose: () => void;
  onSave: () => void;
}) {
  const [caption, setCaption] = useState(photo.caption || "");
  const [lat, setLat] = useState(photo.location_lat?.toString() || "");
  const [lng, setLng] = useState(photo.location_lng?.toString() || "");
  const [takenAt, setTakenAt] = useState(
    photo.taken_at ? photo.taken_at.split("T")[0] : ""
  );
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    await supabase
      .from("photos")
      .update({
        caption: caption || null,
        location_lat: lat ? parseFloat(lat) : null,
        location_lng: lng ? parseFloat(lng) : null,
        taken_at: takenAt ? new Date(takenAt).toISOString() : null,
      })
      .eq("id", photo.id);
    setSaving(false);
    onSave();
  }

  async function handleDelete() {
    if (!confirm("Delete this photo?")) return;
    await supabase.from("photos").delete().eq("id", photo.id);
    onSave();
  }

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-rvno-elevated rounded-lg border border-rvno-border max-w-md w-full p-5">
        <div className="flex items-start gap-4 mb-4">
          <img
            src={photo.url}
            alt=""
            className="w-24 h-24 object-cover rounded"
          />
          <div className="flex-1">
            <h3 className="font-display text-sm font-semibold text-rvno-ink mb-1">
              Edit Photo
            </h3>
            <p className="font-body text-sm text-rvno-ink-dim">
              {photo.location_lat
                ? `📍 ${photo.location_lat.toFixed(4)}, ${photo.location_lng?.toFixed(4)}`
                : "No GPS data"}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="font-body text-sm text-rvno-ink-dim uppercase tracking-wide block mb-1">
              Caption
            </label>
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Add a caption..."
              className="w-full bg-rvno-card border-2 border-rvno-border rounded-lg px-4 py-3 font-body text-base text-rvno-ink placeholder:text-rvno-ink-dim focus:outline-none focus:border-rvno-teal/40"
            />
          </div>

          <div>
            <label className="font-body text-sm text-rvno-ink-dim uppercase tracking-wide block mb-1">
              Date Taken
            </label>
            <input
              type="date"
              value={takenAt}
              onChange={(e) => setTakenAt(e.target.value)}
              className="w-full bg-rvno-card border-2 border-rvno-border rounded-lg px-4 py-3 font-body text-base text-rvno-ink focus:outline-none focus:border-rvno-teal/40"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-body text-sm text-rvno-ink-dim uppercase tracking-wide block mb-1">
                Latitude
              </label>
              <input
                type="text"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                placeholder="37.27"
                className="w-full bg-rvno-card border-2 border-rvno-border rounded-lg px-4 py-3 font-body text-base text-rvno-ink placeholder:text-rvno-ink-dim focus:outline-none focus:border-rvno-teal/40"
              />
            </div>
            <div>
              <label className="font-body text-sm text-rvno-ink-dim uppercase tracking-wide block mb-1">
                Longitude
              </label>
              <input
                type="text"
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                placeholder="-79.94"
                className="w-full bg-rvno-card border-2 border-rvno-border rounded-lg px-4 py-3 font-body text-base text-rvno-ink placeholder:text-rvno-ink-dim focus:outline-none focus:border-rvno-teal/40"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mt-5 pt-4 border-t border-rvno-border">
          <button
            onClick={handleDelete}
            className="font-body text-sm text-rvno-dot hover:text-red-400 tracking-wide"
          >
            Delete Photo
          </button>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="font-body text-sm text-rvno-ink-dim hover:text-rvno-ink tracking-wide px-3 py-1.5"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-rvno-teal-dark text-rvno-white font-mono text-xs px-3 py-1.5 rounded hover:bg-rvno-teal transition-colors disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
