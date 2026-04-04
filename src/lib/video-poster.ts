/**
 * Extract duration, dimensions, and a JPEG poster frame from a video file (client-side).
 * Used for traveler journal uploads — no server transcoding.
 */
export type VideoInspectResult = {
  durationSeconds: number;
  width: number;
  height: number;
  posterBlob: Blob;
};

export async function captureVideoPosterAndMetadata(file: File): Promise<VideoInspectResult> {
  const objectUrl = URL.createObjectURL(file);
  try {
    const video = document.createElement("video");
    video.muted = true;
    video.playsInline = true;
    video.preload = "metadata";
    video.src = objectUrl;

    await new Promise<void>((resolve, reject) => {
      video.onloadedmetadata = () => resolve();
      video.onerror = () => reject(new Error("Could not read this video file."));
    });

    const durationSeconds = Number.isFinite(video.duration) ? video.duration : 0;
    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;

    const seekTo = Math.min(0.25, Math.max(0.05, durationSeconds * 0.05 || 0.1));
    video.currentTime = seekTo;

    await new Promise<void>((resolve, reject) => {
      video.onseeked = () => resolve();
      video.onerror = () => reject(new Error("Could not seek in video for poster."));
    });

    const maxEdge = 1280;
    const scale = Math.min(1, maxEdge / Math.max(width, height));
    const cw = Math.max(1, Math.round(width * scale));
    const ch = Math.max(1, Math.round(height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = cw;
    canvas.height = ch;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not create poster image.");
    ctx.drawImage(video, 0, 0, cw, ch);

    const posterBlob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Could not encode poster."))), "image/jpeg", 0.82);
    });

    return { durationSeconds, width: cw, height: ch, posterBlob };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
