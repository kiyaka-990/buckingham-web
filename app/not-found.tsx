import { PawPrint, Home, Search } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="relative flex min-h-[80vh] flex-col items-center justify-center overflow-hidden px-6 text-center">
      <div className="aurora pointer-events-none absolute inset-0 opacity-40" />
      <div className="relative">
        <p className="font-display text-8xl font-bold text-gradient-sun sm:text-9xl">404</p>
        <PawPrint className="mx-auto -mt-4 text-sun-400" size={40} />
        <h1 className="mt-4 font-display text-2xl font-bold sm:text-3xl">This pup wandered off</h1>
        <p className="mx-auto mt-2 max-w-md text-muted">The page you&apos;re looking for can&apos;t be found. Let&apos;s get you back to the pack.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/"><Home size={16} /> Back Home</ButtonLink>
          <ButtonLink href="/shop" variant="outline"><Search size={16} /> Browse Dogs</ButtonLink>
        </div>
      </div>
    </div>
  );
}
