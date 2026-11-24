export type ProductGalleryImage = {
  src: string;
  alt: string;
  label: string;
  caption: string;
};

export type ProductSpec = {
  label: string;
  value: string;
};

export type ProductCare = {
  story: string;
  storyPoints: string[];
  setup: string;
  water: string;
  rinse: string;
  note: string;
};

export type Product = {
  slug: string;
  name: string;
  shortName: string;
  /** Final price in whole BDT. `null` means the price is not confirmed yet —
   * unpriced products are never purchasable and never show a price. */
  price: number | null;
  catalogNumber: string;
  provenance: string;
  flowLabel: string;
  flowDescription: string;
  collectionLine: string;
  nativeName: string;
  description: string;
  longDescription: string;
  features: string[];
  image: {
    src: string;
    alt: string;
    position?: string;
  };
  cartImage: string;
  gallery: ProductGalleryImage[];
  specs: ProductSpec[];
  included: string[];
  care?: ProductCare;
};

/**
 * Products whose customer-facing name is a working draft pending owner
 * confirmation. Render a "draft name" badge for these until the owner
 * approves final names and this set is cleared.
 */
export const DRAFT_NAME_SLUGS: ReadonlySet<string> = new Set([
  "fountain-01",
  "fountain-02",
  "fountain-03",
]);

export const products: Product[] = [
  {
    slug: "fountain-01",
    name: "Rustic Miniature Well Fountain",
    shortName: "Miniature Well",
    price: null,
    catalogNumber: "01",
    provenance: "Original Design",
    flowLabel: "Gentle Pour",
    flowDescription: "Gentle pour into a miniature well basin",
    collectionLine: "Original Well Design",
    nativeName: "",
    description:
      "A rustic miniature well with a stone-textured structure, a hanging bucket on a wooden-style crossbar, and soft blue illumination beneath the pouring water.",
    longDescription:
      "Inspired by rustic village wells, this miniature fountain pairs a stone-textured structure with a wooden-style crossbar and a small hanging bucket. Water gathers in the softly lit basin below, where a touch of blue illumination brings the movement of the flow to life. Built as a decorative tabletop piece, it gives a desk, shelf, or side table a quiet focal point with real character.",
    features: [
      "Stone-textured miniature well structure",
      "Hanging bucket on a wooden-style crossbar",
      "Soft blue illumination in the water basin",
    ],
    image: {
      src: "/images/rustic-lifestyle.jpg",
      alt: "Rustic miniature well fountain with a stone-textured base, hanging bucket on a wooden crossbar, and softly lit water basin",
    },
    cartImage: "/images/rustic-lifestyle.jpg",
    gallery: [
      {
        src: "/images/rustic-lifestyle.jpg",
        alt: "Rustic miniature well fountain pouring water past a hanging bucket into an illuminated basin",
        label: "View 01",
        caption: "Well form with hanging bucket",
      },
    ],
    specs: [
      {
        label: "Specifications",
        value: "Dimensions, materials, and pump details to be confirmed",
      },
    ],
    included: [],
    care: {
      story:
        "The design borrows the quiet charm of a village well: a stone-textured structure, a wooden-style crossbar, and a small bucket poised above the water. Blue illumination in the basin highlights the falling water, turning a familiar rustic scene into a small decorative centerpiece.",
      storyPoints: [
        "Rustic well form rendered in miniature tabletop scale",
        "Hanging bucket and crossbar create a recognizable focal detail",
        "Illuminated basin adds a gentle glow to the water",
      ],
      setup: "",
      water: "",
      rinse: "",
      note: "",
    },
  },
  {
    slug: "fountain-02",
    name: "Twin-Bowl Cascade Fountain",
    shortName: "Twin-Bowl Cascade",
    price: null,
    catalogNumber: "02",
    provenance: "Original Design",
    flowLabel: "Cascade",
    flowDescription: "Two-level cascade into a rounded basin",
    collectionLine: "Original Cascade Design",
    nativeName: "",
    description:
      "A cascading tabletop fountain with two coconut-shell-style bowls, decorative greenery, smooth pebbles, and a rounded basin catching the flow.",
    longDescription:
      "Two coconut-shell-style bowls sit at different heights so water can travel from one to the other before settling into the rounded basin below. Decorative greenery and smooth pebbles complete the arrangement, giving the piece a lively, natural look. The result is a compact cascade designed to bring movement and detail to everyday spaces.",
    features: [
      "Two coconut-shell-style cascade bowls",
      "Decorative greenery and smooth pebbles",
      "Rounded basin with a gentle two-level flow",
    ],
    image: {
      src: "/images/photograph-pending.png",
      alt: "Original photograph of the Twin-Bowl Cascade Fountain coming soon",
    },
    cartImage: "/images/photograph-pending.png",
    gallery: [
      {
        src: "/images/photograph-pending.png",
        alt: "Placeholder showing that the original photograph of the Twin-Bowl Cascade Fountain is coming soon",
        label: "View 01",
        caption: "Original photograph coming soon",
      },
    ],
    specs: [
      {
        label: "Specifications",
        value: "Dimensions, materials, and pump details to be confirmed",
      },
    ],
    included: [],
    care: {
      story:
        "The cascade concept starts with two bowl forms stacked at gentle heights, echoing the way water steps down through a natural stream. Greenery and pebbles soften the edges, while the rounded basin gathers the flow into a single, calm pool.",
      storyPoints: [
        "Twin bowls create a two-step cascade path",
        "Greenery and pebbles frame the flowing water",
        "Rounded basin anchors the composition",
      ],
      setup: "",
      water: "",
      rinse: "",
      note: "",
    },
  },
  {
    slug: "fountain-03",
    name: "Woodland Tree & Well Fountain",
    shortName: "Woodland Tree & Well",
    price: null,
    catalogNumber: "03",
    provenance: "Original Design",
    flowLabel: "Woodland Flow",
    flowDescription: "Woodland-inspired flow into a stone well",
    collectionLine: "Original Woodland Design",
    nativeName: "",
    description:
      "A woodland-inspired fountain with a tree-trunk structure, a miniature stone-textured well, an elevated bowl, and decorative root details.",
    longDescription:
      "A tree-trunk structure rises beside a miniature stone-textured well, with exposed roots grounding the scene and an elevated bowl carrying the flow overhead. The composition draws on woodland imagery — bark, stone, and roots — rearranged into a compact decorative fountain. It is a detail-rich piece meant to reward a closer look on a desk, shelf, or side table.",
    features: [
      "Tree-trunk structure with decorative root details",
      "Miniature stone-textured well",
      "Elevated bowl above the woodland scene",
    ],
    image: {
      src: "/images/rustic-well.jpg",
      alt: "Woodland fountain with a tree-trunk structure and roots beside a miniature stone-textured well with elevated bowls",
    },
    cartImage: "/images/rustic-well.jpg",
    gallery: [
      {
        src: "/images/rustic-well.jpg",
        alt: "Front view of the woodland fountain showing the tree trunk, roots, and stone-textured well",
        label: "View 01",
        caption: "Tree and well composition",
      },
      {
        src: "/images/rustic-wellhead.jpg",
        alt: "Close view of the woodland fountain's tree trunk, elevated bowl, and well rim",
        label: "View 02",
        caption: "Trunk and bowl detail",
      },
    ],
    specs: [
      {
        label: "Specifications",
        value: "Dimensions, materials, and pump details to be confirmed",
      },
    ],
    included: [],
    care: {
      story:
        "The woodland design brings together the three textures of a forest floor scene: bark-like trunk surfaces, stone-textured masonry, and spreading roots. An elevated bowl and a miniature well give the water its path, so the piece reads as a small landscape rather than a single object.",
      storyPoints: [
        "Tree-trunk column with root details anchors the scene",
        "Miniature stone well forms the basin",
        "Elevated bowl adds height and a second water level",
      ],
      setup: "",
      water: "",
      rinse: "",
      note: "",
    },
  },
];

export const productBySlug = new Map(products.map((product) => [product.slug, product]));

export function getProduct(slug: string): Product | undefined {
  return productBySlug.get(slug);
}

export function getRelatedProducts(slug: string): Product[] {
  return products.filter((product) => product.slug !== slug);
}
