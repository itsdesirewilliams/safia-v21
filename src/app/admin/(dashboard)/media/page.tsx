import { MediaWorkspace } from "@/components/admin/media-workspace";

export const metadata = { title: "Media" };
export const dynamic = "force-dynamic";

type MediaSearchParams = {
  category?: string;
  q?: string;
  type?: string;
  caption?: string;
  view?: string;
};

export default async function AdminMediaPage({
  searchParams,
}: {
  searchParams: Promise<MediaSearchParams>;
}) {
  return (
    <MediaWorkspace presetCategoryId="all" searchParams={searchParams} />
  );
}
