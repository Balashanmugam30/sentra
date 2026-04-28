import { Card } from "@/components/ui";

export function SectionPlaceholder({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-muted">{eyebrow}</p>
        <h1 className="text-3xl font-semibold tracking-[-0.03em] text-foreground">{title}</h1>
      </div>

      <Card className="min-h-[320px] p-6">
        <div className="flex h-full items-center justify-center">
          <div className="max-w-lg text-center">
            <p className="text-xl font-medium text-foreground">{title}</p>
            <p className="mt-3 text-sm leading-6 text-muted">{description}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
