/**
 * Seeds the 12 former lib/data/fixtures/products.ts entries as real rows.
 * Idempotent: every write is an upsert keyed on a natural unique field
 * (email, slug, sku, or a fixed image id standing in for one), so running
 * this twice converges on the same rows instead of duplicating them.
 */
import crypto from "node:crypto";

import { hashPassword } from "better-auth/crypto";

import { prisma } from "../src/lib/db/prisma";
import { ProductStatus, VendorStatus } from "../src/generated/prisma/enums";

interface SeedVariant {
  size: string;
  color: string;
  sku: string;
  price: number;
  stock: number;
}

interface SeedImage {
  id: string;
  storageRef: string;
  altText: string;
  sortOrder: number;
}

interface SeedProduct {
  slug: string;
  name: string;
  description: string;
  status: ProductStatus;
  brand: { name: string; slug: string };
  vendor: { businessName: string };
  category: { name: string; slug: string };
  images: SeedImage[];
  variants: SeedVariant[];
}

function image(id: string, photoId: string, altText: string): SeedImage {
  return {
    id,
    storageRef: `https://images.unsplash.com/photo-${photoId}?q=80&w=1000&auto=format&fit=crop`,
    altText,
    sortOrder: 0,
  };
}

function vendorEmail(businessName: string): string {
  const slug = businessName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return `${slug}@vendors.suitfinders.local`;
}

const seedProducts: SeedProduct[] = [
  {
    slug: "cairo-road-charcoal-two-piece",
    name: "Charcoal Two-Piece Suit",
    description:
      "A slim-fit charcoal two-piece cut from a lightweight wool blend, tailored for Lusaka's warmer months without losing structure.",
    status: ProductStatus.PUBLISHED,
    brand: { name: "Zambezi Tailoring Co.", slug: "zambezi-tailoring-co" },
    vendor: { businessName: "Cairo Road Menswear" },
    category: { name: "Two-Piece Suits", slug: "two-piece-suits" },
    images: [image("prod_01_img_1", "1621062089461-01f1eaebb66c", "Man wearing a charcoal grey two-piece suit")],
    variants: [
      { size: "38R", color: "Charcoal", sku: "ZTC-CH2P-38R", price: 1850, stock: 4 },
      { size: "40R", color: "Charcoal", sku: "ZTC-CH2P-40R", price: 1850, stock: 6 },
      { size: "42R", color: "Charcoal", sku: "ZTC-CH2P-42R", price: 1850, stock: 0 },
      { size: "42L", color: "Charcoal", sku: "ZTC-CH2P-42L", price: 1900, stock: 2 },
    ],
  },
  {
    slug: "manda-hill-navy-business-suit",
    name: "Navy Business Suit",
    description:
      "A boardroom-ready navy suit with a half-canvas construction, finished in-house by Manda Hill's tailoring team.",
    status: ProductStatus.PUBLISHED,
    brand: { name: "Lusaka Gentleman", slug: "lusaka-gentleman" },
    vendor: { businessName: "Manda Hill Suiting Co." },
    category: { name: "Business Suits", slug: "business-suits" },
    images: [image("prod_02_img_1", "1617137968427-85924c800a22", "Man wearing a navy blue business suit")],
    variants: [
      { size: "38R", color: "Navy", sku: "LG-NVBS-38R", price: 2400, stock: 3 },
      { size: "40R", color: "Navy", sku: "LG-NVBS-40R", price: 2400, stock: 5 },
      { size: "44R", color: "Navy", sku: "LG-NVBS-44R", price: 2400, stock: 1 },
    ],
  },
  {
    slug: "foxdale-ivory-wedding-suit",
    name: "Ivory Wedding Suit",
    description:
      "A statement ivory suit for grooms and groomsmen, with satin lapel facing and a fitted waistcoat included.",
    status: ProductStatus.PUBLISHED,
    brand: { name: "Foxdale Bespoke", slug: "foxdale-bespoke" },
    vendor: { businessName: "Foxdale Bespoke" },
    category: { name: "Wedding Suits", slug: "wedding-suits" },
    images: [image("prod_03_img_1", "1693071093573-9e8e342aebeb", "Man wearing an ivory/cream formal suit")],
    variants: [
      { size: "40R", color: "Ivory", sku: "FB-IVWS-40R", price: 4200, stock: 2 },
      { size: "42R", color: "Ivory", sku: "FB-IVWS-42R", price: 4200, stock: 2 },
      { size: "44R", color: "Ivory", sku: "FB-IVWS-44R", price: 4500, stock: 1 },
    ],
  },
  {
    slug: "chilenje-black-tuxedo",
    name: "Classic Black Tuxedo",
    description:
      "A peak-lapel black tuxedo with satin trim, built for galas, awards nights, and formal receptions.",
    status: ProductStatus.PUBLISHED,
    brand: { name: "Copperbelt Classic", slug: "copperbelt-classic" },
    vendor: { businessName: "Chilenje Custom Cuts" },
    category: { name: "Tuxedos", slug: "tuxedos" },
    images: [image("prod_04_img_1", "1755537131223-7c1b667696fd", "Man wearing a black tuxedo with a bow tie")],
    variants: [
      { size: "38R", color: "Black", sku: "CC-BKTX-38R", price: 3600, stock: 0 },
      { size: "40R", color: "Black", sku: "CC-BKTX-40R", price: 3600, stock: 3 },
      { size: "42R", color: "Black", sku: "CC-BKTX-42R", price: 3600, stock: 2 },
      { size: "42L", color: "Black", sku: "CC-BKTX-42L", price: 3700, stock: 1 },
    ],
  },
  {
    slug: "great-east-road-tan-blazer",
    name: "Tan Linen-Blend Blazer",
    description:
      "A breathable tan blazer in a linen-cotton blend, equally at home over chinos or as the top half of a summer suit.",
    status: ProductStatus.PUBLISHED,
    brand: { name: "Savanna Formal", slug: "savanna-formal" },
    vendor: { businessName: "Great East Road Formalwear" },
    category: { name: "Blazers", slug: "blazers" },
    images: [image("prod_05_img_1", "1633193020624-67cd4dc6efcf", "Man wearing a tan linen-blend blazer")],
    variants: [
      { size: "38R", color: "Tan", sku: "SF-TNBL-38R", price: 1200, stock: 7 },
      { size: "40R", color: "Tan", sku: "SF-TNBL-40R", price: 1200, stock: 5 },
    ],
  },
  {
    slug: "kabwata-grey-three-piece",
    name: "Slate Grey Three-Piece Suit",
    description:
      "A three-piece slate grey suit with a matching waistcoat, cut from a mid-weight wool suited to year-round wear.",
    status: ProductStatus.PUBLISHED,
    brand: { name: "Zambezi Tailoring Co.", slug: "zambezi-tailoring-co" },
    vendor: { businessName: "Kabwata Tailors" },
    category: { name: "Three-Piece Suits", slug: "three-piece-suits" },
    images: [image("prod_06_img_1", "1784817552041-5f7d793a92d3", "Man wearing a grey suit")],
    variants: [
      { size: "36R", color: "Slate Grey", sku: "ZTC-SG3P-36R", price: 2650, stock: 2 },
      { size: "38R", color: "Slate Grey", sku: "ZTC-SG3P-38R", price: 2650, stock: 4 },
      { size: "40R", color: "Slate Grey", sku: "ZTC-SG3P-40R", price: 2650, stock: 3 },
      { size: "40L", color: "Slate Grey", sku: "ZTC-SG3P-40L", price: 2750, stock: 0 },
    ],
  },
  {
    slug: "munda-wear-midnight-blue-tuxedo",
    name: "Midnight Blue Tuxedo",
    description:
      "A midnight blue tuxedo that reads black under evening light with a subtle sheen that photographs better than true black.",
    status: ProductStatus.PUBLISHED,
    brand: { name: "Munda Wear", slug: "munda-wear" },
    vendor: { businessName: "Munda Wear" },
    category: { name: "Tuxedos", slug: "tuxedos" },
    images: [image("prod_07_img_1", "1689620471599-7be7db37e082", "Man wearing a navy blue tuxedo")],
    variants: [
      { size: "40R", color: "Midnight Blue", sku: "MW-MBTX-40R", price: 3950, stock: 1 },
      { size: "42R", color: "Midnight Blue", sku: "MW-MBTX-42R", price: 3950, stock: 2 },
      { size: "44R", color: "Midnight Blue", sku: "MW-MBTX-44R", price: 4050, stock: 0 },
    ],
  },
  {
    slug: "kariba-olive-two-piece",
    name: "Olive Two-Piece Suit",
    description:
      "An earthy olive two-piece with a soft shoulder and natural drape, popular for outdoor and garden ceremonies.",
    status: ProductStatus.PUBLISHED,
    brand: { name: "Kariba Tailoring", slug: "kariba-tailoring" },
    vendor: { businessName: "Kariba Tailoring" },
    category: { name: "Two-Piece Suits", slug: "two-piece-suits" },
    images: [image("prod_08_img_1", "1712773663106-bcad3c446544", "Man wearing an olive green suit")],
    variants: [
      { size: "38R", color: "Olive", sku: "KT-OL2P-38R", price: 1650, stock: 3 },
      { size: "40R", color: "Olive", sku: "KT-OL2P-40R", price: 1650, stock: 2 },
      { size: "42R", color: "Olive", sku: "KT-OL2P-42R", price: 1650, stock: 4 },
    ],
  },
  {
    slug: "cairo-road-burgundy-blazer",
    name: "Burgundy Velvet Blazer",
    description:
      "A statement burgundy velvet blazer for festive-season events, paired well with black tailored trousers.",
    status: ProductStatus.PUBLISHED,
    brand: { name: "Lusaka Gentleman", slug: "lusaka-gentleman" },
    vendor: { businessName: "Cairo Road Menswear" },
    category: { name: "Blazers", slug: "blazers" },
    images: [image("prod_09_img_1", "1593032580308-d4bafafc4f28", "Man wearing a burgundy blazer")],
    variants: [
      { size: "38R", color: "Burgundy", sku: "LG-BGBL-38R", price: 1550, stock: 0 },
      { size: "40R", color: "Burgundy", sku: "LG-BGBL-40R", price: 1550, stock: 0 },
    ],
  },
  {
    slug: "foxdale-stone-wedding-suit",
    name: "Stone Grey Wedding Suit",
    description:
      "A softer alternative to classic black-tie, this stone grey suit is tailored with a fuller canvas for all-day wedding wear.",
    status: ProductStatus.PUBLISHED,
    brand: { name: "Foxdale Bespoke", slug: "foxdale-bespoke" },
    vendor: { businessName: "Foxdale Bespoke" },
    category: { name: "Wedding Suits", slug: "wedding-suits" },
    images: [image("prod_10_img_1", "1773688189505-f92d103f7860", "Man wearing a light grey suit")],
    variants: [
      { size: "40R", color: "Stone Grey", sku: "FB-SGWS-40R", price: 3100, stock: 2 },
      { size: "42R", color: "Stone Grey", sku: "FB-SGWS-42R", price: 3100, stock: 3 },
      { size: "44R", color: "Stone Grey", sku: "FB-SGWS-44R", price: 3200, stock: 1 },
      { size: "46R", color: "Stone Grey", sku: "FB-SGWS-46R", price: 3200, stock: 0 },
    ],
  },
  {
    slug: "kabwata-brown-check-suit",
    name: "Brown Check Business Suit",
    description:
      "A subtle brown windowpane check suit that stands out without breaking from office dress codes.",
    status: ProductStatus.DRAFT,
    brand: { name: "Zambezi Tailoring Co.", slug: "zambezi-tailoring-co" },
    vendor: { businessName: "Kabwata Tailors" },
    category: { name: "Business Suits", slug: "business-suits" },
    images: [image("prod_11_img_1", "1593032329353-5c93d539ffe2", "Man wearing a brown check blazer")],
    variants: [
      { size: "40R", color: "Brown Check", sku: "ZTC-BRCH-40R", price: 2100, stock: 2 },
      { size: "42R", color: "Brown Check", sku: "ZTC-BRCH-42R", price: 2100, stock: 2 },
    ],
  },
  {
    slug: "great-east-road-classic-black-two-piece",
    name: "Classic Black Two-Piece Suit",
    description:
      "A dependable black two-piece suit — the first suit most customers ask for, and the one this listing is being retired in favour of an updated cut.",
    status: ProductStatus.ARCHIVED,
    brand: { name: "Savanna Formal", slug: "savanna-formal" },
    vendor: { businessName: "Great East Road Formalwear" },
    category: { name: "Two-Piece Suits", slug: "two-piece-suits" },
    images: [image("prod_12_img_1", "1618886614638-80e3c103d31a", "Man wearing a plain black two-piece suit")],
    variants: [
      { size: "38R", color: "Black", sku: "SF-BK2P-38R", price: 850, stock: 0 },
      { size: "40R", color: "Black", sku: "SF-BK2P-40R", price: 850, stock: 0 },
    ],
  },
];

async function upsertVendor(businessName: string): Promise<string> {
  const email = vendorEmail(businessName);
  const user = await prisma.user.upsert({
    where: { email },
    update: { name: businessName },
    create: { email, name: businessName },
  });
  const vendor = await prisma.vendor.upsert({
    where: { userId: user.id },
    update: { businessName, status: VendorStatus.ACTIVE },
    create: { userId: user.id, businessName, status: VendorStatus.ACTIVE },
  });
  return vendor.id;
}

async function upsertBrand(brand: SeedProduct["brand"]): Promise<string> {
  const row = await prisma.brand.upsert({
    where: { slug: brand.slug },
    update: { name: brand.name },
    create: { slug: brand.slug, name: brand.name },
  });
  return row.id;
}

async function upsertCategory(category: SeedProduct["category"]): Promise<string> {
  const row = await prisma.category.upsert({
    where: { slug: category.slug },
    update: { name: category.name },
    create: { slug: category.slug, name: category.name },
  });
  return row.id;
}

/**
 * Seeds the one Better Auth admin from ADMIN_EMAIL / ADMIN_PASSWORD.
 * Written directly against the AdminUser/AdminAccount tables rather than
 * through auth.api.signUpEmail — sign-up is disabled (see src/lib/auth/auth.ts),
 * by design, since admins are seeded, not self-registered. The password
 * hash uses Better Auth's own hasher so the stored value verifies correctly
 * on sign-in; the plaintext password is never logged.
 */
async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env to seed the admin.");
  }

  const normalizedEmail = email.toLowerCase();
  const passwordHash = await hashPassword(password);

  const adminUser = await prisma.adminUser.upsert({
    where: { email: normalizedEmail },
    update: {},
    create: {
      id: crypto.randomUUID(),
      email: normalizedEmail,
      name: "Admin",
      emailVerified: true,
    },
  });

  const existingAccount = await prisma.adminAccount.findFirst({
    where: { userId: adminUser.id, providerId: "credential" },
  });

  if (existingAccount) {
    await prisma.adminAccount.update({
      where: { id: existingAccount.id },
      data: { password: passwordHash },
    });
  } else {
    await prisma.adminAccount.create({
      data: {
        id: crypto.randomUUID(),
        userId: adminUser.id,
        providerId: "credential",
        // The local (non-OAuth) account identity namespace Better Auth's
        // sign-in lookup filters on — see createLocalAccountIssuer("credential")
        // in @better-auth/core's db/schema/account.
        issuer: "local:credential",
        accountId: adminUser.id,
        password: passwordHash,
      },
    });
  }
}

async function main() {
  const vendorIds = new Map<string, string>();
  const brandIds = new Map<string, string>();
  const categoryIds = new Map<string, string>();

  for (const product of seedProducts) {
    if (!vendorIds.has(product.vendor.businessName)) {
      vendorIds.set(product.vendor.businessName, await upsertVendor(product.vendor.businessName));
    }
    if (!brandIds.has(product.brand.slug)) {
      brandIds.set(product.brand.slug, await upsertBrand(product.brand));
    }
    if (!categoryIds.has(product.category.slug)) {
      categoryIds.set(product.category.slug, await upsertCategory(product.category));
    }
  }

  for (const product of seedProducts) {
    const vendorId = vendorIds.get(product.vendor.businessName)!;
    const brandId = brandIds.get(product.brand.slug)!;
    const categoryId = categoryIds.get(product.category.slug)!;

    const dbProduct = await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        name: product.name,
        description: product.description,
        status: product.status,
        brandId,
        vendorId,
      },
      create: {
        slug: product.slug,
        name: product.name,
        description: product.description,
        status: product.status,
        brandId,
        vendorId,
      },
    });

    await prisma.productCategory.upsert({
      where: { productId_categoryId: { productId: dbProduct.id, categoryId } },
      update: { isPrimary: true },
      create: { productId: dbProduct.id, categoryId, isPrimary: true },
    });

    for (const variant of product.variants) {
      await prisma.productVariant.upsert({
        where: { sku: variant.sku },
        update: {
          productId: dbProduct.id,
          size: variant.size,
          color: variant.color,
          price: variant.price,
          stock: variant.stock,
        },
        create: {
          productId: dbProduct.id,
          size: variant.size,
          color: variant.color,
          sku: variant.sku,
          price: variant.price,
          stock: variant.stock,
        },
      });
    }

    for (const img of product.images) {
      await prisma.productImage.upsert({
        where: { id: img.id },
        update: {
          productId: dbProduct.id,
          storageRef: img.storageRef,
          altText: img.altText,
          sortOrder: img.sortOrder,
        },
        create: {
          id: img.id,
          productId: dbProduct.id,
          storageRef: img.storageRef,
          altText: img.altText,
          sortOrder: img.sortOrder,
        },
      });
    }
  }

  await seedAdmin();

  const [
    vendorCount,
    brandCount,
    categoryCount,
    productCount,
    variantCount,
    imageCount,
    productCategoryCount,
    adminUserCount,
  ] = await Promise.all([
    prisma.vendor.count(),
    prisma.brand.count(),
    prisma.category.count(),
    prisma.product.count(),
    prisma.productVariant.count(),
    prisma.productImage.count(),
    prisma.productCategory.count(),
    prisma.adminUser.count(),
  ]);

  console.log("Seed complete. Row counts:");
  console.table({
    Vendor: vendorCount,
    Brand: brandCount,
    Category: categoryCount,
    Product: productCount,
    ProductVariant: variantCount,
    ProductImage: imageCount,
    ProductCategory: productCategoryCount,
    AdminUser: adminUserCount,
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
