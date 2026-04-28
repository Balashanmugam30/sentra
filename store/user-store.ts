import { create } from "zustand";

import type { AppRole } from "@/types/rbac";

export interface CurrentUser {
  userId: string;
  email: string;
  displayName: string;
  roles: AppRole[];
}

interface UserState {
  currentUser: CurrentUser | null;
  setCurrentUser: (user: CurrentUser | null) => void;
}

export const useUserStore = create<UserState>((set) => ({
  currentUser: null,
  setCurrentUser: (currentUser) => set({ currentUser }),
}));
