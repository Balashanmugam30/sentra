import { redirect } from "next/navigation";

export default function CommandRoutePage() {
  redirect("/dashboard?mode=command");
}
