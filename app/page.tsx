import Image from "next/image";
import Link from "next/link";
import { ProductCard } from "@/components/products/ProductCard";
import {
  ArrowRightIcon,
  DropletIcon,
  LeafIcon,
  SparkleIcon,
  WavesIcon,
} from "@/components/ui/icons";
import { BRAND_NAME } from "@/lib/brand";
import { getActiveProducts } from "@/lib/db/products";
import { getSiteBanner } from "@/lib/db/site-settings";

/**
 * Draft sections — keep unpublished until the owner verifies the underlying
 * evidence (development records, prototype photos, demonstration videos).
 * Flip to `true` once the content is confirmed.
 */
const SHOW_DEVELOPMENT_JOURNEY = false;
const SHOW_DEMONSTRATION = false;

const DEVELOPMENT_STAGES = [
  {
    step: "01",
    title: "Identifying an opportunity",
    body: "Noticing how a small decorative water feature can change the feel of a desk, shelf, or quiet corner.",
  },
  {
    step: "02",
    title: "Exploring design concepts",
    body: "Sketching nature-inspired forms — rustic wells, cascading bowls, and woodland scenes — in miniature tabletop scale.",
  },
  {
    step: "03",
    title: "Developing prototypes",
    body: "Building early physical versions to study proportions, water paths, and how each detail reads up close.",
  },
  {
    step: "04",
    title: "Refining the designs",
    body: "Adjusting shapes, textures, and flow so each piece feels balanced, decorative, and true to its inspiration.",
  },
  {
    step: "05",
    title: "Creating the final products",
    body: "Producing the three original fountains in our collection as they are presented today.",
  },
];

export default async function HomePage() {
  const [products, banner] = await Promise.all([
    getActiveProducts(),
    getSiteBanner(),
  ]);

  return (
    <>
      {/* Section 1 — Hero */}
      <section className="site-container pb-space-xl pt-space-md lg:pt-space-lg">
        <div className="grid grid-cols-1 items-center gap-gutter lg:grid-cols-12 lg:gap-space-lg">
          <div className="rise-in flex flex-col gap-space-md lg:col-span-6 lg:pr-space-md">
            <div className="inline-flex items-center gap-2">
              <span aria-hidden="true" className="h-2 w-2 rounded-full bg-secondary" />
              <p className="eyebrow text-secondary">
                {BRAND_NAME} • Original Tabletop Fountains
              </p>
            </div>
            <h1 className="max-w-xl font-display text-display-sm tracking-tight text-on-surface sm:text-display-md lg:text-display-lg lg:leading-[1.08]">
              Bring Nature&apos;s Beauty Into Your Space.
            </h1>
            <p className="max-w-xl text-body-lg leading-relaxed text-on-surface-variant">
              Discover original tabletop water fountains made by {BRAND_NAME}.
              Inspired by natural forms and flowing water, our designs bring a
              distinctive decorative touch to your home, desk, or favorite
              corner.
            </p>
            <div className="flex flex-wrap items-center gap-space-sm pt-space-xs">
              <Link href="#collection" className="btn btn-primary px-6">
                Explore Our Fountains
              </Link>
              <Link href="/about" className="btn btn-outline px-6">
                Our Story
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-space-sm pt-space-md sm:grid-cols-3">
              <div className="flex items-center gap-2.5 rounded bg-surface-container-low p-3">
                <span className="text-primary">
                  <SparkleIcon size={19} />
                </span>
                <span className="text-label-sm font-semibold uppercase tracking-wider text-on-surface">
                  Original Designs
                </span>
              </div>
              <div className="flex items-center gap-2.5 rounded bg-surface-container-low p-3">
                <span className="text-secondary">
                  <LeafIcon size={19} />
                </span>
                <span className="text-label-sm font-semibold uppercase tracking-wider text-on-surface">
                  Made In-House
                </span>
              </div>
              <div className="flex items-center gap-2.5 rounded bg-surface-container-low p-3">
                <span className="text-tertiary">
                  <WavesIcon size={19} />
                </span>
                <span className="text-label-sm font-semibold uppercase tracking-wider text-on-surface">
                  Nature-Inspired
                </span>
              </div>
            </div>
          </div>

          <div className="rise-in rise-in-delay-1 mt-space-md lg:col-span-6 lg:mt-0">
            <div className="group relative h-[360px] overflow-hidden rounded-xl bg-surface-container-low shadow-soft sm:h-[460px] lg:h-[560px]">
              <Image
                src={banner.imageSrc}
                alt={banner.imageAlt}
                fill
                priority
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-inverse-surface/65 via-transparent to-transparent"
              />
              <span className="absolute right-4 top-4 rounded bg-surface-container-lowest/90 px-3 py-1.5 text-label-sm uppercase tracking-widest text-on-surface backdrop-blur">
                {products.length} Original Designs
              </span>
              <div className="absolute bottom-4 left-4 right-4 flex flex-col gap-3 rounded bg-surface-container-lowest/95 p-3.5 shadow-sm backdrop-blur sm:bottom-6 sm:left-6 sm:right-6 sm:flex-row sm:items-center sm:justify-between sm:p-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary-container text-secondary">
                    <DropletIcon size={20} />
                  </span>
                  <div className="flex min-w-0 flex-col">
                    <span className="text-label-sm uppercase tracking-wider text-on-surface-variant">
                      Decorative tabletop fountains
                    </span>
                    <span className="font-sans text-label-lg font-medium text-on-surface">
                      Designed &amp; made in-house
                    </span>
                  </div>
                </div>
                <Link
                  href="/#collection"
                  className="hidden items-center gap-1.5 rounded bg-surface-container px-3 py-1.5 text-label-sm font-semibold uppercase tracking-widest text-secondary transition-colors hover:bg-secondary-container xs:flex"
                >
                  View the collection
                  <ArrowRightIcon size={14} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2 — Original Collection */}
      <section
        id="collection"
        className="scroll-mt-28 bg-surface-container-low py-space-xl"
      >
        <div className="site-container">
          <div className="mx-auto mb-space-xl flex max-w-2xl flex-col items-center text-center">
            <span className="eyebrow mb-2 text-primary">The Collection</span>
            <h2 className="font-display text-[2rem] leading-tight tracking-tight text-on-surface sm:text-display-md">
              Little Fountains. Beautiful Details.
            </h2>
            <p className="mt-3 max-w-lg text-body-md leading-relaxed text-on-surface-variant">
              From rustic miniature wells to cascading nature-inspired designs,
              explore our collection of original decorative tabletop fountains.
            </p>
            <p className="mt-2 max-w-lg text-label-sm leading-relaxed text-on-surface-variant">
              Product names shown are working drafts, and prices will be
              announced when confirmed.
            </p>
          </div>
          {products.length === 0 ? (
            <div className="mx-auto max-w-xl rounded-xl border border-on-surface/[0.05] bg-surface-container-lowest p-8 text-center shadow-sm">
              <h3 className="font-display text-headline-sm text-on-surface">
                The collection is being prepared
              </h3>
              <p className="mt-2 text-body-sm text-on-surface-variant">
                Our original fountains will appear here as soon as they are
                published.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-gutter md:grid-cols-2 xl:grid-cols-3">
              {products.map((product) => (
                <ProductCard key={product.slug} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Section 3 — What Makes Mystical Drop Different */}
      <section
        id="difference"
        className="site-container scroll-mt-28 py-space-xl"
        aria-labelledby="difference-heading"
      >
        <div className="mx-auto mb-space-xl flex max-w-2xl flex-col items-center text-center">
          <span className="eyebrow mb-2 text-primary">Why {BRAND_NAME}</span>
          <h2
            id="difference-heading"
            className="font-display text-[2rem] leading-tight tracking-tight text-on-surface sm:text-display-md"
          >
            Made by Us. Inspired by Nature.
          </h2>
          <p className="mt-3 max-w-xl text-body-md leading-relaxed text-on-surface-variant">
            We manufacture our own original fountain designs — every piece in the
            collection starts with our own concept and ends on our own
            workbench.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-gutter sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: <SparkleIcon size={24} />,
              tone: "text-primary bg-surface-container",
              title: "Original product concepts",
              body: "Each design is our own idea — not a rebranded import or a copy of an existing product.",
            },
            {
              icon: <LeafIcon size={24} />,
              tone: "text-secondary bg-secondary-container",
              title: "Nature-inspired design",
              body: "Wells, tree trunks, bowls, roots, and pebbles — natural forms translated into decorative tabletop pieces.",
            },
            {
              icon: <DropletIcon size={24} />,
              tone: "text-tertiary bg-tertiary-container",
              title: "Decorative tabletop format",
              body: "Compact by design: made to sit on desks, shelves, and side tables without dominating the room.",
            },
            {
              icon: <WavesIcon size={24} />,
              tone: "text-primary bg-surface-container",
              title: "In-house production",
              body: "We develop and make the products ourselves, so we can stand behind every design we present.",
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

      {/* Section 4 — The Product Concept */}
      <section
        id="concept"
        className="scroll-mt-28 bg-surface-container-low py-space-xl"
        aria-labelledby="concept-heading"
      >
        <div className="site-container grid grid-cols-1 items-center gap-gutter lg:grid-cols-12 lg:gap-space-lg">
          <div className="lg:col-span-6">
            <div className="relative h-[300px] overflow-hidden rounded-lg bg-surface-container shadow-sm sm:h-[400px] lg:h-[440px]">
              <Image
                src="/images/rustic-lifestyle.jpg"
                alt="A rustic miniature well fountain with a hanging bucket and softly lit water basin on display"
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
          </div>
          <div className="flex flex-col gap-space-sm lg:col-span-6 lg:pl-space-md">
            <span className="eyebrow text-primary">The Concept</span>
            <h2
              id="concept-heading"
              className="font-display text-[2rem] leading-tight tracking-tight text-on-surface sm:text-display-md"
            >
              Nature-Inspired Details for Everyday Spaces.
            </h2>
            <p className="text-body-lg leading-relaxed text-on-surface-variant">
              A decorative piece doesn&apos;t need to be large to make an
              impression. Our fountains are built as small conversation pieces —
              the kind of object that gives a room a focal point and a sense of
              character.
            </p>
            <p className="text-body-md leading-relaxed text-on-surface-variant">
              Placed on a desk, a shelf, a side table, or among home interiors,
              each design adds the movement of water and a nature-inspired
              silhouette to the space. They also make a thoughtful gift for
              someone who appreciates distinctive decor.
            </p>
            <ul className="grid grid-cols-2 gap-space-sm pt-space-xs sm:grid-cols-3">
              {["Desks", "Shelves", "Side tables", "Home interiors", "Gift displays"].map(
                (place) => (
                  <li
                    key={place}
                    className="flex items-center gap-2 rounded bg-surface-container-lowest px-3 py-2.5 text-label-sm font-semibold uppercase tracking-wider text-on-surface"
                  >
                    <span
                      aria-hidden="true"
                      className="h-1.5 w-1.5 rounded-full bg-secondary"
                    />
                    {place}
                  </li>
                ),
              )}
            </ul>
          </div>
        </div>
      </section>

      {/* Section 5 — Our Development Journey (draft — unpublished until verified) */}
      {SHOW_DEVELOPMENT_JOURNEY ? (
        <section
          id="journey"
          className="site-container scroll-mt-28 py-space-xl"
          aria-labelledby="journey-heading"
        >
          <div className="mx-auto mb-space-xl flex max-w-2xl flex-col items-center text-center">
            <span className="eyebrow mb-2 text-primary">Development Journey</span>
            <h2
              id="journey-heading"
              className="font-display text-[2rem] leading-tight tracking-tight text-on-surface sm:text-display-md"
            >
              From an Idea to Something Real.
            </h2>
            <p className="mt-3 max-w-xl text-body-md leading-relaxed text-on-surface-variant">
              Every product in the collection followed a path from first
              observation to finished piece. These are the stages of that
              journey.
            </p>
          </div>
          <ol className="grid grid-cols-1 gap-gutter sm:grid-cols-2 lg:grid-cols-5">
            {DEVELOPMENT_STAGES.map((stage) => (
              <li
                key={stage.step}
                className="flex flex-col rounded-lg border border-on-surface/[0.05] bg-surface-container-lowest p-space-md shadow-sm"
              >
                <span className="font-display text-headline-md text-primary">
                  {stage.step}
                </span>
                <h3 className="mt-1 font-display text-headline-sm text-on-surface">
                  {stage.title}
                </h3>
                <p className="mt-2 text-body-sm leading-relaxed text-on-surface-variant">
                  {stage.body}
                </p>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      {/* Section 6 — Craftsmanship */}
      <section
        id="craftsmanship"
        className={`scroll-mt-28 py-space-xl ${
          SHOW_DEVELOPMENT_JOURNEY ? "bg-surface-container-low" : ""
        }`}
        aria-labelledby="craftsmanship-heading"
      >
        <div className="site-container grid grid-cols-1 items-center gap-gutter lg:grid-cols-12 lg:gap-space-lg">
          <div className="order-1 flex flex-col gap-space-sm lg:order-2 lg:col-span-6 lg:pl-space-md">
            <span className="eyebrow text-primary">Craftsmanship</span>
            <h2
              id="craftsmanship-heading"
              className="font-display text-[2rem] leading-tight tracking-tight text-on-surface sm:text-display-md"
            >
              Thoughtfully Designed. Made by Our Team.
            </h2>
            <p className="text-body-lg leading-relaxed text-on-surface-variant">
              {BRAND_NAME} is a hands-on project. Our team develops each
              fountain concept, works through its shapes and details, and
              produces the final pieces ourselves.
            </p>
            <p className="text-body-md leading-relaxed text-on-surface-variant">
              Because we make what we design, the small decisions — how a
              texture reads, where the water lands, how a scene is composed —
              are all made with the finished piece in mind. That is what we mean
              by thoughtfully designed.
            </p>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-4 pt-space-xs">
              <div className="flex flex-col">
                <span className="font-display text-headline-md font-semibold text-on-surface">
                  {products.length}
                </span>
                <span className="text-label-sm uppercase tracking-wider text-on-surface-variant">
                  Original designs
                </span>
              </div>
              <div aria-hidden="true" className="hidden h-10 w-px bg-outline/20 sm:block" />
              <div className="flex flex-col">
                <span className="font-display text-headline-md font-semibold text-on-surface">
                  In-house
                </span>
                <span className="text-label-sm uppercase tracking-wider text-on-surface-variant">
                  Concept to product
                </span>
              </div>
            </div>
          </div>
          <div className="order-2 lg:order-1 lg:col-span-6">
            <div className="relative h-[300px] overflow-hidden rounded-lg bg-surface-container shadow-sm sm:h-[400px] lg:h-[440px]">
              <Image
                src="/images/rustic-wellhead.jpg"
                alt="Close view of the woodland fountain showing the tree trunk, elevated bowl, and stone-textured well rim"
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
              <div className="absolute bottom-4 left-4 flex max-w-[calc(100%-2rem)] items-center gap-3 rounded bg-surface-container-lowest/90 p-3 backdrop-blur">
                <span className="text-primary">
                  <SparkleIcon size={21} />
                </span>
                <p className="text-label-sm font-semibold uppercase leading-4 tracking-wider text-on-surface">
                  Original designs, developed in-house
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 7 — Product Demonstration (draft — unpublished until a real video exists) */}
      {SHOW_DEMONSTRATION ? (
        <section
          id="demonstration"
          className="scroll-mt-28 py-space-xl"
          aria-labelledby="demonstration-heading"
        >
          <div className="site-container flex flex-col items-center text-center">
            <span className="eyebrow mb-2 text-primary">See It Flow</span>
            <h2
              id="demonstration-heading"
              className="font-display text-[2rem] leading-tight tracking-tight text-on-surface sm:text-display-md"
            >
              Watch the Water Move.
            </h2>
            <p className="mt-3 max-w-xl text-body-md leading-relaxed text-on-surface-variant">
              Short demonstration videos of each fountain will appear here once
              they are recorded.
            </p>
            {/* Embed the real product video here when supplied. */}
          </div>
        </section>
      ) : null}

      {/* Section 8 — Closing CTA */}
      <section
        id="discover"
        className="scroll-mt-28 bg-surface-container-low py-space-xl"
        aria-labelledby="discover-heading"
      >
        <div className="site-container mx-auto flex max-w-3xl flex-col items-center text-center">
          <span className="eyebrow mb-2 text-primary">Explore</span>
          <h2
            id="discover-heading"
            className="font-display text-[2rem] leading-tight tracking-tight text-on-surface sm:text-display-md"
          >
            Discover the Details.
          </h2>
          <p className="mt-3 max-w-xl text-body-md leading-relaxed text-on-surface-variant">
            Explore our original fountain designs and see how small decorative
            pieces can bring character to everyday spaces.
          </p>
          <Link href="/#collection" className="btn btn-primary mt-space-md px-6">
            Explore the Collection
            <ArrowRightIcon size={17} />
          </Link>
        </div>
      </section>
    </>
  );
}
