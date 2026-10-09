import { redirect } from "next/navigation";

export default function OperationsAliasPage() {
  redirect("/app/operations" as never);
}
