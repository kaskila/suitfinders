/**
 * UI view-model types for the product catalog.
 *
 * These are derived from the generated Prisma model types, not re-exported
 * as-is: Prisma's `Decimal` (used for `ProductVariant.price`) cannot be
 * serialised from a Server Component to a Client Component, so money is
 * converted to a plain `number` in the data layer (see lib/data/products.ts)
 * before it ever reaches a view model or a component.
 */
import type {
  BrandModel,
  CategoryModel,
  ProductImageModel,
  ProductModel,
  ProductVariantModel,
  VendorModel,
} from "@/generated/prisma/models";

export interface ProductImageView
  extends Pick<ProductImageModel, "id" | "sortOrder"> {
  /** Resolved via storageRefToUrl() — never a raw storageRef. */
  url: string;
  alt: string;
}

export interface ProductVariantView
  extends Pick<ProductVariantModel, "id" | "size" | "color" | "sku" | "stock"> {
  /** Converted from Prisma.Decimal in the data layer. */
  price: number;
  inStock: boolean;
}

export type BrandSummary = Pick<BrandModel, "name" | "slug">;

export type VendorSummary = Pick<VendorModel, "businessName">;

export type CategorySummary = Pick<CategoryModel, "name" | "slug">;

/** Card view used in product grids (catalog, featured, search results). */
export interface ProductCard extends Pick<ProductModel, "id" | "slug" | "name"> {
  brand: BrandSummary;
  vendor: VendorSummary;
  image: ProductImageView | null;
  /** Lowest variant price, for "from ZMW x" display. */
  priceFrom: number;
  sizes: string[];
  inStock: boolean;
}

/** Full view used on a product detail page. */
export interface ProductDetail extends Pick<ProductModel, "id" | "slug" | "name"> {
  description: string;
  brand: BrandSummary;
  vendor: VendorSummary;
  category: CategorySummary | null;
  images: ProductImageView[];
  variants: ProductVariantView[];
  priceRange: { min: number; max: number };
  inStock: boolean;
}
