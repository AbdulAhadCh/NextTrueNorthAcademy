import type { ReactNode } from "react";
import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { signOut } from "@/app/login/actions";
import AdminNav from "@/components/admin/admin-nav";
import { fetchNestMe } from "@/lib/nest-api";

async function RequireAdmin({ children }: Readonly<{ children: ReactNode }>) {
  const result = await fetchNestMe();

  if (result.kind === "unauthenticated") redirect("/login");
  if (result.kind === "forbidden" || result.profile.role !== "admin") {
    redirect("/dashboard");
  }

  const { profile } = result;

  return (
    <div className="admin">
      <aside className="admin-sidebar">
        <Link className="admin-sidebar__brand" href="/admin">
          <strong>TrueNorth</strong>
          <span>Admin</span>
        </Link>
        <AdminNav />
        <div className="admin-sidebar__footer">
          <p className="admin-sidebar__user">
            <strong>{profile.full_name || profile.email}</strong>
            {profile.full_name ? <span>{profile.email}</span> : null}
          </p>
          <Link className="admin-sidebar__link" href="/">
            ← Back to site
          </Link>
          <form action={signOut}>
            <button className="admin-sidebar__link" type="submit">
              Sign out
            </button>
          </form>
        </div>
      </aside>
      <main className="admin-main">{children}</main>
    </div>
  );
}

export default function AdminLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <Suspense
      fallback={
        <main className="dashboard">
          <div className="container">
            <p>Verifying admin access…</p>
          </div>
        </main>
      }
    >
      <RequireAdmin>{children}</RequireAdmin>
    </Suspense>
  );
}
