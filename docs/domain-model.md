# SuitFinders Domain Model

## Purpose

SuitFinders is a full-stack platform for discovering, sourcing, selling,
and custom-ordering suits in Zambia. This document describes the approved
domain model for the MVP: the entities, their responsibilities,
relationships, and the constraints that keep the data trustworthy.

## MVP Scope

The MVP supports:

- Browsing a catalog of suits (products, variants, categories, brands).
- Placing standard orders against catalog products.
- Submitting custom/bespoke suit requests with reference images and
  structured measurements.
- Vendor-sourced products, managed by admins.

The MVP deliberately excludes payments processing, reviews, wishlists,
coupons, notifications, chat, and analytics event tracking. These may be
introduced later but are not part of the current domain model (see
Deliberate Exclusions).

## Actors

- **Customer** — browses the catalog, places orders, submits custom
  requests.
- **Admin** — manages catalog data (products, variants, categories,
  brands) and vendor records; reviews orders and custom requests.
- **Vendor** — the sourcing/fulfillment party behind a product. Vendor
  accounts do not yet have self-service workflows in the MVP; vendor
  records are managed by admins.

All three actors authenticate through a single identity mechanism (see
`User` below) but act through distinct domain profiles.

## Entities and Responsibilities

### Identity

**User**
Authentication identity — email, credential/session data, and an
optional `name` used for identity/display purposes across whichever
profiles (Customer, Admin, Vendor) are linked to it. User remains the
authentication identity entity; `name` is identity/display data, not
business data. A User must have at least one profile (Customer, Admin,
or Vendor) to act within the system.

**Customer**
A domain profile representing a person who shops and submits custom
requests. Linked to exactly one User. Holds `phone`, the customer's
contact phone number (used for order fulfillment contact). Display name
is not duplicated here — it comes from the linked User's `name`.

**Admin**
A domain profile representing internal staff who manage the catalog and
operations. Linked to exactly one User. Holds no fields of its own for
the MVP: display name comes from the linked User's `name`, and all
admins share the same authorization scope. Differentiated admin
permission levels are not part of the current domain model and would
require a separate, explicit decision (see Deliberate Exclusions).

**Vendor**
A domain profile representing a supplier/fulfillment source for
products. Linked to exactly one User. Has a status (active/inactive)
controlling catalog visibility of its products. Holds `businessName`
(the vendor's trading/display name — distinct from any linked User's
personal `name`) and an optional `contactInfo`: a single free-text field
for a primary contact channel (e.g. a phone number or email address),
not a structured, multi-field contact record.

> A User may technically hold more than one profile (e.g. Customer and
> Vendor), but the MVP does not expose any onboarding or UI workflow for
> multi-profile accounts. This is a data-model allowance, not a
> supported product flow.

### Catalog

**Brand**
The label/manufacturer identity carried by a product (distinct from
Vendor, which is who supplies/fulfills it). Holds an optional
`description` and an optional `logoRef`. `logoRef` follows the same
image-storage principle as ProductImage/CustomRequestImage: the
database stores only an external storage reference, never binary image
data.

**Category**
A browsing/taxonomy grouping for products. Supports a shallow hierarchy
via `parentCategoryId` (category → subcategory, not deeper).

**Product**
A sellable catalog item. Holds descriptive/display data (name, slug,
description, brand, vendor, status). Does not hold price or stock
directly — those belong to its variants.

**ProductCategory**
The many-to-many join between Product and Category. Carries an
`isPrimary` flag; a product may belong to multiple categories but has at
most one primary category (used for canonical URLs/breadcrumbs).

**ProductVariant**
The actual purchasable unit of a product (e.g. a specific size/color
combination). Owns the searchable, transactional attributes:

- `size`
- `color`
- `sku`
- `price`
- `stock`
- `status`

**ProductImage**
An image belonging to a Product (not to an individual variant, for
MVP). Stores only an external storage reference, never binary data.

### Transactions

**Order**
A confirmed purchase by a Customer. Holds status, a total-amount
snapshot, and a shipping-address snapshot at time of purchase.

**OrderItem**
A line item within an Order, referencing the ProductVariant purchased.
Stores immutable snapshots of the product name, variant information
(size/color), SKU, and price as they were at purchase time — never
read live from Product/ProductVariant.

### Custom Orders

**CustomRequest**
A customer's request for a bespoke suit. Holds status, description,
budget range, and structured measurements as JSON, validated by Zod at
the application boundary (not enforced by the database schema itself).
Does not yet carry a link to a resulting Order — conversion from
request to order is an application-level workflow for MVP, not a
schema relationship.

**CustomRequestImage**
A reference image belonging to a CustomRequest (e.g. fabric or fit
inspiration). Stores only an external storage reference, never binary
data.

## Relationships and Cardinalities

| From | To | Cardinality |
|---|---|---|
| User | Customer | 1 : 0..1 |
| User | Admin | 1 : 0..1 |
| User | Vendor | 1 : 0..1 |
| Customer | Order | 1 : N |
| Customer | CustomRequest | 1 : N |
| Vendor | Product | 1 : N |
| Brand | Product | 1 : N |
| Product | ProductVariant | 1 : N |
| Product | Category | N : N (via ProductCategory) |
| Product | ProductImage | 1 : N |
| ProductVariant | OrderItem | 1 : N |
| Order | OrderItem | 1 : N |
| CustomRequest | CustomRequestImage | 1 : N |
| Category | Category | 1 : N (self-referential, `parentCategoryId`) |

## Important Constraints

- `User.email` is unique and required. All credential/session data lives
  only on User.
- `Customer.userId`, `Admin.userId`, `Vendor.userId` are each unique —
  one User has at most one of each profile type.
- `ProductVariant.sku` is unique. `price >= 0`, `stock >= 0`.
- `ProductCategory(productId, categoryId)` is unique — a product cannot
  be assigned to the same category twice.
- At most one `ProductCategory` row per product may have `isPrimary =
  true`.
- `OrderItem`'s snapshot fields (product name, variant info, SKU, price)
  are required and immutable once written — never updated, never
  re-derived from live catalog data.
- `ProductImage.storageRef` / `CustomRequestImage.storageRef` are
  non-empty external references only — no binary image data is stored
  in the database. `Brand.logoRef`, when present, follows the same
  principle: optional, but a non-empty external reference — never
  binary data.
- `CustomRequest.measurements` is a JSON field; structural correctness
  is enforced by Zod validation at the application boundary, not by the
  database.
- `User.name` is optional.
- `Customer.phone` is required.
- `Vendor.businessName` is required; `Vendor.contactInfo` is optional.

## Lifecycle / Status Concepts

- **Product.status**: draft → published → archived. Archived products
  are never hard-deleted while OrderItem references exist.
- **ProductVariant.status**: mirrors Product's lifecycle at the
  variant level (e.g. active/archived), independent of Product.status
  where a variant is discontinued but the product line remains.
- **Vendor.status**: active / inactive. Deactivating a vendor:
  - does **not** delete its products or any historical data;
  - prevents its products from being newly published;
  - removes/excludes its products from appearing as available catalog
    listings.
- **Order.status**: represents the fulfillment lifecycle of a purchase
  (e.g. pending → paid → shipped → delivered, with a cancelled branch).
  Exact state set is an implementation detail, not fixed by this
  document.
- **CustomRequest.status**: represents the bespoke-request workflow
  (e.g. submitted → reviewing → quoted → accepted → in progress →
  completed, with a cancelled branch). Exact state set is an
  implementation detail, not fixed by this document.
- **Archiving over deletion**: Products and ProductVariants are
  soft-deleted/archived rather than hard-deleted whenever historical
  references (OrderItems) exist, preserving order history integrity.

## Deliberate Exclusions

The following are intentionally **not** part of the MVP domain model and
must not be introduced without a separate decision:

- Payment
- Review
- Wishlist
- Coupon
- Notification
- Chat
- AnalyticsEvent
- A standalone Address entity (addresses are snapshotted onto Order,
  not modeled independently, for MVP)
- A `resultingOrderId` link from CustomRequest to Order
- Per-variant images (images are Product-level only for MVP)
- Self-service vendor accounts/workflows (vendors are admin-managed for
  MVP)
- Differentiated Admin permission levels (e.g. an `AdminPermissionLevel`
  enum) — all admins currently share one authorization scope
- A structured/multi-field Vendor contact record — `Vendor.contactInfo`
  is a single free-text field for MVP

The specific authentication provider (custom credentials vs. a hosted
provider) is not decided by this document — it will be selected later
after a compatibility evaluation, and this model is written to remain
valid regardless of that choice.
