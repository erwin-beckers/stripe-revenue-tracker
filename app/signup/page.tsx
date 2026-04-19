import SignupForm from "./signup-form";
import { Suspense } from "react";

export const metadata = { title: "Create account — Stripe Revenue Tracker" };

export default function SignupPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6 py-20">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-semibold tracking-tight text-gradient mb-2">Create your account</h1>
          <p className="text-fg-muted text-sm">Start using Stripe Revenue Tracker in under a minute.</p>
        </div>
        <Suspense>
          <SignupForm />
        </Suspense>
      </div>
    </div>
  );
}
