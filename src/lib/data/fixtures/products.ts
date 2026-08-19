/**
 * Static fixture data standing in for the database during frontend
 * development. Only src/lib/data/products.ts may import this file —
 * components must go through the async getters there instead.
 */
import { ProductStatus } from "@/generated/prisma/enums";

export interface ProductImageFixture {
  id: string;
  /** A full Unsplash URL today; a CDN object key once storage is wired in. */
  storageRef: string;
  altText: string;
  sortOrder: number;
}

export interface ProductVariantFixture {
  id: string;
  size: string;
  color: string;
  sku: string;
  price: number;
  stock: number;
}

export interface ProductFixture {
  id: string;
  slug: string;
  name: string;
  /** Nullable in the schema — mirrored here so the data layer's coercion
   *  to "" is actually type-checked, not vacuous. */
  description: string | null;
  status: ProductStatus;
  brand: { name: string; slug: string };
  vendor: { businessName: string };
  category: { name: string; slug: string } | null;
  images: ProductImageFixture[];
  variants: ProductVariantFixture[];
}

function img(id: string, photoId: string, alt: string, sortOrder = 0): ProductImageFixture {
  return {
    id,
    storageRef: `https://images.unsplash.com/photo-${photoId}?q=80&w=1000&auto=format&fit=crop`,
    altText: alt,
    sortOrder,
  };
}

export const products: ProductFixture[] = [
  {
    id: "prod_01",
    slug: "cairo-road-charcoal-two-piece",
    name: "Charcoal Two-Piece Suit",
    description:
      "A slim-fit charcoal two-piece cut from a lightweight wool blend, tailored for Lusaka's warmer months without losing structure.",
    status: ProductStatus.PUBLISHED,
    brand: { name: "Zambezi Tailoring Co.", slug: "zambezi-tailoring-co" },
    vendor: { businessName: "Cairo Road Menswear" },
    category: { name: "Two-Piece Suits", slug: "two-piece-suits" },
    images: [
      img("prod_01_img_1", "1594938298603-c8148c4dae35", "Model wearing a charcoal two-piece suit", 0),
      img("prod_01_img_2", "1507003211169-0a1dd7228f2d", "Charcoal suit jacket detail", 1),
    ],
    variants: [
      { id: "prod_01_v_38r", size: "38R", color: "Charcoal", sku: "ZTC-CH2P-38R", price: 1850, stock: 4 },
      { id: "prod_01_v_40r", size: "40R", color: "Charcoal", sku: "ZTC-CH2P-40R", price: 1850, stock: 6 },
      { id: "prod_01_v_42r", size: "42R", color: "Charcoal", sku: "ZTC-CH2P-42R", price: 1850, stock: 0 },
      { id: "prod_01_v_42l", size: "42L", color: "Charcoal", sku: "ZTC-CH2P-42L", price: 1900, stock: 2 },
    ],
  },
  {
    id: "prod_02",
    slug: "manda-hill-navy-business-suit",
    name: "Navy Business Suit",
    description:
      "A boardroom-ready navy suit with a half-canvas construction, finished in-house by Manda Hill's tailoring team.",
    status: ProductStatus.PUBLISHED,
    brand: { name: "Lusaka Gentleman", slug: "lusaka-gentleman" },
    vendor: { businessName: "Manda Hill Suiting Co." },
    category: { name: "Business Suits", slug: "business-suits" },
    images: [
      img("prod_02_img_1", "1617127365659-c47fa864d8bc", "Model wearing a navy business suit", 0),
    ],
    variants: [
      { id: "prod_02_v_38r", size: "38R", color: "Navy", sku: "LG-NVBS-38R", price: 2400, stock: 3 },
      { id: "prod_02_v_40r", size: "40R", color: "Navy", sku: "LG-NVBS-40R", price: 2400, stock: 5 },
      { id: "prod_02_v_44r", size: "44R", color: "Navy", sku: "LG-NVBS-44R", price: 2400, stock: 1 },
    ],
  },
  {
    id: "prod_03",
    slug: "foxdale-ivory-wedding-suit",
    name: "Ivory Wedding Suit",
    description:
      "A statement ivory suit for grooms and groomsmen, with satin lapel facing and a fitted waistcoat included.",
    status: ProductStatus.PUBLISHED,
    brand: { name: "Foxdale Bespoke", slug: "foxdale-bespoke" },
    vendor: { businessName: "Foxdale Bespoke" },
    category: { name: "Wedding Suits", slug: "wedding-suits" },
    images: [
      img("prod_03_img_1", "1571908599407-cdb918ed83bf", "Model wearing an ivory wedding suit", 0),
      img("prod_03_img_2", "1519085360753-af0119f7cbe7", "Ivory suit lapel detail", 1),
    ],
    variants: [
      { id: "prod_03_v_40r", size: "40R", color: "Ivory", sku: "FB-IVWS-40R", price: 4200, stock: 2 },
      { id: "prod_03_v_42r", size: "42R", color: "Ivory", sku: "FB-IVWS-42R", price: 4200, stock: 2 },
      { id: "prod_03_v_44r", size: "44R", color: "Ivory", sku: "FB-IVWS-44R", price: 4500, stock: 1 },
    ],
  },
  {
    id: "prod_04",
    slug: "chilenje-black-tuxedo",
    name: "Classic Black Tuxedo",
    description:
      "A peak-lapel black tuxedo with satin trim, built for galas, awards nights, and formal receptions.",
    status: ProductStatus.PUBLISHED,
    brand: { name: "Copperbelt Classic", slug: "copperbelt-classic" },
    vendor: { businessName: "Chilenje Custom Cuts" },
    category: { name: "Tuxedos", slug: "tuxedos" },
    images: [
      img("prod_04_img_1", "1622519407650-3df9883f76a5", "Model wearing a black tuxedo", 0),
    ],
    variants: [
      { id: "prod_04_v_38r", size: "38R", color: "Black", sku: "CC-BKTX-38R", price: 3600, stock: 0 },
      { id: "prod_04_v_40r", size: "40R", color: "Black", sku: "CC-BKTX-40R", price: 3600, stock: 3 },
      { id: "prod_04_v_42r", size: "42R", color: "Black", sku: "CC-BKTX-42R", price: 3600, stock: 2 },
      { id: "prod_04_v_42l", size: "42L", color: "Black", sku: "CC-BKTX-42L", price: 3700, stock: 1 },
    ],
  },
  {
    id: "prod_05",
    slug: "great-east-road-tan-blazer",
    name: "Tan Linen-Blend Blazer",
    description:
      "A breathable tan blazer in a linen-cotton blend, equally at home over chinos or as the top half of a summer suit.",
    status: ProductStatus.PUBLISHED,
    brand: { name: "Savanna Formal", slug: "savanna-formal" },
    vendor: { businessName: "Great East Road Formalwear" },
    category: { name: "Blazers", slug: "blazers" },
    images: [
      img("prod_05_img_1", "1552374196-c4e7ffc6e126", "Model wearing a tan linen blazer", 0),
    ],
    variants: [
      { id: "prod_05_v_38r", size: "38R", color: "Tan", sku: "SF-TNBL-38R", price: 1200, stock: 7 },
      { id: "prod_05_v_40r", size: "40R", color: "Tan", sku: "SF-TNBL-40R", price: 1200, stock: 5 },
    ],
  },
  {
    id: "prod_06",
    slug: "kabwata-grey-three-piece",
    name: "Slate Grey Three-Piece Suit",
    description:
      "A three-piece slate grey suit with a matching waistcoat, cut from a mid-weight wool suited to year-round wear.",
    status: ProductStatus.PUBLISHED,
    brand: { name: "Zambezi Tailoring Co.", slug: "zambezi-tailoring-co" },
    vendor: { businessName: "Kabwata Tailors" },
    category: { name: "Three-Piece Suits", slug: "three-piece-suits" },
    images: [
      img("prod_06_img_1", "1489987707025-afc232f7ea0f", "Model wearing a slate grey three-piece suit", 0),
      img("prod_06_img_2", "1593032465175-481ac7f401a0", "Tailor fitting a grey suit", 1),
    ],
    variants: [
      { id: "prod_06_v_36r", size: "36R", color: "Slate Grey", sku: "ZTC-SG3P-36R", price: 2650, stock: 2 },
      { id: "prod_06_v_38r", size: "38R", color: "Slate Grey", sku: "ZTC-SG3P-38R", price: 2650, stock: 4 },
      { id: "prod_06_v_40r", size: "40R", color: "Slate Grey", sku: "ZTC-SG3P-40R", price: 2650, stock: 3 },
      { id: "prod_06_v_40l", size: "40L", color: "Slate Grey", sku: "ZTC-SG3P-40L", price: 2750, stock: 0 },
    ],
  },
  {
    id: "prod_07",
    slug: "munda-wear-midnight-blue-tuxedo",
    name: "Midnight Blue Tuxedo",
    description:
      "A midnight blue tuxedo that reads black under evening light with a subtle sheen that photographs better than true black.",
    status: ProductStatus.PUBLISHED,
    brand: { name: "Munda Wear", slug: "munda-wear" },
    vendor: { businessName: "Munda Wear" },
    category: { name: "Tuxedos", slug: "tuxedos" },
    images: [
      img("prod_07_img_1", "1610030469983-98e550d6193c", "Model wearing a midnight blue tuxedo", 0),
    ],
    variants: [
      { id: "prod_07_v_40r", size: "40R", color: "Midnight Blue", sku: "MW-MBTX-40R", price: 3950, stock: 1 },
      { id: "prod_07_v_42r", size: "42R", color: "Midnight Blue", sku: "MW-MBTX-42R", price: 3950, stock: 2 },
      { id: "prod_07_v_44r", size: "44R", color: "Midnight Blue", sku: "MW-MBTX-44R", price: 4050, stock: 0 },
    ],
  },
  {
    id: "prod_08",
    slug: "kariba-olive-two-piece",
    name: "Olive Two-Piece Suit",
    description:
      "An earthy olive two-piece with a soft shoulder and natural drape, popular for outdoor and garden ceremonies.",
    status: ProductStatus.PUBLISHED,
    brand: { name: "Kariba Tailoring", slug: "kariba-tailoring" },
    vendor: { businessName: "Kariba Tailoring" },
    category: { name: "Two-Piece Suits", slug: "two-piece-suits" },
    images: [
      img("prod_08_img_1", "1516257984-b1b4d707412e", "Model wearing an olive two-piece suit", 0),
    ],
    variants: [
      { id: "prod_08_v_38r", size: "38R", color: "Olive", sku: "KT-OL2P-38R", price: 1650, stock: 3 },
      { id: "prod_08_v_40r", size: "40R", color: "Olive", sku: "KT-OL2P-40R", price: 1650, stock: 2 },
      { id: "prod_08_v_42r", size: "42R", color: "Olive", sku: "KT-OL2P-42R", price: 1650, stock: 4 },
    ],
  },
  {
    id: "prod_09",
    slug: "cairo-road-burgundy-blazer",
    name: "Burgundy Velvet Blazer",
    description:
      "A statement burgundy velvet blazer for festive-season events, paired well with black tailored trousers.",
    status: ProductStatus.PUBLISHED,
    brand: { name: "Lusaka Gentleman", slug: "lusaka-gentleman" },
    vendor: { businessName: "Cairo Road Menswear" },
    category: { name: "Blazers", slug: "blazers" },
    images: [
      img("prod_09_img_1", "1552664730-d307ca884978", "Model wearing a burgundy velvet blazer", 0),
    ],
    variants: [
      { id: "prod_09_v_38r", size: "38R", color: "Burgundy", sku: "LG-BGBL-38R", price: 1550, stock: 0 },
      { id: "prod_09_v_40r", size: "40R", color: "Burgundy", sku: "LG-BGBL-40R", price: 1550, stock: 0 },
    ],
  },
  {
    id: "prod_10",
    slug: "foxdale-stone-wedding-suit",
    name: "Stone Grey Wedding Suit",
    description:
      "A softer alternative to classic black-tie, this stone grey suit is tailored with a fuller canvas for all-day wedding wear.",
    status: ProductStatus.PUBLISHED,
    brand: { name: "Foxdale Bespoke", slug: "foxdale-bespoke" },
    vendor: { businessName: "Foxdale Bespoke" },
    category: { name: "Wedding Suits", slug: "wedding-suits" },
    images: [
      img("prod_10_img_1", "1507003211169-0a1dd7228f2d", "Model wearing a stone grey wedding suit", 0),
      img("prod_10_img_2", "1594938298603-c8148c4dae35", "Stone grey suit detail", 1),
    ],
    variants: [
      { id: "prod_10_v_40r", size: "40R", color: "Stone Grey", sku: "FB-SGWS-40R", price: 3100, stock: 2 },
      { id: "prod_10_v_42r", size: "42R", color: "Stone Grey", sku: "FB-SGWS-42R", price: 3100, stock: 3 },
      { id: "prod_10_v_44r", size: "44R", color: "Stone Grey", sku: "FB-SGWS-44R", price: 3200, stock: 1 },
      { id: "prod_10_v_46r", size: "46R", color: "Stone Grey", sku: "FB-SGWS-46R", price: 3200, stock: 0 },
    ],
  },
  {
    id: "prod_11",
    slug: "kabwata-brown-check-suit",
    name: "Brown Check Business Suit",
    description:
      "A subtle brown windowpane check suit that stands out without breaking from office dress codes.",
    status: ProductStatus.DRAFT,
    brand: { name: "Zambezi Tailoring Co.", slug: "zambezi-tailoring-co" },
    vendor: { businessName: "Kabwata Tailors" },
    category: { name: "Business Suits", slug: "business-suits" },
    images: [
      img("prod_11_img_1", "1617127365659-c47fa864d8bc", "Model wearing a brown check suit", 0),
    ],
    variants: [
      { id: "prod_11_v_40r", size: "40R", color: "Brown Check", sku: "ZTC-BRCH-40R", price: 2100, stock: 2 },
      { id: "prod_11_v_42r", size: "42R", color: "Brown Check", sku: "ZTC-BRCH-42R", price: 2100, stock: 2 },
    ],
  },
  {
    id: "prod_12",
    slug: "great-east-road-classic-black-two-piece",
    name: "Classic Black Two-Piece Suit",
    description:
      "A dependable black two-piece suit — the first suit most customers ask for, and the one this listing is being retired in favour of an updated cut.",
    status: ProductStatus.ARCHIVED,
    brand: { name: "Savanna Formal", slug: "savanna-formal" },
    vendor: { businessName: "Great East Road Formalwear" },
    category: { name: "Two-Piece Suits", slug: "two-piece-suits" },
    images: [
      img("prod_12_img_1", "1519085360753-af0119f7cbe7", "Model wearing a classic black two-piece suit", 0),
    ],
    variants: [
      { id: "prod_12_v_38r", size: "38R", color: "Black", sku: "SF-BK2P-38R", price: 850, stock: 0 },
      { id: "prod_12_v_40r", size: "40R", color: "Black", sku: "SF-BK2P-40R", price: 850, stock: 0 },
    ],
  },
];
