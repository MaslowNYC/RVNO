"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import type { Album, Photo } from "@/lib/database.types";

interface AlbumDetailProps {
  album: Album;
  initialPhotos: Photo[];
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
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

function isHeicFile(file: File): boolean {
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();
  return (
    name.endsWith(".heic") ||
    name.endsWith(".heif") ||
    type === "image/heic" ||
    type === "image/heif" ||
    type === "image/heic-sequence" ||
    type === "image/heif-sequence" ||
    // Some browsers report HEIC as empty or generic
    (type === "" && (name.endsWith(".heic") || name.endsWith(".heif"))) ||
    (type === "application/octet-stream" && (name.endsWith(".heic") || name.endsWith(".heif")))
  );
}

interface ConversionResult {
  file: File;
  exifData: { lat: number | null; lng: number | null; takenAt: string | null };
}

async function convertHeicToJpeg(file: File): Promise<ConversionResult> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/convert-heif", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Server conversion failed");
  }

  const data = await response.json();
  const binaryString = atob(data.jpeg);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  const blob = new Blob([bytes], { type: "image/jpeg" });

  const newName = file.name.replace(/\.heic$/i, ".jpg").replace(/\.heif$/i, ".jpg");
  const convertedFile = new File([blob], newName, { type: "image/jpeg" });

  return {
    file: convertedFile,
    exifData: {
      lat: data.metadata.lat,
      lng: data.metadata.lng,
      takenAt: data.metadata.takenAt,
    },
  };
}

export function AlbumDetail({ album, initialPhotos }: AlbumDetailProps) {
  const { isAdmin } = useAuth();
  const router = useRouter();

  const [photos, setPhotos] = useState(initialPhotos);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [editingCaption, setEditingCaption] = useState<string | null>(null);
  const [captionText, setCaptionText] = useState("");
  const [saving, setSaving] = useState(false);

  // Admin editing state
  const [editMode, setEditMode] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<Photo | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
  };

  const goToPrevious = () => {
    if (lightboxIndex !== null && lightboxIndex > 0) {
      setLightboxIndex(lightboxIndex - 1);
    }
  };

  const goToNext = () => {
    if (lightboxIndex !== null && lightboxIndex < photos.length - 1) {
      setLightboxIndex(lightboxIndex + 1);
    }
  };

  const startEditCaption = (photo: Photo) => {
    setEditingCaption(photo.id);
    setCaptionText(photo.caption || "");
  };

  const cancelEditCaption = () => {
    setEditingCaption(null);
    setCaptionText("");
  };

  const saveCaption = async (photoId: string) => {
    setSaving(true);
    await supabase
      .from("photos")
      .update({ caption: captionText || null })
      .eq("id", photoId);
    setSaving(false);
    setEditingCaption(null);
    router.refresh();
  };

  // Admin photo management functions
  const loadPhotos = async () => {
    const { data } = await supabase
      .from("photos")
      .select("*")
      .eq("album_id", album.id)
      .order("sort_order", { ascending: true });
    if (data) setPhotos(data);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    setUploadStatus(null);

    let firstGPS: { lat: number; lng: number } | null = null;
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < files.length; i++) {
      let file = files[i];
      const originalName = file.name;

      // Convert HEIC/HEIF to JPEG for browser compatibility
      let preservedExif: { lat: number | null; lng: number | null; takenAt: string | null } | null = null;
      if (isHeicFile(file)) {
        try {
          setUploadStatus(`Converting ${originalName} to JPEG...`);
          const result = await convertHeicToJpeg(file);
          file = result.file;
          preservedExif = result.exifData;
        } catch (err) {
          console.error("HEIC conversion error for", originalName, ":", err);
          failCount++;
          setUploadStatus(`Failed to convert ${originalName}`);
          continue;
        }
      }

      setUploadStatus(`Uploading ${i + 1} of ${files.length}...`);

      const ext = file.name.split(".").pop();
      const fileName = `${album.id}/${Date.now()}-${i}.${ext}`;

      // Use preserved EXIF data for converted HEIC, otherwise extract fresh
      const { lat, lng, takenAt } = preservedExif || await extractGPSAndDate(file);

      if (i === 0 && lat && lng) {
        firstGPS = { lat, lng };
      }

      const { error: uploadError } = await supabase.storage
        .from("album-photos")
        .upload(fileName, file, {
          contentType: file.type || "image/jpeg",
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        failCount++;
        continue;
      }

      successCount++;

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
    e.target.value = "";

    // Show final status
    if (failCount > 0) {
      setUploadStatus(`Uploaded ${successCount} photo${successCount !== 1 ? "s" : ""}. ${failCount} failed.`);
    } else if (successCount > 0) {
      setUploadStatus(`Uploaded ${successCount} photo${successCount !== 1 ? "s" : ""} successfully!`);
    }
    setTimeout(() => setUploadStatus(null), 4000);
  };

  const handleDeletePhoto = async (photo: Photo) => {
    if (!confirm("Delete this photo?")) return;

    // Delete from storage
    try {
      const url = new URL(photo.url);
      const path = url.pathname.split("/album-photos/")[1];
      if (path) {
        await supabase.storage.from("album-photos").remove([path]);
      }
    } catch {
      // Continue even if storage delete fails
    }

    // Delete from database
    await supabase.from("photos").delete().eq("id", photo.id);
    loadPhotos();
  };

  // Handle keyboard navigation in lightbox
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (lightboxIndex === null) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") goToPrevious();
    if (e.key === "ArrowRight") goToNext();
  };

  return (
    <div className="max-w-5xl mx-auto px-5 py-12">
      {/* Back link */}
      <Link
        href="/photos"
        className="inline-flex items-center gap-2 font-mono text-sm text-rvno-ink-dim hover:text-rvno-teal transition-colors mb-8"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Back to Albums
      </Link>

      {/* Album header */}
      <header className="mb-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-rvno-ink mb-2">
              {album.title}
            </h1>
            <div className="flex items-center gap-2 text-rvno-ink-dim">
              <span className="font-mono text-sm">{formatDate(album.event_date)}</span>
              {album.location_name && (
                <>
                  <span>·</span>
                  <span className="font-mono text-sm">{album.location_name}</span>
                </>
              )}
            </div>
          </div>
          {isAdmin && (
            <button
              onClick={() => setEditMode(!editMode)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg font-body text-sm transition-colors ${
                editMode
                  ? "bg-[#C4853A] text-white"
                  : "bg-rvno-card border border-rvno-border text-rvno-ink-dim hover:text-rvno-ink hover:border-[#C4853A]/50"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              {editMode ? "Done Editing" : "Manage Photos"}
            </button>
          )}
        </div>
        {album.description && (
          <p className="font-body text-base text-rvno-ink-muted mt-4 max-w-2xl">
            {album.description}
          </p>
        )}
      </header>

      {/* Admin upload bar */}
      {isAdmin && editMode && (
        <div className="mb-6 p-4 bg-rvno-card rounded-lg border border-[#C4853A]/30">
          <label className="inline-flex items-center gap-2 bg-[#C4853A] hover:bg-[#B37832] text-white font-body text-sm px-4 py-2 rounded-lg cursor-pointer transition-colors">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            {uploading ? "Uploading..." : "Add Photos"}
            <input
              type="file"
              accept="image/*,.heic,.heif"
              multiple
              onChange={handlePhotoUpload}
              className="hidden"
              disabled={uploading}
            />
          </label>
          <p className="font-body text-xs text-rvno-ink-dim mt-2">
            Supports JPG, PNG, HEIC/HEIF. GPS coordinates and date will be extracted automatically.
          </p>
          {uploadStatus && (
            <p className="font-body text-sm text-[#C4853A] mt-2 animate-pulse">
              {uploadStatus}
            </p>
          )}
        </div>
      )}

      {/* Photo grid */}
      {photos.length === 0 ? (
        <div className="text-center py-16 bg-rvno-card rounded-lg border border-rvno-border">
          <p className="font-body text-base text-rvno-ink-dim">
            No photos in this album yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {photos.map((photo, index) => (
            <div key={photo.id} className="group relative">
              <button
                onClick={() => editMode ? setEditingPhoto(photo) : openLightbox(index)}
                className="block w-full aspect-square bg-rvno-surface rounded-lg overflow-hidden border border-rvno-border hover:border-[#C4853A]/50 transition-colors focus:outline-none focus:ring-2 focus:ring-[#C4853A]/50"
              >
                <img
                  src={photo.url}
                  alt={photo.caption || `Photo ${index + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </button>

              {/* Cover photo star indicator */}
              {album.cover_photo_url === photo.url && (
                <div className="absolute top-2 left-2 p-1 bg-yellow-500/90 rounded-full" title="Album cover">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="white"
                    stroke="white"
                    strokeWidth="2"
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                </div>
              )}

              {/* Edit mode overlay */}
              {isAdmin && editMode && (
                <div className="absolute inset-0 pointer-events-none">
                  {/* Edit button */}
                  <button
                    onClick={() => setEditingPhoto(photo)}
                    className="pointer-events-auto absolute top-2 left-2 p-1.5 bg-[#C4853A] rounded text-white hover:bg-[#B37832] transition-colors"
                    title="Edit photo"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </button>
                  {/* Delete button */}
                  <button
                    onClick={() => handleDeletePhoto(photo)}
                    className="pointer-events-auto absolute top-2 right-2 p-1.5 bg-red-500/90 rounded text-white hover:bg-red-600 transition-colors"
                    title="Delete photo"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                </div>
              )}

              {/* Caption display/edit */}
              {editingCaption === photo.id ? (
                <div className="mt-2 space-y-2">
                  <textarea
                    value={captionText}
                    onChange={(e) => setCaptionText(e.target.value)}
                    placeholder="Add a caption..."
                    rows={2}
                    className="w-full bg-rvno-elevated border border-rvno-border rounded px-2 py-1 font-body text-sm text-rvno-ink focus:outline-none focus:border-[#C4853A]/50 resize-none"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => saveCaption(photo.id)}
                      disabled={saving}
                      className="px-2 py-1 bg-[#C4853A] hover:bg-[#B37832] text-white font-body text-xs rounded transition-colors disabled:opacity-50"
                    >
                      {saving ? "..." : "Save"}
                    </button>
                    <button
                      onClick={cancelEditCaption}
                      disabled={saving}
                      className="px-2 py-1 text-rvno-ink-dim hover:text-rvno-ink font-body text-xs transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {photo.caption && (
                    <p className="font-body text-xs text-rvno-ink-muted mt-2 line-clamp-2">
                      {photo.caption}
                    </p>
                  )}
                  {isAdmin && !editMode && (
                    <button
                      onClick={() => startEditCaption(photo)}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1.5 bg-black/60 rounded text-white hover:bg-black/80 transition-all"
                      title="Edit caption"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightboxIndex !== null && photos[lightboxIndex] && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={closeLightbox}
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          {/* Close button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 p-2 text-white/70 hover:text-white transition-colors z-10"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          {/* Previous button */}
          {lightboxIndex > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToPrevious();
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 text-white/70 hover:text-white transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
          )}

          {/* Next button */}
          {lightboxIndex < photos.length - 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToNext();
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-white/70 hover:text-white transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          )}

          {/* Image container */}
          <div
            className="max-w-[90vw] max-h-[85vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={photos[lightboxIndex].url}
              alt={photos[lightboxIndex].caption || `Photo ${lightboxIndex + 1}`}
              className="max-w-full max-h-[80vh] object-contain"
            />
            {photos[lightboxIndex].caption && (
              <p className="font-body text-sm text-white/80 mt-4 text-center max-w-lg">
                {photos[lightboxIndex].caption}
              </p>
            )}
            <p className="font-mono text-xs text-white/50 mt-2">
              {lightboxIndex + 1} / {photos.length}
            </p>
          </div>
        </div>
      )}

      {/* Photo Edit Modal */}
      {editingPhoto && (
        <PhotoEditModal
          photo={editingPhoto}
          album={album}
          onClose={() => setEditingPhoto(null)}
          onSave={() => {
            setEditingPhoto(null);
            loadPhotos();
            router.refresh();
          }}
          onDelete={() => {
            handleDeletePhoto(editingPhoto);
            setEditingPhoto(null);
          }}
        />
      )}
    </div>
  );
}

function PhotoEditModal({
  photo,
  album,
  onClose,
  onSave,
  onDelete,
}: {
  photo: Photo;
  album: Album;
  onClose: () => void;
  onSave: () => void;
  onDelete: () => void;
}) {
  const [caption, setCaption] = useState(photo.caption || "");
  const [lat, setLat] = useState(photo.location_lat?.toString() || "");
  const [lng, setLng] = useState(photo.location_lng?.toString() || "");
  const [takenAt, setTakenAt] = useState(
    photo.taken_at ? photo.taken_at.split("T")[0] : ""
  );
  const [saving, setSaving] = useState(false);

  const isCover = album.cover_photo_url === photo.url;

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

  async function handleSetAsCover() {
    setSaving(true);
    await supabase
      .from("albums")
      .update({ cover_photo_url: photo.url })
      .eq("id", album.id);
    setSaving(false);
    onSave();
  }

  return (
    <div
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-rvno-elevated rounded-lg border border-rvno-border max-w-md w-full p-5"
        onClick={(e) => e.stopPropagation()}
      >
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
                ? `GPS: ${photo.location_lat.toFixed(4)}, ${photo.location_lng?.toFixed(4)}`
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
          <div className="flex gap-3">
            <button
              onClick={onDelete}
              className="font-body text-sm text-rvno-dot hover:text-red-400 tracking-wide"
            >
              Delete Photo
            </button>
            {!isCover && (
              <button
                onClick={handleSetAsCover}
                disabled={saving}
                className="font-body text-sm text-yellow-600 hover:text-yellow-500 tracking-wide flex items-center gap-1"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                Set as Cover
              </button>
            )}
            {isCover && (
              <span className="font-body text-sm text-yellow-500 flex items-center gap-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                Album Cover
              </span>
            )}
          </div>
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
              className="bg-[#C4853A] hover:bg-[#B37832] text-white font-mono text-xs px-4 py-2 rounded hover:bg-rvno-teal transition-colors disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
