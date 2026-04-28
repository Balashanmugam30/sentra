interface UserAvatarProps {
  initials: string;
}

export function UserAvatar({ initials }: UserAvatarProps) {
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--color-primary)_14%,transparent)] text-sm font-semibold text-[var(--color-primary)]">
      {initials}
    </div>
  );
}
