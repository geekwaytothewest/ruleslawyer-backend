/**
 * Best-effort image MIME sniff from a buffer's magic bytes. Cover art is stored
 * as raw image bytes with no recorded content type, so we detect it on the way
 * out when streaming. Defaults to image/jpeg (BGG thumbnails are predominantly
 * JPEG) when the signature isn't recognized.
 */
export function detectImageMime(buffer: Uint8Array): string {
  const b = buffer;

  // PNG: 89 50 4E 47
  if (
    b.length >= 4 &&
    b[0] === 0x89 &&
    b[1] === 0x50 &&
    b[2] === 0x4e &&
    b[3] === 0x47
  ) {
    return 'image/png';
  }

  // JPEG: FF D8 FF
  if (b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) {
    return 'image/jpeg';
  }

  // GIF: "GIF"
  if (b.length >= 3 && b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46) {
    return 'image/gif';
  }

  // WebP: "RIFF" .... "WEBP"
  if (
    b.length >= 12 &&
    b[0] === 0x52 &&
    b[1] === 0x49 &&
    b[2] === 0x46 &&
    b[3] === 0x46 &&
    b[8] === 0x57 &&
    b[9] === 0x45 &&
    b[10] === 0x42 &&
    b[11] === 0x50
  ) {
    return 'image/webp';
  }

  return 'image/jpeg';
}
