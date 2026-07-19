"use client";

import Link from "next/link";
import {
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";

import {
  membershipSports,
  membershipUpload,
} from "@/config/membership";

type FieldErrors = Partial<
  Record<
    | "fullName"
    | "ic"
    | "phone"
    | "addressLine"
    | "address"
    | "sport"
    | "photo",
    string
  >
>;

function BilingualLabel({
  htmlFor,
  en,
  ms,
}: {
  htmlFor?: string;
  en: string;
  ms: string;
}) {
  return (
    <label htmlFor={htmlFor} className="mb-2 block">
      <span className="block text-[0.72rem] tracking-[0.08em] text-white/90 uppercase sm:text-xs">
        {en}
      </span>
      <span className="mt-0.5 block text-[0.65rem] tracking-[0.04em] text-white/45">
        {ms}
      </span>
    </label>
  );
}

const fieldClass =
  "w-full rounded-md border border-white/12 bg-black/35 px-3 py-2.5 text-sm text-white outline-none transition-[border-color,background-color] placeholder:text-white/30 focus:border-brand-yellow/70 focus:bg-black/50";

export function MembershipRegistrationForm() {
  const formId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fullName, setFullName] = useState("");
  const [ic1, setIc1] = useState("");
  const [ic2, setIc2] = useState("");
  const [ic3, setIc3] = useState("");
  const [phone, setPhone] = useState("");
  const [addressLine, setAddressLine] = useState("");
  const [address, setAddress] = useState("");
  const [sport, setSport] = useState("");
  const [photoName, setPhotoName] = useState("");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function clearPhoto() {
    setPhotoName("");
    setPhotoPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function onPhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      clearPhoto();
      return;
    }

    if (!membershipUpload.accept.split(",").includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        photo: "Use JPEG or PNG only.",
      }));
      clearPhoto();
      return;
    }

    if (file.size > membershipUpload.maxBytes) {
      setErrors((prev) => ({
        ...prev,
        photo: "Max size is 2MB.",
      }));
      clearPhoto();
      return;
    }

    setErrors((prev) => ({ ...prev, photo: undefined }));
    setPhotoName(file.name);
    setPhotoPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
  }

  function validate(): FieldErrors {
    const next: FieldErrors = {};
    if (!fullName.trim()) next.fullName = "Required";
    if (ic1.length !== 6 || ic2.length !== 2 || ic3.length !== 4) {
      next.ic = "Enter IC as XXXXXX-XX-XXXX";
    }
    if (!/^\d{8,11}$/.test(phone.replace(/\D/g, ""))) {
      next.phone = "Enter a valid WhatsApp number";
    }
    if (!addressLine.trim()) next.addressLine = "Required";
    if (!address.trim()) next.address = "Required";
    if (!sport) next.sport = "Select a sport";
    return next;
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSubmitting(true);
    // UI-only for now — no backend wired yet
    await new Promise((resolve) => window.setTimeout(resolve, 500));
    setSubmitting(false);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="membership-form-panel mx-auto max-w-3xl px-6 py-12 text-center sm:px-10 sm:py-14">
        <p className="text-[0.7rem] tracking-[0.28em] text-brand-yellow uppercase">
          PSR Member Portal
        </p>
        <h2 className="mt-4 font-display text-3xl tracking-[0.08em] text-brand-yellow uppercase sm:text-4xl">
          Registration received
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-white/65">
          Terima kasih. We have received your membership registration and will
          contact you on WhatsApp soon.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex items-center justify-center border border-brand-yellow bg-brand-yellow px-8 py-3 font-display text-sm tracking-[0.16em] text-brand-dark uppercase transition-[background-color,color,transform] duration-300 hover:-translate-y-0.5 hover:bg-transparent hover:text-brand-yellow"
        >
          Back to home
        </Link>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="membership-form-panel mx-auto w-full max-w-5xl px-4 py-6 sm:px-8 sm:py-8 md:px-10 md:py-10"
    >
      <header className="mb-7 text-center sm:mb-8">
        <p className="text-[0.65rem] tracking-[0.22em] text-brand-yellow uppercase sm:text-[0.7rem]">
          PSR Member Portal • Secure Registration
        </p>
        <h1 className="mt-3 font-display text-[clamp(1.6rem,4vw,2.6rem)] tracking-[0.08em] text-brand-yellow uppercase">
          New Membership Registration Form
        </h1>
        <p className="mt-1 text-[0.7rem] tracking-[0.12em] text-white/45 uppercase sm:text-xs">
          Borang Pendaftaran Keahlian Baru
        </p>
      </header>

      <div className="grid gap-5 md:grid-cols-2 md:gap-6">
        <div className="md:col-span-2">
          <BilingualLabel
            htmlFor={`${formId}-name`}
            en="Full Name (As per IC)"
            ms="Nama Penuh (Seperti dalam K/P)"
          />
          <input
            id={`${formId}-name`}
            name="fullName"
            autoComplete="name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className={fieldClass}
          />
          {errors.fullName ? (
            <p className="mt-1.5 text-xs text-brand-red">{errors.fullName}</p>
          ) : null}
        </div>

        <div>
          <BilingualLabel
            en="Identity Card (IC) No."
            ms="No. Kad Pengenalan"
          />
          <div className="flex items-center gap-2">
            <input
              name="ic1"
              inputMode="numeric"
              maxLength={6}
              placeholder="XXXXXX"
              aria-label="IC first 6 digits"
              value={ic1}
              onChange={(e) => setIc1(e.target.value.replace(/\D/g, "").slice(0, 6))}
              className={`${fieldClass} text-center tracking-[0.12em]`}
            />
            <span className="text-white/40">-</span>
            <input
              name="ic2"
              inputMode="numeric"
              maxLength={2}
              placeholder="XX"
              aria-label="IC middle 2 digits"
              value={ic2}
              onChange={(e) => setIc2(e.target.value.replace(/\D/g, "").slice(0, 2))}
              className={`${fieldClass} max-w-[4.5rem] text-center tracking-[0.12em]`}
            />
            <span className="text-white/40">-</span>
            <input
              name="ic3"
              inputMode="numeric"
              maxLength={4}
              placeholder="XXXX"
              aria-label="IC last 4 digits"
              value={ic3}
              onChange={(e) => setIc3(e.target.value.replace(/\D/g, "").slice(0, 4))}
              className={`${fieldClass} max-w-[6rem] text-center tracking-[0.12em]`}
            />
          </div>
          {errors.ic ? (
            <p className="mt-1.5 text-xs text-brand-red">{errors.ic}</p>
          ) : null}
        </div>

        <div>
          <BilingualLabel
            htmlFor={`${formId}-phone`}
            en="Phone No. (WhatsApp)"
            ms="No. Telefon (WhatsApp)"
          />
          <div className="flex overflow-hidden rounded-md border border-white/12 bg-black/35 focus-within:border-brand-yellow/70">
            <span className="inline-flex items-center gap-1.5 border-r border-white/10 px-3 text-sm text-white/80">
              <span
                aria-hidden="true"
                className="rounded-sm bg-brand-yellow/15 px-1 py-0.5 text-[0.58rem] font-semibold tracking-[0.08em] text-brand-yellow"
              >
                MY
              </span>
              +60
            </span>
            <input
              id={`${formId}-phone`}
              name="phone"
              inputMode="tel"
              autoComplete="tel-national"
              placeholder="12XXXXXXX"
              value={phone}
              onChange={(e) =>
                setPhone(e.target.value.replace(/\D/g, "").slice(0, 11))
              }
              className="w-full bg-transparent px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/30"
            />
          </div>
          {errors.phone ? (
            <p className="mt-1.5 text-xs text-brand-red">{errors.phone}</p>
          ) : null}
        </div>

        <div className="md:col-span-2">
          <BilingualLabel
            htmlFor={`${formId}-address-line`}
            en="Address in Bandar Putra Permai"
            ms="Alamat di Bandar Putra Permai"
          />
          <input
            id={`${formId}-address-line`}
            name="addressLine"
            placeholder="Unit / Street"
            value={addressLine}
            onChange={(e) => setAddressLine(e.target.value)}
            className={fieldClass}
          />
          {errors.addressLine ? (
            <p className="mt-1.5 text-xs text-brand-red">{errors.addressLine}</p>
          ) : null}
          <textarea
            id={`${formId}-address`}
            name="address"
            rows={3}
            placeholder="Full address details"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className={`${fieldClass} mt-2 resize-y`}
          />
          {errors.address ? (
            <p className="mt-1.5 text-xs text-brand-red">{errors.address}</p>
          ) : null}
        </div>

        <div>
          <BilingualLabel
            htmlFor={`${formId}-sport`}
            en="Main Sport Preference"
            ms="Sukan Pilihan Utama"
          />
          <select
            id={`${formId}-sport`}
            name="sport"
            value={sport}
            onChange={(e) => setSport(e.target.value)}
            className={`${fieldClass} appearance-none bg-[length:1rem] bg-[right_0.75rem_center] bg-no-repeat pr-10`}
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23f5c518'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
            }}
          >
            <option value="">Select / Pilih</option>
            {membershipSports.map((option) => (
              <option key={option.id} value={option.id}>
                {option.labelEn} / {option.labelMs}
              </option>
            ))}
          </select>
          {errors.sport ? (
            <p className="mt-1.5 text-xs text-brand-red">{errors.sport}</p>
          ) : null}
        </div>

        <div>
          <BilingualLabel
            en="Upload Profile Picture (Optional)"
            ms="Muat Naik Gambar Profil (Pilihan)"
          />
          <div className="flex items-center gap-3 rounded-md border border-dashed border-white/15 bg-black/25 p-3">
            <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-md bg-white/5">
              {photoPreview ? (
                // eslint-disable-next-line @next/next/no-img-element -- local blob preview
                <img
                  src={photoPreview}
                  alt="Profile preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-2xl text-brand-yellow/80" aria-hidden>
                  ↑
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center justify-center border border-white/20 bg-white/5 px-3 py-1.5 text-[0.65rem] tracking-[0.12em] text-white uppercase transition hover:border-brand-yellow/50 hover:text-brand-yellow"
              >
                Browse file
              </button>
              <p className="mt-1.5 truncate text-[0.65rem] text-white/45">
                {photoName || "Max size: 2MB, Format: JPEG, PNG."}
              </p>
              {errors.photo ? (
                <p className="mt-1 text-xs text-brand-red">{errors.photo}</p>
              ) : null}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              name="photo"
              accept={membershipUpload.accept}
              className="sr-only"
              onChange={onPhotoChange}
            />
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-col items-center gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex w-full max-w-md items-center justify-center gap-2 rounded-full border border-brand-yellow bg-brand-yellow px-8 py-3.5 font-display text-sm tracking-[0.16em] text-brand-dark uppercase transition-[background-color,color,transform,opacity] duration-300 hover:-translate-y-0.5 hover:bg-transparent hover:text-brand-yellow disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Submitting…" : "Submit registration"}
          <span aria-hidden="true">›</span>
        </button>
        <Link
          href="/"
          className="text-sm tracking-[0.08em] text-white/50 uppercase transition hover:text-brand-yellow"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
