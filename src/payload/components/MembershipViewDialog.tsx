"use client";

import { membershipSports } from "@/config/membership";
import { Button } from "@payloadcms/ui";
import { useEffect } from "react";
import { createPortal } from "react-dom";

type MembershipRow = {
  id?: string | number;
  fullName?: string;
  email?: string;
  icNumber?: string;
  phone?: string;
  sport?: string;
  addressLine?: string;
  address?: string;
  createdAt?: string;
  photo?:
    | number
    | string
    | {
        id?: string | number;
        url?: string | null;
        thumbnailURL?: string | null;
        alt?: string | null;
      }
    | null;
};

type MembershipViewDialogProps = {
  open: boolean;
  row: MembershipRow | null;
  onClose: () => void;
};

function sportLabel(sport?: string) {
  if (!sport) return "—";
  const option = membershipSports.find((item) => item.id === sport);
  return option ? `${option.labelEn} / ${option.labelMs}` : sport;
}

function formatDate(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-MY", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function formatPhone(phone?: string) {
  if (!phone) return "—";
  const digits = phone.replace(/\D/g, "");
  return digits ? `+60 ${digits}` : phone;
}

function photoUrl(photo: MembershipRow["photo"]) {
  if (!photo || typeof photo === "number" || typeof photo === "string") {
    return null;
  }
  return photo.thumbnailURL || photo.url || null;
}

function DetailItem({
  label,
  value,
  href,
}: {
  label: string;
  value: string;
  href?: string;
}) {
  return (
    <div className="psr-membership-view__item">
      <dt className="psr-membership-view__label">{label}</dt>
      <dd className="psr-membership-view__value">
        {href ? (
          <a href={href} className="psr-membership-view__link">
            {value}
          </a>
        ) : (
          value
        )}
      </dd>
    </div>
  );
}

export function MembershipViewDialog({
  open,
  row,
  onClose,
}: MembershipViewDialogProps) {
  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open || !row || typeof document === "undefined") return null;

  const image = photoUrl(row.photo);

  return createPortal(
    <div
      className="psr-membership-view__overlay"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="psr-membership-view"
        role="dialog"
        aria-modal="true"
        aria-labelledby="psr-membership-view-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="psr-membership-view__header">
          <div>
            <p className="psr-membership-view__eyebrow">
              Membership registration
            </p>
            <h2
              id="psr-membership-view-title"
              className="psr-membership-view__title"
            >
              {row.fullName || "Member details"}
            </h2>
          </div>
          <button
            type="button"
            className="psr-membership-view__close"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="psr-membership-view__body">
          {image ? (
            <div className="psr-membership-view__photo-wrap">
              {/* eslint-disable-next-line @next/next/no-img-element -- admin preview */}
              <img
                src={image}
                alt={
                  row.fullName ? `${row.fullName} profile photo` : "Profile photo"
                }
                className="psr-membership-view__photo"
              />
            </div>
          ) : null}

          <dl className="psr-membership-view__grid">
            <DetailItem label="Full name" value={row.fullName || "—"} />
            <DetailItem
              label="Email"
              value={row.email || "—"}
              href={row.email ? `mailto:${row.email}` : undefined}
            />
            <DetailItem label="IC number" value={row.icNumber || "—"} />
            <DetailItem
              label="Phone (WhatsApp)"
              value={formatPhone(row.phone)}
              href={
                row.phone
                  ? `https://wa.me/60${row.phone.replace(/\D/g, "")}`
                  : undefined
              }
            />
            <DetailItem
              label="Sport preference"
              value={sportLabel(row.sport)}
            />
            <DetailItem label="Submitted" value={formatDate(row.createdAt)} />
            <DetailItem label="Address line" value={row.addressLine || "—"} />
            <DetailItem label="Full address" value={row.address || "—"} />
          </dl>
        </div>

        <div className="psr-membership-view__footer">
          <Button
            buttonStyle="secondary"
            margin={false}
            onClick={onClose}
            size="small"
          >
            Close
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
