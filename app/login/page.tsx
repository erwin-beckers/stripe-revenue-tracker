import LoginForm from "./login-form";
import { Suspense } from "react";

export const metadata = { title: "Sign in — Stripe Revenue Tracker" };

export default function LoginPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6 py-20">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-semibold tracking-tight text-gradient mb-2">Welcome back</h1>
          <p className="text-fg-muted text-sm">Sign in to Stripe Revenue Tracker.</p>
        </div>
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
