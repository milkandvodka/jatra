"use client";

// Pictures are pre-encoded to WebP at three widths (public/img/opt), so they come straight from the CDN
// instead of being optimised on the first request. After adding a picture, encode its variants with the
// ffmpeg command in the README ("Adding a picture").
const WIDTHS = [640, 1080, 1920];

export default function imageLoader({ src, width }: { src: string; width: number; quality?: number }) {
  const m = src.match(/^\/img\/([\w-]+)\.jpg$/);
  if (!m) return src;
  const w = WIDTHS.find((x) => x >= width) ?? WIDTHS[WIDTHS.length - 1];
  return `/img/opt/${m[1]}-${w}.webp`;
}
