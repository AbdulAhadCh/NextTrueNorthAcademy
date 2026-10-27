import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Supabase client for server code: pages, server actions and route handlers.
 *
 * Use it whenever the server needs to talk to Supabase, e.g.
 *   const supabase = await createClient();
 *   const { data: { user } } = await supabase.auth.getUser();
 *
 * Call it once per request (never store it in a shared variable), because
 * every request belongs to a different visitor with their own cookies.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        // Give Supabase the visitor's cookies so it knows who they are.
        getAll() {
          return cookieStore.getAll();
        },
        // Let Supabase save new cookies (after sign in, sign out or a token refresh).
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Pages (Server Components) aren't allowed to set cookies.
            // That's fine: proxy.ts already refreshed the session before the page rendered.
          }
        },
      },
    },
  );
}
