import { createClient } from "@/lib/supabase/server";

export type NestProfile = {
  full_name: string | null;
  email: string;
  role: string;
};

export async function getSessionAccessToken() {
  const supabase = await createClient();
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    throw new Error(`Could not read the Supabase session: ${error.message}`);
  }

  return session?.access_token ?? null;
}

export function getNestApiUrl(path: string[]) {
  const baseUrl = process.env.NEST_API_URL;
  if (!baseUrl) throw new Error("NEST_API_URL is not configured");

  const url = new URL(baseUrl);
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("NEST_API_URL must use HTTP or HTTPS");
  }

  const basePath = url.pathname.replace(/\/+$/, "");
  const forwardedPath = path.map((segment) => encodeURIComponent(segment)).join("/");
  url.pathname = `${basePath}/${forwardedPath}`;
  url.search = "";
  url.hash = "";
  return url;
}

/**
 * Server-side request to the NestJS API with the visitor's access token.
 * Returns null when there is no session. `path` is relative, e.g. "admin/courses".
 */
export async function nestFetch(path: string, init: { method?: string; body?: unknown } = {}) {
  const accessToken = await getSessionAccessToken();
  if (!accessToken) return null;

  const headers: Record<string, string> = {
    Accept: "application/json",
    Authorization: `Bearer ${accessToken}`,
  };
  if (init.body !== undefined) headers["Content-Type"] = "application/json";

  return fetch(getNestApiUrl(path.split("/").filter(Boolean)), {
    method: init.method ?? "GET",
    headers,
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
    cache: "no-store",
    redirect: "manual",
  });
}

export async function fetchNestMe() {
  const accessToken = await getSessionAccessToken();
  if (!accessToken) return { kind: "unauthenticated" as const };

  const response = await fetch(getNestApiUrl(["me"]), {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
    redirect: "manual",
  });

  if (response.status === 401) return { kind: "unauthenticated" as const };
  if (response.status === 403) return { kind: "forbidden" as const };
  if (!response.ok) {
    throw new Error(`NestJS /me request failed with status ${response.status}`);
  }

  const payload: unknown = await response.json();
  if (
    typeof payload !== "object" ||
    payload === null ||
    !("full_name" in payload) ||
    !("email" in payload) ||
    !("role" in payload) ||
    (payload.full_name !== null && typeof payload.full_name !== "string") ||
    typeof payload.email !== "string" ||
    typeof payload.role !== "string"
  ) {
    throw new Error("NestJS /me returned an invalid profile");
  }

  return {
    kind: "authenticated" as const,
    profile: {
      full_name: payload.full_name,
      email: payload.email,
      role: payload.role,
    } satisfies NestProfile,
  };
}
