import { redirect } from "next/navigation";

export default function CrisisRoutePage() {
  redirect("/dashboard?mode=crisis");
}
