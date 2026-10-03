import { redirect } from "next/navigation";

import { requireMediaManager } from "@/lib/auth/session";

export const metadata = { title: "Media" };

/**
 * Legacy file-manager route. Kept so existing links and bookmarks keep working;
 * the media workspace now lives under the Content → Media module.
 */
export default async function AdminFilesPage() {
  await requireMediaManager();
  redirect("/admin/media");
}
