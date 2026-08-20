# SuitFinders Architecture

This document describes the technical architecture principles for the
SuitFinders MVP. It complements [domain-model.md](./domain-model.md),
which describes the data/entity design. See also the repository's
`CLAUDE.md` for the engineering guidelines this architecture implements.

## Next.js App Router Architecture

SuitFinders is built on the Next.js App Router. Routes, layouts, and
data-fetching are organized under `app/`, following App Router
conventions (route segments, layouts, colocated loading/error states).
Routing and page composition are the framework's responsibility;
business logic is kept out of route files (see Business Logic
Separation below).

## Server Components by Default

Components are Server Components unless a component specifically
requires client-side interactivity (state, event handlers, browser
APIs). Server Components:

- fetch data directly on the server, close to the database access
  layer;
- never ship business logic or secrets to the browser bundle;
- are the default for catalog browsing, product/category display, and
  read-heavy pages.

## Client Components Only Where Necessary

A component is marked `"use client"` only when it genuinely needs
interactivity — forms with client-side state, image upload widgets,
cart/quantity interactions, or anything depending on browser APIs.
Client Components should be as small and as low in the tree as
possible, so that the surrounding page composition stays server-first.

## Server-Side Authorization

Authorization is enforced on the server for every request that touches
protected data or actions — never inferred from client state.

- A request's actor identity is derived from the authenticated session
  (`User`), and its permissions are derived from which domain profile
  (Customer, Admin, Vendor) that User holds — never from a client-sent
  role/flag.
- Admin-only operations (catalog management, vendor management, custom
  request review) are authorized server-side before any mutation runs.
- Vendor visibility rules (inactive vendors' products excluded from the
  catalog, not newly publishable) are enforced in the server-side data
  access layer, not in the UI.
- Public request submission (`CustomRequest`) is unauthenticated by
  design — a buyer does not need a session to submit one (see
  domain-model.md's Authentication Scope). Because that boundary is
  reachable by anyone, it must rate-limit and validate server-side; the
  Zod validation also used client-side in the form is a courtesy for
  the buyer, not a control the server can rely on.

## Validation Boundaries

All external input is validated at the boundary where it enters the
system, using Zod:

- Form submissions and Server Actions validate their input shape before
  any business logic runs.
- `CustomRequest.measurements` (structured JSON) is validated by a Zod
  schema at the application boundary — the database does not enforce
  its internal structure.
- Uploaded files (product images, custom-request images) are validated
  for type/size at the upload boundary before a storage reference is
  persisted.
- Cloudinary's signed upload API has no parameter to cap file size at
  upload time — only `allowed_formats` is enforced then. Because of
  that, `verifyUploadedAsset()` (`src/lib/cloudinary.ts`) must be called
  after every admin image upload completes: it re-checks the asset
  against Cloudinary's own record (not the client's claim) and deletes
  it if it exceeds the 5MB limit. An upload is not considered validated
  until this check has run.
- Validation failures are rejected before reaching data-access code;
  data-access code is not responsible for re-validating shape.

## Business Logic Separation

- UI components (Server and Client) handle presentation only.
- Business operations (creating an order, converting catalog data into
  a purchasable snapshot, submitting a custom request) live in
  server-side modules separate from route/component files.
- Business logic does not read or write the database directly — it goes
  through the centralized data access layer (below).

## Database Access Separation

- All database access is centralized behind a data access layer; no
  route, component, or business-logic module queries the database
  directly.
- Catalog read paths that must respect vendor status (excluding
  inactive vendors' products) are implemented once, centrally, and
  reused everywhere products are listed — not reimplemented per query
  site.
- Historical data integrity is a data-access-layer responsibility: order
  and order-item writes never live-join to current Product/ProductVariant
  data for their snapshot fields, and archived Products/ProductVariants
  are excluded from active catalog queries while remaining readable for
  historical order display.

## Image Storage Boundary

- Images (ProductImage, CustomRequestImage) are stored in external
  object storage; the database stores only a storage reference (URL or
  key), never binary data.
- The application boundary that accepts uploads is responsible for
  validating file type and size, uploading to storage, and persisting
  only the resulting reference.
- No component or business-logic code should assume binary image data
  is ever available from the database.

## Error Handling Principles

- Errors are handled at the boundary closest to where they occur:
  validation errors are rejected before business logic runs; data
  access errors are caught and translated into meaningful
  application-level errors, not leaked as raw database errors.
- User-facing error messages do not expose internal details (query
  structure, stack traces, credentials, infrastructure information).
- Expected failure states (e.g. out-of-stock variant, inactive vendor
  product) are modeled as explicit outcomes in business logic, not as
  exceptions used for control flow.
- Unexpected errors are logged server-side with enough context to
  diagnose, without logging secrets or full user input containing
  sensitive data.

## Security Principles

- Secrets and credentials are never hardcoded and never exposed to the
  client — environment variables containing secrets stay server-only.
- Client-side authorization checks are never trusted; every protected
  action is re-checked server-side.
- All external input is treated as untrusted and validated before use,
  regardless of what the client claims about its own shape or origin.
- Security checks are never disabled to make code pass or to work
  around a failing case — the underlying issue is fixed instead.
- The specific authentication provider is not yet chosen; it will be
  selected after a compatibility evaluation. Until then, no
  provider-specific assumptions are baked into application code beyond
  the `User` identity model described in domain-model.md.

## Testing Strategy

- Critical business logic (order creation, snapshot generation, vendor
  visibility rules, measurement validation) must eventually have
  automated tests.
- User-facing flows (browsing the catalog, placing an order, submitting
  a custom request) should have integration or end-to-end test coverage
  where appropriate.
- Nothing is reported as working without verification — type-checking
  and linting confirm correctness of code shape, not of feature
  behavior.

## Deployment Architecture

- The application is a single Next.js App Router deployment, with
  PostgreSQL as the database or record, accessed exclusively through
  the centralized data access layer.
- Environment-specific configuration (database connection, storage
  credentials, future auth provider credentials) is supplied via
  environment variables and never committed to the repository.
- Object storage for images is an external service, referenced by the
  application but not bundled as part of the deployment artifact.

## Architectural Decisions and Rationale

| Decision | Rationale |
|---|---|
| User is a pure identity entity; Customer/Admin/Vendor are separate linked profiles | Avoids a "single table with a mutable role flag" pattern, which would make server-side authorization easier to spoof or misconfigure. Authorization is instead based on which profile row exists for a User. |
| ProductVariant owns price, stock, and SKU (not Product) | Suits are sold by size/color combination; a single product-level price/stock would not reflect real purchasable units. |
| OrderItem stores immutable snapshots of name, variant info, SKU, and price | Historical orders must remain accurate even if catalog data later changes or the referenced product/variant is archived. |
| ProductImage belongs to Product, not ProductVariant, for MVP | Keeps the image model simple for launch; revisiting per-variant imagery is a deliberate future decision, not an MVP requirement. |
| ProductCategory is many-to-many with a single `isPrimary` flag | Products may reasonably appear in multiple browsing categories, but canonical URLs/breadcrumbs need one unambiguous primary category. |
| Products/ProductVariants are archived rather than hard-deleted when historical references exist | Hard deletion would break OrderItem's ability to display accurate historical data or violate referential integrity. |
| CustomRequest measurements are JSON validated by Zod, not a fully normalized schema | Structured JSON is pragmatic for MVP scope while still being validated at the boundary; a fully normalized measurements schema can be introduced later without a breaking change to the request model. |
| CustomRequest has no `resultingOrderId` yet | Conversion from a custom request to an order is not yet a defined workflow; adding the link prematurely would encode an unconfirmed process into the schema. |
| Vendor deactivation hides products from the catalog without deleting data | Preserves historical integrity and vendor relationship data while meeting the requirement that inactive vendors' products are not newly publishable or visible. |
| Speculative entities (Payment, Review, Wishlist, Coupon, Notification, Chat, AnalyticsEvent) are excluded | Keeps the MVP schema scoped to validated requirements; avoids designing for hypothetical future needs. |
| Authentication provider selection is deferred | A compatibility evaluation is needed before committing to a provider; the domain model is written to remain valid regardless of that choice. |
