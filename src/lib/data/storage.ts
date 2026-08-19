/**
 * The single seam between a stored image reference and a renderable URL.
 * Fixtures store full Unsplash URLs as `storageRef` today, so this is a
 * passthrough; once real storage is wired in, `storageRef` will hold a
 * CDN object key and only this function changes to build the CDN URL.
 */
export function storageRefToUrl(storageRef: string): string {
  return storageRef;
}
