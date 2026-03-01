import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Get metadata including EXIF
    const metadata = await sharp(buffer).metadata();

    // Convert to JPEG
    const jpegBuffer = await sharp(buffer)
      .jpeg({ quality: 90 })
      .toBuffer();

    // Extract GPS and date from EXIF
    let lat: number | null = null;
    let lng: number | null = null;
    let takenAt: string | null = null;

    if (metadata.exif) {
      try {
        // Use exifr for detailed parsing on server
        const exifr = await import("exifr");
        const exifData = await exifr.parse(buffer);

        if (exifData) {
          const gps = await exifr.gps(buffer);
          if (gps?.latitude && gps?.longitude) {
            lat = gps.latitude;
            lng = gps.longitude;
          }
          if (exifData.DateTimeOriginal) {
            takenAt = new Date(exifData.DateTimeOriginal).toISOString();
          }
        }
      } catch {
        // EXIF parsing failed, continue without it
      }
    }

    // Return JPEG as base64 with metadata
    return NextResponse.json({
      jpeg: jpegBuffer.toString("base64"),
      metadata: {
        lat,
        lng,
        takenAt,
        width: metadata.width,
        height: metadata.height,
      },
    });
  } catch (error) {
    console.error("HEIF conversion error:", error);
    return NextResponse.json(
      { error: "Failed to convert image" },
      { status: 500 }
    );
  }
}
