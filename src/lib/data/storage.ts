/**
 * The single seam between a stored image reference and a renderable URL.
 * This is the ONLY place image URLs are constructed.
 *
 * `storageRef` holds one of two shapes:
 *  - a full http(s) URL: the seeded fixtures store Unsplash URLs this way,
 *    so those pass through unchanged.
 *  - a Cloudinary public_id (e.g. "suitfinders/products/abc123"): anything
 *    that isn't already a URL is assumed to be one, and gets built into a
 *    delivery URL with automatic format/quality and a width cap sized for
 *    our card and detail layouts (both cap out around 50vw on large
 *    screens; 1600px comfortably covers that at 2x density).
 */
const CLOUDINARY_MAX_WIDTH = 1600;

function isFullUrl(ref: string): boolean {
  return /^https?:\/\//.test(ref);
}

export function storageRefToUrl(storageRef: string): string {
  if (isFullUrl(storageRef)) {
    return storageRef;
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  if (!cloudName) {
    throw new Error("CLOUDINARY_CLOUD_NAME is not set");
  }

  const transformations = `f_auto,q_auto,c_limit,w_${CLOUDINARY_MAX_WIDTH}`;
  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformations}/${storageRef}`;
}
