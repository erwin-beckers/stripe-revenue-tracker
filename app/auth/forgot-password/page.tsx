import ForgotPasswordForm from "./forgot-password-form";

export const metadata = { title: "Forgot password — Stripe Revenue Tracker" };

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6 py-20">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-semibold tracking-tight text-gradient mb-2">Reset your password</h1>
          <p className="text-fg-muted text-sm">We&apos;ll email you a link to set a new one.</p>
        </div>
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
