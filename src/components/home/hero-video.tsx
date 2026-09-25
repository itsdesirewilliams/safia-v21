"use client";

import { useEffect, useRef, useState } from "react";

function VolumeIcon({ muted }: { muted: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
    >
      <path d="M4 9.5h3l4-3.5v12l-4-3.5H4z" />
      {muted ? (
        <path d="m16 9.5 4 5m0-5-4 5" />
      ) : (
        <>
          <path d="M15.5 9a4 4 0 0 1 0 6" />
          <path d="M18 6.75a7 7 0 0 1 0 10.5" />
        </>
      )}
    </svg>
  );
}

export type HeroVideoProps = {
  src: string;
  poster: string;
  label: string;
};

/**
 * The dedicated hero video panel.
 *
 * The video is a real media element that keeps its natural aspect ratio — the
 * panel sizes to the footage, which is never cropped or used as a background.
 * It autoplays muted; if the browser blocks that, the poster stays and a play
 * control appears. A quiet control lets the visitor unmute.
 */
export function HeroVideo({ src, poster, label }: HeroVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const [needsPlay, setNeedsPlay] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    video.muted = true;
    const attempt = video.play();
    if (attempt && typeof attempt.catch === "function") {
      attempt.catch(() => setNeedsPlay(true));
    }
  }, []);

  function startPlayback() {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    video.muted = true;
    setMuted(true);
    const attempt = video.play();
    if (attempt && typeof attempt.then === "function") {
      attempt.then(() => setNeedsPlay(false)).catch(() => {});
    } else {
      setNeedsPlay(false);
    }
  }

  function toggleMute() {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    const next = !muted;
    video.muted = next;
    setMuted(next);

    if (!next) {
      const attempt = video.play();
      if (attempt && typeof attempt.catch === "function") {
        attempt.catch(() => {});
      }
    }
  }

  return (
    <figure className="relative">
      <video
        ref={videoRef}
        className="w-full h-auto block rounded-card border border-white/10 bg-ink-900 shadow-pop"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster={poster}
        aria-label={label}
        onVolumeChange={() => setMuted(videoRef.current?.muted ?? true)}
      >
        <source src={src} type="video/mp4" />
      </video>

      {needsPlay && (
        <button
          type="button"
          onClick={startPlayback}
          className="absolute inset-0 flex items-center justify-center rounded-card bg-ink-950/40 transition-colors hover:bg-ink-950/50"
        >
          <span className="inline-flex h-16 w-16 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white backdrop-blur">
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="ml-1 h-6 w-6"
            >
              <path d="M8 5.5v13l11-6.5-11-6.5Z" />
            </svg>
          </span>
          <span className="sr-only">Play video</span>
        </button>
      )}

      <button
        type="button"
        onClick={toggleMute}
        aria-label={muted ? "Unmute video" : "Mute video"}
        className="absolute bottom-4 right-4 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-ink-950/55 text-white backdrop-blur transition-colors hover:bg-ink-950/75"
      >
        <VolumeIcon muted={muted} />
      </button>

      <figcaption className="sr-only">{label}</figcaption>
    </figure>
  );
}
