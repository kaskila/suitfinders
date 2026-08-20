/**
 * Money formatting lives here so no component has to know the currency
 * or grouping convention — components just render the string.
 */
export function formatPrice(amount: number): string {
  const formatted = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(amount);
  return `ZMW ${formatted}`;
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-ZM", { dateStyle: "medium" }).format(date);
}
