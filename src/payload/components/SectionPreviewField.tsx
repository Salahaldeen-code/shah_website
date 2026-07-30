"use client";

import type { UIFieldClientComponent } from "payload";
import { useState } from "react";

type PreviewCustom = {
  src?: string;
  alt?: string;
  hint?: string;
};

export const SectionPreviewField: UIFieldClientComponent = ({ field }) => {
  const custom = (field?.admin?.custom ?? {}) as PreviewCustom;
  const src = custom.src;
  const alt = custom.alt ?? "Homepage section preview";
  const hint = custom.hint;
  const [open, setOpen] = useState(false);

  if (!src) return null;

  return (
    <div
      style={{
        marginBottom: "1.25rem",
        padding: "0.75rem",
        borderRadius: "8px",
        border: "1px solid var(--theme-elevation-150)",
        background: "var(--theme-elevation-50)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "0.75rem",
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: "0.72rem",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--theme-elevation-500)",
          }}
        >
          Homepage preview
        </p>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          style={{
            border: "1px solid var(--theme-elevation-150)",
            background: "var(--theme-elevation-0)",
            color: "var(--theme-elevation-800)",
            borderRadius: "6px",
            padding: "0.35rem 0.65rem",
            fontSize: "0.75rem",
            cursor: "pointer",
          }}
        >
          {open ? "Hide preview" : "Show preview"}
        </button>
      </div>
      {hint ? (
        <p
          style={{
            margin: "0.5rem 0 0",
            fontSize: "0.85rem",
            lineHeight: 1.45,
            color: "var(--theme-elevation-800)",
          }}
        >
          {hint}
        </p>
      ) : null}
      {open ? (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          style={{
            display: "block",
            width: "100%",
            maxHeight: "280px",
            objectFit: "contain",
            borderRadius: "6px",
            border: "1px solid var(--theme-elevation-150)",
            background: "#000",
            marginTop: "0.75rem",
          }}
        />
      ) : null}
    </div>
  );
};
