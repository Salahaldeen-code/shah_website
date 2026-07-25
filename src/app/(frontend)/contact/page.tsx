import type { Metadata } from "next";

import { ContactPageContent } from "@/components/contact/ContactPageContent";
import { getCmsContactPage } from "@/lib/cms";
import { getLocale } from "@/lib/i18n/locale";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with Persatuan Sukan & Rekreasi — questions, programs, and membership.",
};

export default async function ContactPage() {
  const locale = await getLocale();
  const contact = await getCmsContactPage(locale);

  return (
    <main className="min-h-svh bg-brand-dark pb-[var(--content-bottom-pad)] text-white">
      <ContactPageContent copy={contact.copy} image={contact.image} />
    </main>
  );
}
