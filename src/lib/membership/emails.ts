import "server-only";

import {
  buildRegistrationDetails,
  renderBrandedEmail,
  renderPlainTextEmail,
} from "@/lib/email/templates";
import { sendMail } from "@/lib/email/client";
import { membershipSports } from "@/config/membership";
import type { MembershipRegistration } from "@/payload-types";

type RegistrationEmailData = Pick<
  MembershipRegistration,
  | "fullName"
  | "email"
  | "icNumber"
  | "phone"
  | "addressLine"
  | "address"
  | "sport"
>;

function sportLabel(sport: MembershipRegistration["sport"]) {
  const option = membershipSports.find((item) => item.id === sport);
  return option ? `${option.labelEn} / ${option.labelMs}` : sport;
}

function adminEmail() {
  return (
    process.env.ADMIN_NOTIFICATION_EMAIL?.trim() ||
    process.env.SMTP_USER?.trim() ||
    ""
  );
}

function adminRegistrationsUrl() {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "http://localhost:3000";
  return `${siteUrl}/admin/collections/membership-registrations`;
}

function registrationDetails(registration: RegistrationEmailData) {
  return buildRegistrationDetails({
    fullName: registration.fullName,
    email: registration.email,
    icNumber: registration.icNumber,
    phone: registration.phone,
    addressLine: registration.addressLine,
    address: registration.address,
    sport: sportLabel(registration.sport),
  });
}

export async function sendMembershipThankYouEmail(
  registration: RegistrationEmailData,
) {
  const subject = "Thank you for registering with PSR";
  const details = registrationDetails(registration);
  const intro = `Dear ${registration.fullName}, thank you for submitting your membership registration with <strong>Persatuan Sukan &amp; Rekreasi (PSR)</strong>.`;
  const secondaryIntro =
    "We have received your application and will contact you on WhatsApp soon. Below is a copy of the details you submitted. Terima kasih.";

  const html = renderBrandedEmail({
    preheader: "Your PSR membership registration has been received.",
    eyebrow: "PSR Member Portal",
    title: "Registration received",
    intro,
    secondaryIntro,
    detailsTitle: "Your submitted details",
    details,
    footerNote: "PSR Member Portal • Persatuan Sukan & Rekreasi",
  });

  const text = renderPlainTextEmail({
    title: "Registration received",
    intro: `Dear ${registration.fullName}, thank you for submitting your membership registration with Persatuan Sukan & Rekreasi (PSR).`,
    secondaryIntro:
      "We have received your application and will contact you on WhatsApp soon. Below is a copy of the details you submitted. Terima kasih.",
    details,
    footerNote: "PSR Member Portal • Persatuan Sukan & Rekreasi",
  });

  await sendMail({
    to: registration.email,
    subject,
    text,
    html,
  });
}

export async function sendMembershipAdminNotificationEmail(
  registration: RegistrationEmailData,
) {
  const to = adminEmail();
  if (!to) {
    throw new Error("Admin notification email is not configured.");
  }

  const subject = `New membership registration: ${registration.fullName}`;
  const details = registrationDetails(registration);
  const adminUrl = adminRegistrationsUrl();

  const html = renderBrandedEmail({
    preheader: `New PSR membership registration from ${registration.fullName}.`,
    eyebrow: "Admin notification",
    title: "New member registration",
    intro: `A new membership registration has been submitted by <strong>${registration.fullName}</strong>.`,
    secondaryIntro:
      "Review the details below and follow up in the CMS when ready.",
    detailsTitle: "Submitted details",
    details,
    button: {
      href: adminUrl,
      label: "View in admin",
    },
    footerNote: "PSR CMS • Membership registrations",
  });

  const text = renderPlainTextEmail({
    title: "New member registration",
    intro: `A new membership registration has been submitted by ${registration.fullName}.`,
    secondaryIntro: "Review the details below and follow up in the CMS when ready.",
    details,
    button: {
      href: adminUrl,
      label: "View in admin",
    },
    footerNote: "PSR CMS • Membership registrations",
  });

  await sendMail({
    to,
    subject,
    text,
    html,
  });
}
