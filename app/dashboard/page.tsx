import { redirect } from "next/navigation";

export default async function DashboardWorkspacePage({
  searchParams,
}: {
  searchParams?: Promise<{ mode?: string }> | { mode?: string };
}) {
  const resolved = await searchParams;
  const mode = resolved?.mode;
  if (mode) {
    redirect(`/app?mode=${encodeURIComponent(mode)}`);
  }
  redirect("/app");
}
