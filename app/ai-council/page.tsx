import { redirect } from "next/navigation";
import type { Route } from "next";

export default function AICouncilAliasPage() {
  redirect("/app/ai-council" as Route);
}
