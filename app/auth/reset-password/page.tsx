import ResetPasswordForm from "./reset-password-form";

export const metadata = { title: "Set a new password — Stripe Revenue Tracker" };

export default function ResetPasswordPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6 py-20">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-semibold tracking-tight text-gradient mb-2">Set a new password</h1>
          <p className="text-fg-muted text-sm">Pick something at least 8 characters.</p>
        </div>
        <ResetPasswordForm />
      </div>
    </div>
  );
}
