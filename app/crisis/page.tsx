import { redirect } from "next/navigation";

export default function CrisisRoutePage() {
  redirect("/app?mode=crisis");
}
