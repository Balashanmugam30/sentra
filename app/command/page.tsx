import { redirect } from "next/navigation";

export default function CommandRoutePage() {
  redirect("/app?mode=command");
}
