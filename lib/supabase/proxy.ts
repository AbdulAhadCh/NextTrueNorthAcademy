import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Pages that require a signed-in user.
const PROTECTED_ROUTES = ["/dashboard", "/reset-password"];

/**
 * Runs before every page request (called from the root proxy.ts).
 *
 * 1. Refreshes the visitor's session if their token is about to expire.
 * 2. Sends signed-out visitors away from protected pages to /login.
 * 3. Sends signed-in visitors away from /login to /dashboard.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Put the fresh cookies on the request, so the page about to render sees them...
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          // ...and on the response, so the browser stores them for next time.
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Checks the token (and refreshes it if needed). Keep this directly after
  // createServerClient: running other code in between can cause random logouts.
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;
  const path = request.nextUrl.pathname;

  if (!user && PROTECTED_ROUTES.some((route) => path.startsWith(route))) {
    return redirectTo(request, response, "/login");
  }

  if (user && path === "/login") {
    return redirectTo(request, response, "/dashboard");
  }

  return response;
}

function redirectTo(request: NextRequest, response: NextResponse, pathname: string) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  url.search = "";
  const redirect = NextResponse.redirect(url);
  // Keep any refreshed session cookies, otherwise the browser would lose them.
  response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
  return redirect;
}
