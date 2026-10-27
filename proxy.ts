import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

// Next.js runs this before every matching request (see `config.matcher` below).
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // Run on pages, but skip Next.js internals and static files (images, icons, 3D models)
  // so we don't do an auth check for every picture.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|glb|gltf)$).*)",
  ],
};
