import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon, LeafIcon, SparkleIcon, WavesIcon } from "@/components/ui/icons";
import { BRAND_NAME } from "@/lib/brand";

export const metadata: Metadata = {
  title: "Our Story",
  description:
    "Mystical Drop began with a simple idea: bring the beauty of flowing water into everyday spaces through original tabletop fountain designs made in-house.",
};

const SHOW_TEAM_SECTION = false;

export default function AboutPage() {
  return (
    <div>
      <section className="site-container pb-space-xs pt-space-md">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-label-md uppercase tracking-wider text-on-surface-variant">
          <Link href="/" className="transition-colors hover:text-primary">
            Home
          </Link>
          <span aria-hidden="true" className="opacity-40">
            /
          </span>
          <span className="font-semibold text-on-surface">Our Story</span>
        </nav>
      </section>

      {/* Hero */}
      <section className="site-container py-space-md lg:py-space-lg">
        <div className="grid grid-cols-1 items-center gap-gutter lg:grid-cols-12 lg:gap-space-lg">
          <div className="flex flex-col gap-space-md lg:col-span-7">
            <span className="eyebrow text-primary">Our Story</span>
            <h1 className="font-display text-display-sm tracking-tight text-on-surface sm:text-display-md">
              Small Creations, Inspired by Nature.
            </h1>
            <p className="max-w-2xl text-body-lg leading-relaxed text-on-surface-variant">
              {BRAND_NAME} began with a simple idea: bring the beauty of flowing
              water into everyday spaces through creative tabletop fountain
              designs.
            </p>
            <div className="flex flex-wrap gap-2.5 pt-space-xs">
              <Link href="/#collection" className="btn btn-primary px-5">
                Explore Our Fountains
              </Link>
              <Link href="/innovation" className="btn btn-outline px-5">
                Our Innovation
              </Link>
            </div>
          </div>
          <div className="lg:col-span-5">
            <div className="relative h-[300px] overflow-hidden rounded-xl bg-surface-container-low shadow-soft sm:h-[380px]">
              <Image
                src="/images/rustic-well.jpg"
                alt="Woodland-inspired fountain with a tree-trunk structure and miniature stone-textured well"
                fill
                priority
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Narrative */}
      <section
        className="bg-surface-container-low py-space-xl"
        aria-labelledby="story-heading"
      >
        <div className="site-container grid grid-cols-1 gap-gutter lg:grid-cols-12 lg:gap-space-lg">
          <div className="lg:col-span-4">
            <h2
              id="story-heading"
              className="font-display text-[2rem] leading-tight tracking-tight text-on-surface sm:text-display-sm"
            >
              How it started
            </h2>
          </div>
          <div className="flex flex-col gap-space-md lg:col-span-8">
            <p className="text-body-lg leading-relaxed text-on-surface">
              We make our own decorative water fountains, drawing inspiration
              from natural textures, rustic forms, and the movement of water.
            </p>
            <p className="text-body-md leading-relaxed text-on-surface-variant">
              From miniature stone-inspired wells to cascading bowls and
              woodland-inspired structures, each design reflects our interest in
              making ordinary spaces feel a little more special.
            </p>
            <p className="text-body-md leading-relaxed text-on-surface-variant">
              We believe a decorative piece doesn&apos;t need to be large to
              make an impression. Sometimes, a small fountain on a desk, shelf,
              or table is enough to bring a new sense of character to a room.
            </p>
          </div>
        </div>
      </section>

      {/* What we do */}
      <section className="site-container py-space-xl" aria-labelledby="approach-heading">
        <div className="mx-auto mb-space-xl flex max-w-2xl flex-col items-center text-center">
          <span className="eyebrow mb-2 text-primary">What we do</span>
          <h2
            id="approach-heading"
            className="font-display text-[2rem] leading-tight tracking-tight text-on-surface sm:text-display-md"
          >
            Our own designs, made by our own team.
          </h2>
          <p className="mt-3 max-w-xl text-body-md leading-relaxed text-on-surface-variant">
            {BRAND_NAME} manufactures its own original decorative fountains. We
            handle the product concept, design development, and production
            ourselves — from the first idea to the finished piece.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-gutter md:grid-cols-3">
          {[
            {
              icon: <SparkleIcon size={24} />,
              tone: "text-primary bg-surface-container",
              title: "Original concepts",
              body: "Every fountain in the collection starts as our own design idea, developed for a tabletop decorative format.",
            },
            {
              icon: <LeafIcon size={24} />,
              tone: "text-secondary bg-secondary-container",
              title: "Nature-inspired forms",
              body: "Wells, tree trunks, bowls, roots, and pebbles — the visual language of the natural world, in miniature.",
            },
            {
              icon: <WavesIcon size={24} />,
              tone: "text-tertiary bg-tertiary-container",
              title: "Hands-on production",
              body: "Our team builds the products in-house, keeping the finishing decisions close to the people who designed them.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="flex flex-col items-start rounded-lg border border-on-surface/[0.05] bg-surface-container-lowest p-space-md shadow-sm"
            >
              <div
                className={`mb-space-sm flex h-12 w-12 items-center justify-center rounded ${item.tone}`}
              >
                {item.icon}
              </div>
              <h3 className="mb-2 font-display text-headline-sm text-on-surface">
                {item.title}
              </h3>
              <p className="text-body-sm leading-relaxed text-on-surface-variant">
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Team section — draft, unpublished until verified team information is supplied */}
      {SHOW_TEAM_SECTION ? (
        <section
          className="bg-surface-container-low py-space-xl"
          aria-labelledby="team-heading"
        >
          <div className="site-container">
            <span className="eyebrow text-primary">The Team</span>
            <h2
              id="team-heading"
              className="mt-1 font-display text-[2rem] leading-tight tracking-tight text-on-surface sm:text-display-md"
            >
              The people behind {BRAND_NAME}
            </h2>
            {/* Add verified team member cards here once approved by the owner. */}
          </div>
        </section>
      ) : null}

      {/* Closing */}
      <section className="site-container py-space-xl" aria-labelledby="next-heading">
        <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
          <h2
            id="next-heading"
            className="font-display text-[2rem] leading-tight tracking-tight text-on-surface sm:text-display-md"
          >
            See what we have made.
          </h2>
          <p className="mt-3 max-w-xl text-body-md leading-relaxed text-on-surface-variant">
            Browse the collection, or read how we approach product development
            for the {BRAND_NAME} range.
          </p>
          <div className="mt-space-md flex flex-wrap justify-center gap-2.5">
            <Link href="/#collection" className="btn btn-primary px-5">
              Explore the Collection
              <ArrowRightIcon size={16} />
            </Link>
            <Link href="/innovation" className="btn btn-outline px-5">
              Our Innovation
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
