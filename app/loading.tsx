import { CardSkeleton, ListSkeleton, MapSkeleton } from "@/components/ui/skeleton";
import { Container } from "@/components/ui";

export default function RootLoading() {
  return (
    <main className="min-h-screen">
      <Container className="flex min-h-screen items-center justify-center py-12">
        <div className="grid w-full max-w-5xl gap-4 lg:grid-cols-[1.1fr,0.9fr]">
          <CardSkeleton />
          <MapSkeleton />
          <div className="lg:col-span-2">
            <ListSkeleton rows={3} />
          </div>
        </div>
      </Container>
    </main>
  );
}
