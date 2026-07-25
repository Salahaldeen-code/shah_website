"use client";

import type { UIFieldClientComponent } from "payload";

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
      <p
        style={{
          margin: "0 0 0.5rem",
          fontSize: "0.72rem",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "var(--theme-elevation-500)",
        }}
      >
        Homepage preview
      </p>
      {hint ? (
        <p
          style={{
            margin: "0 0 0.75rem",
            fontSize: "0.85rem",
            lineHeight: 1.45,
            color: "var(--theme-elevation-800)",
          }}
        >
          {hint}
        </p>
      ) : null}
      <img
        src={src}
        alt={alt}
        style={{
          display: "block",
          width: "100%",
          maxHeight: "280px",
          objectFit: "contain",
          borderRadius: "6px",
          border: "1px solid var(--theme-elevation-150)",
          background: "#000",
        }}
      />
    </div>
  );
};
