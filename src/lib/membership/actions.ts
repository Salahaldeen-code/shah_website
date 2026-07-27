"use server";

import { membershipSports, membershipUpload } from "@/config/membership";
import { getPayloadClient } from "@/lib/cms/client";
import {
  sendMembershipAdminNotificationEmail,
  sendMembershipThankYouEmail,
} from "@/lib/membership/emails";
import type { MembershipRegistration } from "@/payload-types";

export type MembershipSubmitResult =
  | { ok: true }
  | { ok: false; error: string };

type ValidatedRegistration = Pick<
  MembershipRegistration,
  | "fullName"
  | "email"
  | "icNumber"
  | "phone"
  | "addressLine"
  | "address"
  | "sport"
>;

const sportIds = new Set(membershipSports.map((sport) => sport.id));

function validateSubmission(
  formData: FormData,
):
  | { ok: true; data: ValidatedRegistration }
  | { ok: false; error: string } {
  const fullName = String(formData.get("fullName") ?? "").trim();
  const ic1 = String(formData.get("ic1") ?? "");
  const ic2 = String(formData.get("ic2") ?? "");
  const ic3 = String(formData.get("ic3") ?? "");
  const phone = String(formData.get("phone") ?? "").replace(/\D/g, "");
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const addressLine = String(formData.get("addressLine") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const sport = String(formData.get("sport") ?? "");

  if (!fullName) return { ok: false, error: "Full name is required." };
  if (ic1.length !== 6 || ic2.length !== 2 || ic3.length !== 4) {
    return { ok: false, error: "Enter IC as XXXXXX-XX-XXXX." };
  }
  if (!/^\d{8,11}$/.test(phone)) {
    return { ok: false, error: "Enter a valid WhatsApp number." };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: "Enter a valid email address." };
  }
  if (!addressLine) return { ok: false, error: "Address line is required." };
  if (!address) return { ok: false, error: "Full address is required." };
  if (!sportIds.has(sport)) {
    return { ok: false, error: "Select a valid sport." };
  }

  return {
    ok: true,
    data: {
      fullName,
      email,
      icNumber: `${ic1}-${ic2}-${ic3}`,
      phone,
      addressLine,
      address,
      sport: sport as MembershipRegistration["sport"],
    },
  };
}

export async function submitMembershipRegistration(
  formData: FormData,
): Promise<MembershipSubmitResult> {
  const validated = validateSubmission(formData);
  if (!validated.ok) {
    return { ok: false, error: validated.error };
  }

  const photo = formData.get("photo");
  if (photo instanceof File && photo.size > 0) {
    if (!membershipUpload.accept.split(",").includes(photo.type)) {
      return { ok: false, error: "Use JPEG or PNG only." };
    }
    if (photo.size > membershipUpload.maxBytes) {
      return { ok: false, error: "Profile photo must be 2MB or smaller." };
    }
  }

  try {
    const payload = await getPayloadClient();
    let photoId: number | undefined;

    if (photo instanceof File && photo.size > 0) {
      const buffer = Buffer.from(await photo.arrayBuffer());
      const media = await payload.create({
        collection: "media",
        data: {
          alt: `${validated.data.fullName} profile photo`,
        },
        file: {
          data: buffer,
          mimetype: photo.type,
          name: photo.name,
          size: photo.size,
        },
        overrideAccess: true,
      });
      photoId = typeof media.id === "number" ? media.id : Number(media.id);
    }

    await payload.create({
      collection: "membership-registrations",
      data: {
        ...validated.data,
        ...(photoId ? { photo: photoId } : {}),
      },
      overrideAccess: true,
    });

    try {
      await Promise.all([
        sendMembershipThankYouEmail(validated.data),
        sendMembershipAdminNotificationEmail(validated.data),
      ]);
    } catch (emailError) {
      console.error("Membership registration emails failed:", emailError);
    }

    return { ok: true };
  } catch (error) {
    console.error("Membership registration failed:", error);
    return {
      ok: false,
      error: "We could not save your registration. Please try again.",
    };
  }
}
