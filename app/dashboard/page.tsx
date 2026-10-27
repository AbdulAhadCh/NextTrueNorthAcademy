import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { signOut } from "@/app/login/actions";
import { fetchNestMe } from "@/lib/nest-api";

export const metadata: Metadata = {
  title: "Dashboard | TrueNorth Academy",
  description: "Your TrueNorth Academy candidate portal.",
};

async function DashboardContent() {
  const result = await fetchNestMe();

  if (result.kind === "unauthenticated") redirect("/login");
  if (result.kind === "forbidden") {
    throw new Error("NestJS denied access to the current user's profile");
  }
  if (result.profile.role === "admin") redirect("/admin");

  return (
    <section className="dashboard__card">
      <p className="eyebrow">Candidate portal</p>
      <h1>Welcome, {result.profile.full_name || result.profile.email}</h1>
      <p className="dashboard__email">Signed in as {result.profile.email}</p>
      <p className="dashboard__email">Role: {result.profile.role}</p>
      <p className="dashboard__intro">
        Your courses, OSCE practice and progress will appear here.
      </p>
    </section>
  );
}

export default function DashboardPage() {
  return (
    <main className="dashboard">
      <div className="container">
        <header className="dashboard__top">
          <Link className="dashboard__home" href="/">
            ← TrueNorth Academy
          </Link>
          <form action={signOut}>
            <button className="button button--secondary" type="submit">
              Sign out
            </button>
          </form>
        </header>
        <Suspense
          fallback={
            <section className="dashboard__card">
              <h1>Loading your dashboard…</h1>
            </section>
          }
        >
          <DashboardContent />
        </Suspense>
      </div>
    </main>
  );
}
