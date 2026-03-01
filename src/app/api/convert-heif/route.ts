import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import { writeFile, readFile, unlink, mkdir } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";
import { randomUUID } from "crypto";

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  const tempDir = join(tmpdir(), "heif-convert");
  const id = randomUUID();
  const inputPath = join(tempDir, `${id}.heic`);
  const outputPath = join(tempDir, `${id}.jpg`);

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Extract EXIF before conversion
    let lat: number | null = null;
    let lng: number | null = null;
    let takenAt: string | null = null;

    try {
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

    // Create temp directory and write input file
    await mkdir(tempDir, { recursive: true });
    await writeFile(inputPath, buffer);

    // Use macOS sips to convert HEIF to JPEG
    await execAsync(`sips -s format jpeg -s formatOptions 90 "${inputPath}" --out "${outputPath}"`);

    // Read the converted JPEG
    const jpegBuffer = await readFile(outputPath);

    // Clean up temp files
    await unlink(inputPath).catch(() => {});
    await unlink(outputPath).catch(() => {});

    // Return JPEG as base64 with metadata
    return NextResponse.json({
      jpeg: jpegBuffer.toString("base64"),
      metadata: {
        lat,
        lng,
        takenAt,
      },
    });
  } catch (error) {
    console.error("HEIF conversion error:", error);

    // Clean up on error
    await unlink(inputPath).catch(() => {});
    await unlink(outputPath).catch(() => {});

    return NextResponse.json(
      { error: "Failed to convert image" },
      { status: 500 }
    );
  }
}
