import { headers } from "next/headers";

import { auth } from "./auth";

/** The current admin session, read server-side from the request cookies. */
export async function getAdminSession() {
  return auth.api.getSession({ headers: await headers() });
}
