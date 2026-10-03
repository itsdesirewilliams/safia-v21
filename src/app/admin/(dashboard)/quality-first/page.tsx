import { MediaWorkspace } from "@/components/admin/media-workspace";

export const metadata = { title: "Quality First" };
export const dynamic = "force-dynamic";

type MediaSearchParams = {
  category?: string;
  q?: string;
  type?: string;
  caption?: string;
  view?: string;
};

export default async function AdminQualityFirstPage({
  searchParams,
}: {
  searchParams: Promise<MediaSearchParams>;
}) {
  return (
    <MediaWorkspace presetCategoryId="quality-first" searchParams={searchParams} />
  );
}
