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
  /**
   * Start playback automatically. Browsers only permit this when muted, so the
   * two are set together — there is no unmuted autoplay to ask for.
   */
  autoplay?: boolean;
};

/**
 * Build the embed URL. Autoplay is only added when explicitly requested, and is
 * always muted; without it the caller gets a normal click-to-play player.
 */
export function youtubeEmbedUrl(
  id: string,
  options: YoutubeEmbedOptions = {},
): string {
  const params = new URLSearchParams({ rel: "0", playsinline: "1" });

  if (options.autoplay) {
    params.set("autoplay", "1");
    params.set("mute", "1");
  }

  return `https://www.youtube-nocookie.com/embed/${id}?${params.toString()}`;
}
