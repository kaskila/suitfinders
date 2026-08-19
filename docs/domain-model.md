# SuitFinders Domain Model

## Purpose

SuitFinders is a full-stack platform for discovering, sourcing, selling,
and custom-ordering suits in Zambia. This document describes the approved
domain model for the MVP: the entities, their responsibilities,
relationships, and the constraints that keep the data trustworthy.

## MVP Scope

The MVP supports:

- Browsing a catalog of suits (products, variants, categories, brands).
- Submitting a request for a suit — either a specific catalog product
  or something bespoke — with reference images and structured
  measurements. Both cases are the same business event (a buyer telling
  us what they want) and go through a single request pipeline; see
  CustomRequest under Custom Orders below.
- Vendor-sourced products, managed by admins.

The MVP deliberately excludes order placement and payments processing,
reviews, wishlists, coupons, notifications, chat, and analytics event
tracking. These may be introduced later but are not part of the current
domain model (see Deliberate Exclusions).

## Actors

- **Customer** — a domain profile for a person who has an account and
  can submit requests through it. An account is not required to submit
  a request at launch — see Authentication Scope below.
- **Admin** — manages catalog data (products, variants, categories,
  brands) and vendor records; reviews custom requests.
- **Vendor** — the sourcing/fulfillment party behind a product. Vendor
  accounts do not yet have self-service workflows in the MVP; vendor
  records are managed by admins.

### Authentication Scope

At launch, authentication exists for **Admins only**. A buyer submits a
custom request without an account or a signup step: a signup wall
between a buyer and a request loses the lead, and for Zambian buyers
arriving from social channels on mobile data, an account requirement is
friction with no corresponding benefit at this stage.

Customer — and its link to `User` — is retained in the model for a
future accounts feature; it is not deleted, simply not exercised by the
public request flow today. See CustomRequest under Custom Orders below
for how an unauthenticated submission is captured.

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
contact phone number. Display name is not duplicated here — it comes
from the linked User's `name`.

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

### Custom Orders

**CustomRequest**
The single request pipeline for the platform. "I want this specific
suit" and "find me something like this" are the same business event —
a buyer telling us what they want — so both are captured by this one
entity rather than two parallel models. Holds status, description,
budget range, and structured measurements as JSON, validated by Zod at
the application boundary (not enforced by the database schema itself).

A request does not require an authenticated Customer: `customerId` is
nullable, and the request instead carries its own contact details
directly (`contactName`, `contactPhone`, `contactWhatsapp`) — see
Authentication Scope above and Settled Request Payload below.

A request may optionally reference the specific ProductVariant it was
made about, via a nullable `productVariantId`, covering the "I want
this specific suit" case without a separate order/inquiry model. See
Deletion Semantics for the required on-delete behaviour.

**CustomRequestImage**
A reference image belonging to a CustomRequest (e.g. fabric or fit
inspiration). Stores only an external storage reference, never binary
data.

**Settled request payload.** The request shape is defined by the Zod
schema at `src/lib/validation/request.ts`, written against the real
submission form — that file is the source of truth for field-level
detail, not this document. It validates and normalises:

- `contactName` (required)
- `contactPhone` (required)
- `contactWhatsapp` (nullable)
- `description` (required)
- `size` (nullable)
- `budgetMin`, `budgetMax` (nullable)
- `occasion` (nullable) — a fixed set (Wedding, Business, Funeral,
  Church, Other); this should be an enum in the schema, not free text.
- `productSlug` — the form's identifier for the product a request
  refers to; resolved at the application boundary to the
  `productVariantId` the schema actually stores.

Zod is the validation boundary for this shape, the same principle
already applied to `CustomRequest.measurements` above. The database
stores normalised values, not whatever the buyer typed — phone numbers,
specifically, are stored as `+260XXXXXXXXX` regardless of whether the
buyer entered `09…`, `260…`, or `+260…`.

## Relationships and Cardinalities

| From | To | Cardinality |
|---|---|---|
| User | Customer | 1 : 0..1 |
| User | Admin | 1 : 0..1 |
| User | Vendor | 1 : 0..1 |
| Customer | CustomRequest | 1 : N |
| Vendor | Product | 1 : N |
| Brand | Product | 1 : N |
| Product | ProductVariant | 1 : N |
| Product | Category | N : N (via ProductCategory) |
| Product | ProductImage | 1 : N |
| ProductVariant | CustomRequest | 1 : N |
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
- `ProductImage.storageRef` / `CustomRequestImage.storageRef` are
  non-empty external references only — no binary image data is stored
  in the database. `Brand.logoRef`, when present, follows the same
  principle: optional, but a non-empty external reference — never
  binary data.
- `CustomRequest.measurements` is a JSON field; structural correctness
  is enforced by Zod validation at the application boundary, not by the
  database.
- `CustomRequest.customerId` is nullable — a request does not require
  an authenticated Customer at launch. `CustomRequest.contactName` and
  `CustomRequest.contactPhone` are required regardless of whether a
  Customer is linked; `CustomRequest.contactWhatsapp` is nullable.
  `contactPhone` and `contactWhatsapp`, when present, are stored
  normalised as `+260XXXXXXXXX`, never in whatever format the buyer
  typed.
- `CustomRequest.productVariantId` is nullable.
- `CustomRequest.occasion`, once added, is a fixed enum (Wedding,
  Business, Funeral, Church, Other) — not free text.
- `User.name` is optional.
- `Customer.phone` is required.
- `Vendor.businessName` is required; `Vendor.contactInfo` is optional.

## Lifecycle / Status Concepts

- **Product.status**: draft → published → archived. Archived products
  are never hard-deleted while CustomRequest references (via a
  variant's `productVariantId`) exist.
- **ProductVariant.status**: mirrors Product's lifecycle at the
  variant level (e.g. active/archived), independent of Product.status
  where a variant is discontinued but the product line remains.
- **Vendor.status**: active / inactive. Deactivating a vendor:
  - does **not** delete its products or any historical data;
  - prevents its products from being newly published;
  - removes/excludes its products from appearing as available catalog
    listings.
- **CustomRequest.status**: represents the bespoke-request workflow
  (e.g. submitted → reviewing → quoted → accepted → in progress →
  completed, with a cancelled branch). Exact state set is an
  implementation detail, not fixed by this document.
- **Archiving over deletion**: Products and ProductVariants are
  soft-deleted/archived rather than hard-deleted whenever historical
  references (CustomRequests that named them) exist, preserving
  request history integrity.

## Deletion Semantics

Every required foreign key has an explicit on-delete behavior, chosen
per relationship rather than left at a framework default. The
governing question for each relationship is: does the child row have
any meaning once its parent is gone?

### CASCADE — child has no independent existence

A row is deleted along with its parent when the row is purely a
dependent fragment of that parent — it is never referenced from
anywhere else and carries no meaning on its own:

- `ProductImage.productId` — an image exists only to depict its
  Product; there is nothing for it to depict once the Product is gone.
- `CustomRequestImage.customRequestId` — the same reasoning applies to
  a custom request's reference images.
- `ProductCategory.productId` — a catalog-assignment row is meaningless
  without the product being categorized; deleting the Product should
  not leave orphaned assignment rows behind.

### RESTRICT — deliberately preserved

A parent cannot be deleted while dependent rows exist when doing so
would either silently discard data that must remain auditable/intact,
or would silently break something else still relying on the parent.
RESTRICT forces that conflict to be resolved explicitly (e.g. by
reassigning or archiving) rather than resolved implicitly by a
cascading delete:

- `Customer.userId`, `Admin.userId`, `Vendor.userId` — a profile row is
  a distinct domain record (custom requests, vendor products) built on
  top of a User; deleting the User out from under it would silently
  orphan that domain history instead of forcing an explicit decision
  about it.
- `Product.brandId`, `Product.vendorId` — a Brand or Vendor backing
  live or historical products must not be deletable while products
  still reference it; removing it would leave catalog data pointing at
  nothing.
- `ProductCategory.categoryId` — a Category in use by at least one
  product must not be deletable; doing so would break catalog
  browsing and any canonical URL relying on that category as primary.
- `ProductVariant.productId` — a variant may be referenced by
  CustomRequest history (via its optional `productVariantId`) even
  after its Product line is discontinued; the Product row must remain
  in place for as long as any of its variants do (see Archiving over
  deletion, above — this is why archiving, not deletion, is the
  mechanism for retiring a Product).
- `CustomRequest.customerId` — a Customer with submitted custom
  requests must not be deletable while those requests exist, so that
  request history is never silently discarded.

### SET NULL — already correct, reasoning recorded

A reference is nulled out on parent deletion when the child remains
meaningful on its own and the relationship is informational rather
than load-bearing for the child's integrity:

- `Category.parentCategoryId` — a subcategory does not stop being a
  valid category if its parent category is removed; it simply becomes
  a top-level category rather than being deleted or blocked.
- `CustomRequest.productVariantId` — a request must survive the
  deletion of the variant that inspired it, exactly as order history
  had to; the reference goes null rather than blocking the deletion or
  cascading one.

## Deliberate Exclusions

The following are intentionally **not** part of the MVP domain model and
must not be introduced without a separate decision:

- Order and OrderItem (see note below)
- Payment
- Review
- Wishlist
- Coupon
- Notification
- Chat
- AnalyticsEvent
- A standalone Address entity (addresses were snapshotted onto Order;
  with Order removed, address capture is not part of the MVP domain at
  all, not merely unmodeled)
- Per-variant images (images are Product-level only for MVP)
- Self-service vendor accounts/workflows (vendors are admin-managed for
  MVP)
- Differentiated Admin permission levels (e.g. an `AdminPermissionLevel`
  enum) — all admins currently share one authorization scope
- A structured/multi-field Vendor contact record — `Vendor.contactInfo`
  is a single free-text field for MVP

Order and OrderItem, present in an earlier version of this model, have
been removed rather than kept in a payments-less form. Payments are out
of scope for launch, and an order with no payment attached is a lead
with extra tables: the Order shape a real payments integration needs —
payment status, a mobile money reference, a settlement record, a refund
path — is not the shape modeled today, so retaining today's Order
preserves nothing between now and then. The migration to a
payment-aware Order happens either way, built from CustomRequest data,
not from today's Order rows.

The immutable-snapshot pattern OrderItem used — `productNameSnapshot`,
`skuSnapshot`, `variantSnapshot`, `unitPriceSnapshot` — is a retained
design principle for that future work, not a discarded one. It was
correct, and a payments-era OrderItem (or its equivalent) should use it
again.

Removing OrderItem also removes the only SET NULL relation that existed
apart from `Category.parentCategoryId`, which was — at that point — the
sole SET NULL relation in the model. A new one is introduced by the
CustomRequest.productVariantId decision above; see Deletion Semantics.

The specific authentication provider (custom credentials vs. a hosted
provider) is not decided by this document — it will be selected later
after a compatibility evaluation, and this model is written to remain
valid regardless of that choice.
