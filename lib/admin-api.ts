import "server-only";
import { notFound, redirect } from "next/navigation";
import { nestFetch } from "@/lib/nest-api";

/** What every admin Server Action returns to the page (never throws for API errors). */
export type ActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; status: number; messages: string[] };

export const NOT_FOUND_MESSAGE = "This item no longer exists. Refresh the page to see the latest.";
export const GENERIC_MESSAGE = "Something went wrong, please try again.";

// NestJS errors look like { statusCode, message: string | string[], error }.
async function readMessages(response: Response) {
  try {
    const payload: unknown = await response.json();
    if (typeof payload === "object" && payload !== null && "message" in payload) {
      const { message } = payload;
      if (typeof message === "string") return [message];
      if (Array.isArray(message)) return message.filter((m): m is string => typeof m === "string");
    }
  } catch {
    // No JSON body.
  }
  return [];
}

/**
 * Read from the admin API in a Server Component.
 * 401 → /login, 404 → the not-found page, anything else non-2xx throws (error boundary).
 */
export async function adminGet<T>(path: string): Promise<T> {
  const response = await nestFetch(path);
  if (!response || response.status === 401) redirect("/login");
  if (response.status === 403) redirect("/dashboard");
  if (response.status === 404) notFound();
  if (!response.ok) throw new Error(`Admin API GET ${path} failed with status ${response.status}`);
  return (await response.json()) as T;
}

/**
 * Write to the admin API from a Server Action.
 * 401 redirects to /login; other failures come back as friendly messages.
 */
export async function adminMutate<T = undefined>(
  method: "POST" | "PATCH" | "PUT" | "DELETE",
  path: string,
  body?: unknown,
): Promise<ActionResult<T>> {
  let response: Response | null;
  try {
    response = await nestFetch(path, { method, body });
  } catch (error) {
    console.error(`Admin API ${method} ${path} failed`, error);
    return { ok: false, status: 502, messages: [GENERIC_MESSAGE] };
  }

  if (!response || response.status === 401) redirect("/login");

  if (response.ok) {
    const text = response.status === 204 ? "" : await response.text();
    return { ok: true, data: (text ? JSON.parse(text) : undefined) as T };
  }

  const apiMessages = await readMessages(response);
  switch (response.status) {
    case 400:
    case 409:
      return {
        ok: false,
        status: response.status,
        messages: apiMessages.length ? apiMessages : [GENERIC_MESSAGE],
      };
    case 404:
      return { ok: false, status: 404, messages: [NOT_FOUND_MESSAGE] };
    default:
      console.error(`Admin API ${method} ${path} returned ${response.status}`, apiMessages);
      return { ok: false, status: response.status, messages: [GENERIC_MESSAGE] };
  }
}
