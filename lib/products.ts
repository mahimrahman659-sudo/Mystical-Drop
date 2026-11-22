import { BRAND_NAME } from "./brand";

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
  price: number;
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
  care: ProductCare;
};

export const products: Product[] = [
  {
    slug: "bamboo-cascade",
    name: "Bamboo Cascade Water Fountain",
    shortName: "Bamboo Cascade",
    price: 3850,
    catalogNumber: "01",
    provenance: "Natural Bamboo",
    flowLabel: "Trickle",
    flowDescription: "24 dB Gentle Trickle",
    collectionLine: "Seasoned Bamboo • River Stone",
    nativeName: "বাঁশঝাড়ের জলধারা",
    description:
      "Natural multi-tier bamboo stalks with tiered spillways, integrated live plant basin, and hand-selected river stones for desk meditation.",
    longDescription:
      "A three-tier bamboo cascade designed for desks and reading nooks. Seasoned bamboo spillways guide water through a slow, rhythmic drop before it settles into a dark basin of smooth river stones. A quiet companion for small rooms and slower mornings.",
    features: [
      "3-tier bamboo cascade structure",
      "Live indoor plant compatible basin",
      "Low-voltage ultra-quiet submersible pump",
    ],
    image: {
      src: "/images/bamboo-cascade.jpg",
      alt: "Bamboo Cascade Water Fountain with three bamboo spillways watering a dark stone basin filled with river pebbles and green plants",
    },
    cartImage: "/images/bamboo-basin.jpg",
    gallery: [
      {
        src: "/images/bamboo-cascade.jpg",
        alt: "Three-tier bamboo fountain with a black river-stone basin and trailing green plants",
        label: "Cascade Profile",
        caption: "Three Bamboo Spillways",
      },
      {
        src: "/images/bamboo-basin.jpg",
        alt: "Bamboo fountain in a dark ceramic basin surrounded by pebbles in a sunlit room",
        label: "Basin Detail",
        caption: "River Stone Basin",
      },
      {
        src: "/images/triptych-study.jpg",
        alt: `The three ${BRAND_NAME} fountains arranged together on a warm wooden study desk`,
        label: "Studio Trio",
        caption: "The 3-Piece Collection",
      },
    ],
    specs: [
      { label: "Dimensions", value: "26cm × 18cm × 22cm" },
      { label: "Acoustic Decibel", value: "24 dB (Gentle Trickle)" },
      { label: "Material Build", value: "Seasoned Bengal bamboo & river basalt" },
      { label: "Acoustic Pump", value: "220V silent flow-adjust" },
    ],
    included: [
      "Low-voltage silent submersible pump",
      "Hand-selected river pebbles",
      "Aquatic plant starter",
    ],
    care: {
      story:
        "Each Bamboo Cascade is assembled by hand from seasoned bamboo chosen for its straight grain and warm, honeyed tone. The stalks are cut, sanded, and fitted in our Savar studio, then paired with a dark basin and tumbled river stones. Small variations in node spacing and colour are part of the piece.",
      storyPoints: [
        "Seasoned bamboo selected for straight grain and clean nodes",
        "Tiered spillways tuned for a rhythmic, splash-free trickle",
        "Weighted basin keeps the arrangement stable on a desk",
      ],
      setup:
        "Set the basin on a level surface, fit the bamboo spillways into their cradle, and fill the basin with clean water. Submerge the pump fully, connect the water line, and plug it into a standard 220V outlet. Adjust the pump dial until the water finds a quiet, even cadence.",
      water:
        "Filtered or RO water is recommended. Keep the basin topped up so the pump stays fully submerged.",
      rinse:
        "Rinse the river stones and wipe the basin with a soft cloth every two weeks. A soft brush can clear plant debris from the spillways.",
      note: "Never run the pump dry. Empty and dry the basin before storing the fountain or moving it to another room.",
    },
  },
  {
    slug: "rustic-tree-stone-well",
    name: "Rustic Tree & Stone Well Fountain",
    shortName: "Rustic Tree & Stone Well",
    price: 4200,
    catalogNumber: "02",
    provenance: "Kiln Clay & Basalt",
    flowLabel: "Deep Tone",
    flowDescription: "22–26 dB Whisper Flow",
    collectionLine: "Kiln Clay & Basalt • Deep Tone",
    nativeName: "শাখা ও প্রস্তর কূপ ঝরনা",
    description:
      "Textured tree trunk bark sculpture intertwined with a stacked charcoal masonry well reservoir, pouring onto a stone trickle cradle.",
    longDescription:
      "A timeless pastoral water feature blending a sculpted tree-trunk pillar with a miniature charcoal-stacked stone well. Water moves in a gentle cascade into a deep reservoir stone bowl, engineered to cultivate a tranquil sanctuary for reading rooms, study consoles, and meditation altars.",
    features: [
      "Sculpted bark & masonry well body",
      "Deep acoustic tone resonance",
      "Hand-tinted weatherized finish",
    ],
    image: {
      src: "/images/rustic-well.jpg",
      alt: "Rustic Tree and Stone Well Fountain with a carved tree-trunk pillar beside a charcoal stone well",
    },
    cartImage: "/images/rustic-lifestyle.jpg",
    gallery: [
      {
        src: "/images/rustic-well.jpg",
        alt: "Front silhouette of the hand-sculpted tree trunk and charcoal stone well fountain",
        label: "Angle 01",
        caption: "Front Silhouette",
      },
      {
        src: "/images/rustic-wellhead.jpg",
        alt: "Close view of the fountain's textured bark, stone wellhead, and moss details",
        label: "Angle 02",
        caption: "Top Wellhead Cavity",
      },
      {
        src: "/images/triptych-study.jpg",
        alt: `The three ${BRAND_NAME} fountains arranged together on a warm wooden study desk`,
        label: "Angle 03",
        caption: "Studio Trio Context",
      },
    ],
    specs: [
      { label: "Dimensions", value: '8.5" W × 7" D × 12.5" H' },
      { label: "Acoustic Decibel", value: "22–26 dB (Whisper Flow)" },
      { label: "Material Build", value: "Kiln clay & basalt mortar" },
      { label: "Acoustic Pump", value: "220V silent flow-adjust" },
    ],
    included: [
      "Silent submersible pump",
      "Hand-selected river pebbles",
      "Natural moss highlight",
    ],
    care: {
      story:
        "Every Tree & Stone Well fountain is individually sculpted using time-honoured terracotta methods from Savar, reinforced with natural composite resin for water impermeability. The gnarled trunk is textured by hand to echo old banyan bark, while the stacked well stones are treated with charcoal washes for a damp riverbed luster.",
      storyPoints: [
        "Double-fired terracotta stoneware core limits algae adhesion",
        "Textured stone mortar surfaces help prevent unrefined splashing",
        "Balanced weight base resists tipping on study desks",
      ],
      setup:
        "Fill the reservoir stone well with 500ml of clean drinking water, submerge the silent pump, and plug it into a standard 220V household outlet. Setup takes less than 90 seconds with no complicated plumbing.",
      water:
        "Filtered or RO water is recommended to prevent mineral lime residue in the well basin.",
      rinse:
        "Wipe the interior reservoir with a soft cotton cloth once every two weeks. Use a small brush for the crevices between the stacked stones.",
      note: "The pump speed dial can be turned between (+) and (−) to tailor the water cadence from a sleepy trickle to a brisk rivulet.",
    },
  },
  {
    slug: "terracotta-pot",
    name: "Terracotta Pot Water Fountain",
    shortName: "Terracotta Pot",
    price: 3450,
    catalogNumber: "03",
    provenance: "Fired Terracotta",
    flowLabel: "Calming Stream",
    flowDescription: "25 dB Calming Stream",
    collectionLine: "Fired Terracotta • Calming Stream",
    nativeName: "মাটির কলসীর ঝরনা",
    description:
      "Traditional Bengal kiln-fired clay pitcher with curved overflow spout, organic river rock stack, and ambient miniature garden rim.",
    longDescription:
      "A hand-thrown clay pitcher rests at a gentle tilt above a wide terracotta basin, pouring clear water over layered river stones. The unglazed earthenware gives the piece a warm, tactile presence and brings a calm, garden-like cadence to a living room or bedside table.",
    features: [
      "Earthy fired terracotta earthen vessel",
      "Calming stream sound calibration",
      "Natural river stone sound disperser",
    ],
    image: {
      src: "/images/terracotta-pot.jpg",
      alt: "Terracotta Pot Water Fountain with a tilted clay pitcher pouring water over river stones and green plants",
    },
    cartImage: "/images/terracotta-detail.jpg",
    gallery: [
      {
        src: "/images/terracotta-pot.jpg",
        alt: "Terracotta pitcher fountain in a round clay basin with trailing ferns and stones",
        label: "Angle 01",
        caption: "Calming Profile",
      },
      {
        src: "/images/terracotta-detail.jpg",
        alt: "Close view of the terracotta pitcher spout and wet river stones",
        label: "Angle 02",
        caption: "Kolshi Spout Detail",
      },
      {
        src: "/images/triptych-study.jpg",
        alt: `The three ${BRAND_NAME} fountains arranged together on a warm wooden study desk`,
        label: "Angle 03",
        caption: "Studio Trio Context",
      },
    ],
    specs: [
      { label: "Dimensions", value: "22cm × 22cm × 19cm" },
      { label: "Acoustic Decibel", value: "25 dB (Calming Stream)" },
      { label: "Material Build", value: "Hand-thrown clay & natural river pebbles" },
      { label: "Acoustic Pump", value: "Low-voltage silent submersible" },
    ],
    included: [
      "Low-voltage submersible pump",
      "Natural river stone disperser",
      "Miniature garden planting space",
    ],
    care: {
      story:
        "This fountain honours centuries of Bengal ceramic heritage. Each pitcher is thrown by hand, dried slowly, and fired to a warm terracotta tone before it is paired with a matching basin and a nest of natural river stones. The porous earthenware subtly cools the circulating water and carries an authentic organic aroma.",
      storyPoints: [
        "Hand-thrown pitcher with a curved, traditional spout",
        "Natural river stones soften the sound of falling water",
        "Open basin rim leaves room for small green plantings",
      ],
      setup:
        "Place the basin on a level, water-resistant surface. Fill with clean water, submerge the pump, connect the spout line, and plug into a standard outlet. Turn the flow dial slowly until the stream falls cleanly onto the stones.",
      water:
        "Filtered or RO water is recommended. Porous terracotta may show a natural mineral patina over time.",
      rinse:
        "Wipe the basin with a soft damp cloth and rinse the stones every two weeks. Avoid harsh detergents on the unglazed clay.",
      note: "Keep the pump submerged during use. Allow the clay to dry fully before storage or moving the fountain.",
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
