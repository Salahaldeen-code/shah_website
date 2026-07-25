import type { Metadata } from "next";

import { MembershipRegistrationForm } from "@/components/membership/MembershipRegistrationForm";

export const metadata: Metadata = {
  title: "Membership",
  description: "PSR new membership registration form",
};

export default function MembershipPage() {
  return (
    <main className="relative min-h-svh bg-brand-dark pb-[var(--content-bottom-pad)] text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgb(245_197_24/0.08),transparent_55%)]"
      />
      <div className="relative mx-auto w-full max-w-[var(--container-max)] px-[var(--container-padding)] pt-10 sm:pt-14 md:pt-16">
        <MembershipRegistrationForm />
      </div>
    </main>
  );
}
