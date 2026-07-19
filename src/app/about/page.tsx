import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
};

export default function AboutPage() {
  return <main className="pb-[var(--content-bottom-pad)]" />;
}
