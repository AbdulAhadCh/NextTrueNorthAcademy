import type { Metadata } from "next";
import LoginForm from "@/components/login-form";

export const metadata: Metadata = {
  title: "Sign in | TrueNorth Academy",
  description: "Sign in or create your TrueNorth Academy account.",
};

export default function LoginPage() {
  return <LoginForm />;
}
