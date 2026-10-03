import { MediaWorkspace } from "@/components/admin/media-workspace";

export const metadata = { title: "Gallery" };
export const dynamic = "force-dynamic";

type MediaSearchParams = {
  category?: string;
  q?: string;
  type?: string;
  caption?: string;
  view?: string;
};

export default async function AdminGalleryPage({
  searchParams,
}: {
  searchParams: Promise<MediaSearchParams>;
}) {
  return (
    <MediaWorkspace presetCategoryId="gallery" searchParams={searchParams} />
  );
}
