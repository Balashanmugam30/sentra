import { create } from "zustand";

import type { AppRole } from "@/types/rbac";
import { useAuthStore } from "@/store/auth-store";

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

// Reconcile and synchronize with primary auth store
if (typeof window !== "undefined") {
  useAuthStore.subscribe((state) => {
    const authUser = state.user;
    if (!authUser) {
      if (useUserStore.getState().currentUser !== null) {
        useUserStore.setState({ currentUser: null });
      }
    } else {
      const prev = useUserStore.getState().currentUser;
      const email = authUser.email ?? "";
      const displayName = authUser.displayName ?? email ?? "Sentra Operator";
      if (
        !prev ||
        prev.userId !== authUser.uid ||
        prev.email !== email ||
        prev.displayName !== displayName ||
        !prev.roles.includes(authUser.role)
      ) {
        useUserStore.setState({
          currentUser: {
            userId: authUser.uid,
            email,
            displayName,
            roles: [authUser.role],
          },
        });
      }
    }
  });
}
