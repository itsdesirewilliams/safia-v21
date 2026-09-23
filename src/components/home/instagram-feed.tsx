import Image from "next/image";

import { PlaceholderPanel } from "@/components/ui/placeholder-panel";
import { getOptionalInstagramAccessToken } from "@/lib/config";
import { fetchInstagramPosts, type InstagramPost } from "@/lib/instagram";

function PostTile({ post }: { post: InstagramPost }) {
  return (
    <a
      href={post.permalink}
      target="_blank"
      rel="noopener noreferrer"
      className="group block"
    >
      <span className="relative block aspect-[4/5] overflow-hidden rounded-2xl bg-ink-100">
        <Image
          src={post.imageUrl}
          alt={post.caption ?? "Safeway Tyre on Instagram"}
          fill
          sizes="(max-width: 640px) 50vw, 25vw"
          className="object-cover transition-transform duration-700 ease-out motion-reduce:transition-none group-hover:scale-[1.04]"
        />
      </span>
      {post.caption && (
        <span className="mt-2.5 block line-clamp-2 text-xs leading-relaxed text-ink-600">
          {post.caption}
        </span>
      )}
    </a>
  );
}

/**
 * Server-rendered Instagram feed (ADR-0008). No token → labelled placeholder;
 * fetch failure with a token → section hidden; otherwise the four most recent
 * posts at 4:5.
 */
export async function InstagramFeed() {
  const token = getOptionalInstagramAccessToken();

  if (!token) {
    return (
      <PlaceholderPanel
        kind="media"
        label="Instagram feed not connected"
        detail="No Instagram access token is configured, so the latest posts are hidden for now. Set INSTAGRAM_ACCESS_TOKEN to enable this feed."
      />
    );
  }

  let posts: InstagramPost[] = [];
  try {
    posts = await fetchInstagramPosts();
  } catch {
    return null;
  }

  if (posts.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {posts.map((post) => (
        <PostTile key={post.id} post={post} />
      ))}
    </div>
  );
}
