import { cn } from "@/lib/utils";

export function SectionWrapper({
  children,
  className,
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id: string;
}) {
  return (
    <section
      className={cn(
        "relative flex min-h-screen w-full items-center justify-center px-5 py-24 sm:px-8",
        className,
      )}
      id={id}
    >
      <div className="relative z-30 mx-auto w-full max-w-[1200px]">{children}</div>
    </section>
  );
}
