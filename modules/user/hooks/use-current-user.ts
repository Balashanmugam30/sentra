"use client";

import { useUserStore } from "@/store/user-store";

export function useCurrentUser() {
  return useUserStore((state) => state.currentUser);
}
