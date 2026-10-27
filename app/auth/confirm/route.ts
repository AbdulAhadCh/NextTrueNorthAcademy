import type { EmailOtpType } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Handles links from Supabase emails ("Confirm your email", "Reset password").
 * Example: /auth/confirm?token_hash=...&type=email&next=/dashboard
 */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const tokenHash = params.get("token_hash");
  const type = params.get("type") as EmailOtpType | null;

  // Only allow paths on our own site (stops "next=https://evil.com" tricks).
  const nextParam = params.get("next") ?? "";
  const next = nextParam.startsWith("/") && !nextParam.startsWith("//") ? nextParam : "/dashboard";

  if (tokenHash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    // Success: the user is now signed in (cookies are set).
    if (!error) redirect(next);
  }

  // Missing or expired link.
  redirect("/login?error=link_expired");
}
