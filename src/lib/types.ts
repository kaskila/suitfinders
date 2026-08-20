/**
 * UI view-model types for the product catalog.
 *
 * These are derived from the generated Prisma model types, not re-exported
 * as-is: Prisma's `Decimal` (used for `ProductVariant.price`) cannot be
 * serialised from a Server Component to a Client Component, so money is
 * converted to a plain `number` in the data layer (see lib/data/products.ts)
 * before it ever reaches a view model or a component.
 */
import type { CustomRequestStatus } from "@/generated/prisma/enums";
import type {
  BrandModel,
  CategoryModel,
  CustomRequestModel,
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

/** Row view used in the admin request inbox. */
export interface CustomRequestListItem
  extends Pick<
    CustomRequestModel,
    "id" | "createdAt" | "contactName" | "contactPhone" | "contactWhatsapp" | "description"
  > {
  /** The linked variant's product name and size, or null for an open request. */
  product: { name: string; size: string } | null;
  /** Display label (e.g. "Wedding"), not the raw enum value. */
  occasion: string | null;
  status: CustomRequestStatus;
  /** Free-form working notes; not structured or validated (see domain-model.md). */
  adminNotes: string | null;
  /** Converted from Prisma.Decimal in the data layer. */
  budgetMin: number | null;
  budgetMax: number | null;
}
