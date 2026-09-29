import { redirect } from "next/navigation";

/** Legacy route: the media library is now the central Admin → Files manager. */
export default function LegacyMediaPage() {
  redirect("/admin/files");
}
