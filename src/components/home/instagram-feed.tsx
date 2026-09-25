import { InstagramStrip } from "@/components/home/instagram-strip";
import { PlaceholderPanel } from "@/components/ui/placeholder-panel";
import { readInstagramImages } from "@/lib/media/instagram-assets";

/**
 * The homepage Instagram section sourced from the local
 * `public/assets/instagram` folder — no Graph API, no token, no database.
 * Discovery happens at read time, so dropping supported images into the folder
 * is the only step to update it. An empty folder keeps the labelled fallback.
 */
export function InstagramFeed() {
  const images = readInstagramImages();

  if (images.length === 0) {
    return (
      <PlaceholderPanel
        kind="media"
        label="Instagram images not supplied"
        detail="No images are in public/assets/instagram yet, so this section is hidden. Add .webp, .jpg, .jpeg or .png files to that folder to show them here."
      />
    );
  }

  return <InstagramStrip images={images} />;
}
