"use server";

import { cookies } from "next/headers";
import { refresh } from "next/cache";

import { isLocale, localeCookieName, type Locale } from "@/config/i18n";

export async function setLocale(locale: Locale) {
  if (!isLocale(locale)) {
    return;
  }

  const cookieStore = await cookies();

  cookieStore.set(localeCookieName, locale, {
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
  });

  refresh();
}
