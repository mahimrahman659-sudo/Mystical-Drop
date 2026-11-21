import Link from "next/link";
import { ArrowRightIcon, DropletIcon } from "@/components/ui/icons";

export default function NotFound() {
  return (
    <section className="site-container py-space-xl">
      <div className="mx-auto flex max-w-xl flex-col items-center rounded-xl border border-on-surface/[0.05] bg-surface-container-lowest px-space-md py-space-xl text-center shadow-sm">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-container text-secondary">
          <DropletIcon size={30} />
        </div>
        <p className="mt-4 text-label-sm uppercase tracking-widest text-primary">
          404 • Still Water
        </p>
        <h1 className="mt-1 font-display text-headline-lg text-on-surface">
          This path has run dry.
        </h1>
        <p className="mt-2 max-w-md text-body-md leading-relaxed text-on-surface-variant">
          The page you were looking for does not exist. Return to the collection to
          explore the three handcrafted TerraNova fountains.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
          <Link href="/" className="btn btn-primary">
            Return Home
            <ArrowRightIcon size={17} />
          </Link>
          <Link href="/#collection" className="btn btn-outline">
            The 3 Fountains
          </Link>
        </div>
      </div>
    </section>
  );
}
