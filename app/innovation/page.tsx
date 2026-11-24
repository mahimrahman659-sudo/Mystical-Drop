import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon, DropletIcon, LeafIcon, SparkleIcon } from "@/components/ui/icons";
import { BRAND_NAME } from "@/lib/brand";

export const metadata: Metadata = {
  title: "Our Innovation",
  description:
    "How Mystical Drop turns nature-inspired ideas into original decorative tabletop fountains — the concept, the designs, and where the collection is heading next.",
};

const DESIGNS = [
  {
    number: "01",
    name: "Rustic Miniature Well",
    slug: "fountain-01",
    image: "/images/rustic-lifestyle.jpg",
    alt: "Rustic miniature well fountain with a hanging bucket and illuminated basin",
    body: "A familiar rustic scene — a stone-textured well with a hanging bucket on a wooden-style crossbar — reworked as a small fountain with a softly lit basin.",
  },
  {
    number: "02",
    name: "Twin-Bowl Cascade",
    slug: "fountain-02",
    image: "/images/photograph-pending.png",
    alt: "Placeholder for the Twin-Bowl Cascade Fountain photograph",
    body: "Two coconut-shell-style bowls stacked at gentle heights so water steps down through greenery and pebbles into a rounded basin.",
  },
  {
    number: "03",
    name: "Woodland Tree & Well",
    slug: "fountain-03",
    image: "/images/rustic-well.jpg",
    alt: "Woodland fountain with a tree-trunk structure beside a miniature stone-textured well",
    body: "A woodland landscape in miniature: a tree-trunk structure with spreading roots, a stone-textured well, and an elevated bowl carrying the flow.",
  },
];

export default function InnovationPage() {
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
          <span className="font-semibold text-on-surface">Our Innovation</span>
        </nav>
      </section>

      {/* Hero */}
      <section className="site-container py-space-md lg:py-space-lg">
        <div className="flex max-w-3xl flex-col gap-space-md">
          <span className="eyebrow text-primary">Our Innovation</span>
          <h1 className="font-display text-display-sm tracking-tight text-on-surface sm:text-display-md">
            Nature-Inspired Ideas, Made Real.
          </h1>
          <p className="text-body-lg leading-relaxed text-on-surface-variant">
            {BRAND_NAME} is a product development project: we set out to create
            original decorative tabletop fountains, then carried those ideas
            through design and production until they became real products. This
            page walks through the thinking behind the collection.
          </p>
        </div>
      </section>

      {/* The opportunity */}
      <section
        className="bg-surface-container-low py-space-xl"
        aria-labelledby="opportunity-heading"
      >
        <div className="site-container grid grid-cols-1 gap-gutter lg:grid-cols-12 lg:gap-space-lg">
          <div className="lg:col-span-5">
            <span className="eyebrow text-primary">The opportunity</span>
            <h2
              id="opportunity-heading"
              className="mt-1 font-display text-[2rem] leading-tight tracking-tight text-on-surface sm:text-display-sm"
            >
              Small spaces deserve nice things too.
            </h2>
          </div>
          <div className="flex flex-col gap-space-md lg:col-span-7">
            <p className="text-body-lg leading-relaxed text-on-surface">
              Most decor sized for a desk or shelf is static — a plant, a
              frame, a figurine. We noticed that people are drawn to moving
              water, but the fountains available to them are often large,
              expensive, or designed for outdoor spaces.
            </p>
            <p className="text-body-md leading-relaxed text-on-surface-variant">
              That gap became our starting point: what if a fountain could be
              small enough for a desk, decorative enough to be a conversation
              piece, and original enough to feel like a design rather than a
              commodity? Every decision in the collection comes back to that
              question.
            </p>
          </div>
        </div>
      </section>

      {/* Product concept */}
      <section className="site-container py-space-xl" aria-labelledby="concept-heading">
        <div className="grid grid-cols-1 items-center gap-gutter lg:grid-cols-12 lg:gap-space-lg">
          <div className="flex flex-col gap-space-sm lg:col-span-6">
            <span className="eyebrow text-primary">The product concept</span>
            <h2
              id="concept-heading"
              className="font-display text-[2rem] leading-tight tracking-tight text-on-surface sm:text-display-md"
            >
              Decorative tabletop fountains with original designs.
            </h2>
            <p className="text-body-md leading-relaxed text-on-surface-variant">
              Each {BRAND_NAME} product is a self-contained decorative scene
              built around flowing water: a rustic well, a twin-bowl cascade, a
              woodland landscape. The water feature is part of the sculpture —
              the two are designed together, not bolted together.
            </p>
            <ul className="flex flex-col gap-space-sm pt-space-xs">
              {[
                {
                  icon: <SparkleIcon size={18} />,
                  text: "Original designs, created by our team rather than sourced from a catalogue",
                },
                {
                  icon: <DropletIcon size={18} />,
                  text: "Flowing water as the living element of each decorative scene",
                },
                {
                  icon: <LeafIcon size={18} />,
                  text: "Natural forms — wells, trunks, bowls, roots, and pebbles — as the shared visual language",
                },
              ].map((point) => (
                <li
                  key={point.text}
                  className="flex items-start gap-3 rounded bg-surface-container-low p-3.5 text-body-sm leading-relaxed text-on-surface"
                >
                  <span className="mt-0.5 shrink-0 text-secondary">
                    {point.icon}
                  </span>
                  {point.text}
                </li>
              ))}
            </ul>
          </div>
          <div className="lg:col-span-6">
            <div className="relative h-[300px] overflow-hidden rounded-xl bg-surface-container-low shadow-soft sm:h-[400px]">
              <Image
                src="/images/rustic-wellhead.jpg"
                alt="Close view of the woodland fountain's tree trunk, elevated bowl, and stone-textured well rim"
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* The three designs */}
      <section
        className="bg-surface-container-low py-space-xl"
        aria-labelledby="designs-heading"
      >
        <div className="site-container">
          <div className="mx-auto mb-space-xl flex max-w-2xl flex-col items-center text-center">
            <span className="eyebrow mb-2 text-primary">The collection</span>
            <h2
              id="designs-heading"
              className="font-display text-[2rem] leading-tight tracking-tight text-on-surface sm:text-display-md"
            >
              Three takes on nature in miniature.
            </h2>
            <p className="mt-3 max-w-xl text-body-md leading-relaxed text-on-surface-variant">
              Each design starts from a different natural scene, which is what
              gives the collection its variety.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-gutter md:grid-cols-3">
            {DESIGNS.map((design) => (
              <article
                key={design.number}
                className="flex h-full flex-col overflow-hidden rounded-lg border border-on-surface/[0.05] bg-surface-container-lowest shadow-sm"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-surface-container">
                  <Image
                    src={design.image}
                    alt={design.alt}
                    fill
                    sizes="(min-width: 768px) 33vw, 100vw"
                    className="object-cover"
                  />
                  <span className="absolute left-3 top-3 rounded bg-surface-container-lowest/90 px-2.5 py-1 text-label-sm font-semibold uppercase tracking-widest text-on-surface backdrop-blur">
                    {design.number}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-space-md">
                  <h3 className="font-display text-headline-sm text-on-surface">
                    <Link
                      href={`/products/${design.slug}`}
                      className="transition-colors hover:text-primary"
                    >
                      {design.name}
                    </Link>
                  </h3>
                  <p className="mt-2 flex-1 text-body-sm leading-relaxed text-on-surface-variant">
                    {design.body}
                  </p>
                  <Link
                    href={`/products/${design.slug}`}
                    className="mt-4 inline-flex items-center gap-1.5 text-label-sm font-semibold uppercase tracking-wider text-primary"
                  >
                    View design
                    <ArrowRightIcon size={14} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Development approach */}
      <section
        className="site-container py-space-xl"
        aria-labelledby="development-heading"
      >
        <div className="grid grid-cols-1 gap-gutter lg:grid-cols-12 lg:gap-space-lg">
          <div className="lg:col-span-5">
            <span className="eyebrow text-primary">Product development</span>
            <h2
              id="development-heading"
              className="mt-1 font-display text-[2rem] leading-tight tracking-tight text-on-surface sm:text-display-sm"
            >
              From observation to finished piece.
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-space-sm sm:grid-cols-2 lg:col-span-7">
            {[
              {
                step: "Notice",
                body: "Observe a decorative opportunity — a small space that could use movement, character, or a nature-inspired focal point.",
              },
              {
                step: "Sketch",
                body: "Explore forms inspired by natural scenes and work out how water can move through each one at tabletop scale.",
              },
              {
                step: "Build",
                body: "Develop physical versions to test proportions, textures, and the path of the water.",
              },
              {
                step: "Refine",
                body: "Adjust the details until the piece reads clearly as a decorative object first and a fountain second.",
              },
              {
                step: "Produce",
                body: "Create the final pieces in-house as the products presented in the collection.",
              },
            ].map((stage) => (
              <div
                key={stage.step}
                className="rounded-lg border border-on-surface/[0.05] bg-surface-container-lowest p-space-md shadow-sm"
              >
                <h3 className="font-display text-headline-sm text-primary">
                  {stage.step}
                </h3>
                <p className="mt-1.5 text-body-sm leading-relaxed text-on-surface-variant">
                  {stage.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Differentiation */}
      <section
        className="bg-surface-container-low py-space-xl"
        aria-labelledby="difference-heading"
      >
        <div className="site-container grid grid-cols-1 gap-gutter lg:grid-cols-12 lg:gap-space-lg">
          <div className="lg:col-span-5">
            <span className="eyebrow text-primary">Differentiation</span>
            <h2
              id="difference-heading"
              className="mt-1 font-display text-[2rem] leading-tight tracking-tight text-on-surface sm:text-display-sm"
            >
              What makes the three designs distinct.
            </h2>
            <p className="mt-3 text-body-md leading-relaxed text-on-surface-variant">
              The products share a category and a design philosophy, but each
              one offers a different scene, silhouette, and flow.
            </p>
          </div>
          <div className="flex flex-col gap-space-sm lg:col-span-7">
            {[
              {
                name: "Rustic Miniature Well",
                trait: "Storybook detail",
                body: "The hanging bucket and crossbar give it a narrative focal point, with illumination adding a soft glow.",
              },
              {
                name: "Twin-Bowl Cascade",
                trait: "Layered movement",
                body: "Two bowls create a visible two-step cascade, framed by greenery and pebbles.",
              },
              {
                name: "Woodland Tree & Well",
                trait: "Sculptural scene",
                body: "The tallest composition — trunk, roots, well, and elevated bowl read as a single landscape.",
              },
            ].map((row) => (
              <div
                key={row.name}
                className="grid grid-cols-1 gap-2 rounded-lg bg-surface-container-lowest p-space-md shadow-sm sm:grid-cols-12 sm:gap-4"
              >
                <div className="sm:col-span-4">
                  <p className="font-display text-headline-sm text-on-surface">
                    {row.name}
                  </p>
                  <p className="mt-0.5 text-label-sm font-semibold uppercase tracking-wider text-secondary">
                    {row.trait}
                  </p>
                </div>
                <p className="text-body-sm leading-relaxed text-on-surface-variant sm:col-span-8">
                  {row.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Target customers + value proposition */}
      <section className="site-container py-space-xl" aria-labelledby="customers-heading">
        <div className="grid grid-cols-1 gap-gutter lg:grid-cols-12 lg:gap-space-lg">
          <div className="lg:col-span-5">
            <span className="eyebrow text-primary">Who it&apos;s for</span>
            <h2
              id="customers-heading"
              className="mt-1 font-display text-[2rem] leading-tight tracking-tight text-on-surface sm:text-display-sm"
            >
              People who like distinctive little things.
            </h2>
            <p className="mt-3 text-body-sm italic leading-relaxed text-on-surface-variant">
              Our thinking on the audience — a working hypothesis, not market
              research.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-space-sm sm:grid-cols-2 lg:col-span-7">
            {[
              {
                title: "Desk & shelf decorators",
                body: "People who personalize their workspace or reading corner with objects that have a story.",
              },
              {
                title: "Home interior enthusiasts",
                body: "Anyone looking for a small piece that adds movement and a nature-inspired silhouette to a room.",
              },
              {
                title: "Gift shoppers",
                body: "Buyers searching for a present that feels thoughtful, unusual, and ready to display.",
              },
              {
                title: "Water & nature lovers",
                body: "People drawn to the sound and sight of flowing water but without space for a large fountain.",
              },
            ].map((group) => (
              <div
                key={group.title}
                className="rounded-lg border border-on-surface/[0.05] bg-surface-container-lowest p-space-md shadow-sm"
              >
                <h3 className="font-display text-headline-sm text-on-surface">
                  {group.title}
                </h3>
                <p className="mt-1.5 text-body-sm leading-relaxed text-on-surface-variant">
                  {group.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Value proposition + future */}
      <section
        className="bg-surface-container-low py-space-xl"
        aria-labelledby="value-heading"
      >
        <div className="site-container grid grid-cols-1 gap-gutter lg:grid-cols-12 lg:gap-space-lg">
          <div className="lg:col-span-6">
            <span className="eyebrow text-primary">Value proposition</span>
            <h2
              id="value-heading"
              className="mt-1 font-display text-[2rem] leading-tight tracking-tight text-on-surface sm:text-display-md"
            >
              Why choose a {BRAND_NAME} fountain?
            </h2>
            <ul className="mt-4 flex flex-col gap-space-sm">
              {[
                "You get an original design — a piece developed for this collection, not a generic import.",
                "The fountain doubles as a decorative scene, so it earns its place even as a still object.",
                "Its tabletop size fits the spaces where people actually spend their day: desks, shelves, and side tables.",
                "Buying from us means supporting a small team making their own products.",
              ].map((point) => (
                <li
                  key={point}
                  className="flex items-start gap-3 text-body-md leading-relaxed text-on-surface"
                >
                  <span
                    aria-hidden="true"
                    className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-secondary"
                  />
                  {point}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-on-surface/[0.05] bg-surface-container-lowest p-space-md shadow-sm lg:col-span-6 lg:p-space-lg">
            <span className="eyebrow text-primary">Future development</span>
            <h2 className="mt-1 font-display text-headline-md tracking-tight text-on-surface">
              Where the collection could go next.
            </h2>
            <p className="mt-2 text-body-sm font-semibold uppercase tracking-wider text-on-surface-variant">
              Planned directions — not yet built
            </p>
            <ul className="mt-4 flex flex-col gap-space-sm text-body-md leading-relaxed text-on-surface-variant">
              {[
                "Additional designs exploring new natural scenes and forms.",
                "Confirmed specifications, care guides, and photography for the current range.",
                "Possible variations in scale or detail once the first collection is validated.",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span
                    aria-hidden="true"
                    className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary"
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Closing */}
      <section className="site-container py-space-xl">
        <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
          <h2 className="font-display text-[2rem] leading-tight tracking-tight text-on-surface sm:text-display-md">
            See the designs up close.
          </h2>
          <p className="mt-3 max-w-xl text-body-md leading-relaxed text-on-surface-variant">
            Visit the collection to look through each original fountain in
            detail.
          </p>
          <Link href="/#collection" className="btn btn-primary mt-space-md px-6">
            Explore the Collection
            <ArrowRightIcon size={17} />
          </Link>
        </div>
      </section>
    </div>
  );
}
