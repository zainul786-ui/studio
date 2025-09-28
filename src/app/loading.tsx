import { Skeleton } from "@/components/ui/skeleton";
import { Header } from "@/components/header";

export default function Loading() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto p-4 md:p-8">
        <div className="w-full">
          <div className="flex justify-center">
            <Skeleton className="h-10 w-full max-w-[400px]" />
          </div>
          <div className="mt-6">
            <Skeleton className="h-[70vh] w-full rounded-lg" />
          </div>
        </div>
      </main>
    </div>
  );
}
