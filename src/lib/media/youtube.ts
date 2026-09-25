/**
 * YouTube embed helpers for the homepage "Take a Tour" section.
 *
 * The embed uses the privacy-preserving `youtube-nocookie.com` host and the
 * ordinary YouTube player. It is deliberately free of browser APIs so the URL
 * contract can be tested directly; the component that consumes it handles lazy
 * loading and in-view playback.
 */

const YOUTUBE_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;

/** Whether a value is a canonical 11-character YouTube video id. */
export function isValidYoutubeVideoId(id: string): boolean {
  return YOUTUBE_ID_PATTERN.test(id);
}

export type YoutubeEmbedOptions = {
  autoplay?: boolean;
  mute?: boolean;
};

/**
 * Build the embed URL. Muted autoplay is only added when explicitly requested,
 * so a caller can fall back to a normal click-to-play player without changing
 * the base URL.
 */
export function youtubeEmbedUrl(
  id: string,
  options: YoutubeEmbedOptions = {},
): string {
  const params = new URLSearchParams({ rel: "0", playsinline: "1" });

  if (options.autoplay) {
    params.set("autoplay", "1");
  }
  if (options.mute) {
    params.set("mute", "1");
  }

  return `https://www.youtube-nocookie.com/embed/${id}?${params.toString()}`;
}
