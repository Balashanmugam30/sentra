// Feature types stay local to the user module. Only shared cross-domain
// primitives like RBAC roles belong in /types.
import type { AppRole } from "@/types/rbac";

export interface UserProfile {
  user_id: string;
  display_name: string;
  email: string;
  roles: AppRole[];
}
