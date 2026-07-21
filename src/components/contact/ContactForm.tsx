"use client";

import { useId, useState, type FormEvent } from "react";

import type { Dictionary } from "@/lib/i18n/dictionaries";

type ContactFormCopy = Dictionary["contactPage"]["form"];

type ContactFormProps = {
  copy: ContactFormCopy;
};

type FieldErrors = Partial<
  Record<"name" | "email" | "phone" | "subject" | "message", string>
>;

const fieldClass =
  "w-full border border-white/12 bg-black/35 px-3 py-2.5 text-sm text-white outline-none transition-[border-color,background-color] placeholder:text-white/30 focus:border-brand-yellow/70 focus:bg-black/50";

export function ContactForm({ copy }: ContactFormProps) {
  const formId = useId();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function validate(): FieldErrors {
    const next: FieldErrors = {};
    if (!name.trim()) next.name = copy.errors.name;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      next.email = copy.errors.email;
    }
    const digits = phone.replace(/\D/g, "");
    if (phone.trim() && (digits.length < 8 || digits.length > 15)) {
      next.phone = copy.errors.phone;
    }
    if (!subject.trim()) next.subject = copy.errors.subject;
    if (message.trim().length < 10) next.message = copy.errors.message;
    return next;
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSubmitting(true);
    // UI-only for now — wire to an API / email service later
    await new Promise((resolve) => setTimeout(resolve, 450));
    setSubmitting(false);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div
        role="status"
        className="border border-brand-yellow/40 bg-brand-yellow/10 px-6 py-10 text-center sm:px-8"
      >
        <p className="font-display text-xl tracking-[0.12em] text-brand-yellow uppercase">
          {copy.successTitle}
        </p>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-white/70">
          {copy.successBody}
        </p>
        <button
          type="button"
          onClick={() => {
            setSubmitted(false);
            setName("");
            setEmail("");
            setPhone("");
            setSubject("");
            setMessage("");
            setErrors({});
          }}
          className="mt-7 inline-flex items-center justify-center border border-white/25 px-6 py-2.5 font-display text-xs tracking-[0.16em] text-white uppercase transition-[border-color,color] hover:border-brand-yellow hover:text-brand-yellow"
        >
          {copy.sendAnother}
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="flex h-full flex-col border border-white/12 bg-white/[0.03] p-5 sm:p-7"
      aria-labelledby={`${formId}-heading`}
    >
      <h2
        id={`${formId}-heading`}
        className="font-display text-xl tracking-[0.1em] text-brand-yellow uppercase sm:text-2xl"
      >
        {copy.title}
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-white/60">{copy.subtitle}</p>

      <div className="mt-7 grid flex-1 gap-5 sm:grid-cols-2">
        <div className="sm:col-span-1">
          <label
            htmlFor={`${formId}-name`}
            className="mb-2 block text-[0.72rem] tracking-[0.08em] text-white/90 uppercase"
          >
            {copy.name}
          </label>
          <input
            id={`${formId}-name`}
            name="name"
            type="text"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={fieldClass}
            placeholder={copy.namePlaceholder}
          />
          {errors.name ? (
            <p className="mt-1.5 text-xs text-brand-red">{errors.name}</p>
          ) : null}
        </div>

        <div className="sm:col-span-1">
          <label
            htmlFor={`${formId}-email`}
            className="mb-2 block text-[0.72rem] tracking-[0.08em] text-white/90 uppercase"
          >
            {copy.email}
          </label>
          <input
            id={`${formId}-email`}
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={fieldClass}
            placeholder={copy.emailPlaceholder}
          />
          {errors.email ? (
            <p className="mt-1.5 text-xs text-brand-red">{errors.email}</p>
          ) : null}
        </div>

        <div className="sm:col-span-1">
          <label
            htmlFor={`${formId}-phone`}
            className="mb-2 block text-[0.72rem] tracking-[0.08em] text-white/90 uppercase"
          >
            {copy.phone}
          </label>
          <input
            id={`${formId}-phone`}
            name="phone"
            type="tel"
            autoComplete="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={fieldClass}
            placeholder={copy.phonePlaceholder}
          />
          {errors.phone ? (
            <p className="mt-1.5 text-xs text-brand-red">{errors.phone}</p>
          ) : null}
        </div>

        <div className="sm:col-span-1">
          <label
            htmlFor={`${formId}-subject`}
            className="mb-2 block text-[0.72rem] tracking-[0.08em] text-white/90 uppercase"
          >
            {copy.subject}
          </label>
          <input
            id={`${formId}-subject`}
            name="subject"
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className={fieldClass}
            placeholder={copy.subjectPlaceholder}
          />
          {errors.subject ? (
            <p className="mt-1.5 text-xs text-brand-red">{errors.subject}</p>
          ) : null}
        </div>

        <div className="sm:col-span-2">
          <label
            htmlFor={`${formId}-message`}
            className="mb-2 block text-[0.72rem] tracking-[0.08em] text-white/90 uppercase"
          >
            {copy.message}
          </label>
          <textarea
            id={`${formId}-message`}
            name="message"
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className={`${fieldClass} resize-y min-h-[8rem]`}
            placeholder={copy.messagePlaceholder}
          />
          {errors.message ? (
            <p className="mt-1.5 text-xs text-brand-red">{errors.message}</p>
          ) : null}
        </div>
      </div>

      <div className="mt-auto flex flex-wrap items-center gap-3 pt-7">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center justify-center border border-brand-yellow bg-brand-yellow px-7 py-3 font-display text-sm tracking-[0.16em] text-brand-dark uppercase transition-[background-color,color,transform,opacity] duration-300 hover:-translate-y-0.5 hover:bg-transparent hover:text-brand-yellow disabled:pointer-events-none disabled:opacity-60"
        >
          {submitting ? copy.submitting : copy.submit}
        </button>
        <p className="text-xs leading-relaxed text-white/45">{copy.note}</p>
      </div>
    </form>
  );
}
