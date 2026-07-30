"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast, useDocumentInfo, useField } from "@payloadcms/ui";

type MediaRef =
  | string
  | number
  | {
      url?: string | null;
      thumbnailURL?: string | null;
      sizes?: Record<string, { url?: string | null } | null>;
    }
  | null
  | undefined;

type MemberDoc = {
  id: string | number;
  name?: string | null;
  role?: string | null;
  order?: number | null;
  image?: MediaRef;
};

type ChartMember = {
  id: string;
  name: string;
  role: string;
  order: number;
  imageUrl: string | null;
};

function mediaSrc(image: MediaRef): string | null {
  if (!image || typeof image === "string" || typeof image === "number") {
    return null;
  }
  return (
    image.thumbnailURL ||
    image.sizes?.thumbnail?.url ||
    image.url ||
    null
  );
}

function toChartMember(doc: MemberDoc): ChartMember {
  return {
    id: String(doc.id),
    name: doc.name?.trim() || "Untitled",
    role: doc.role?.trim() || "—",
    order: typeof doc.order === "number" ? doc.order : 0,
    imageUrl: mediaSrc(doc.image),
  };
}

/**
 * Sidebar org-chart under Order: shows how members appear on the About page,
 * highlights the current member, and lets admins drag to swap positions
 * (auto-writes Order numbers).
 */
export function CommitteeOrderPreview() {
  const { id } = useDocumentInfo();
  const { value: orderValue, setValue: setOrder } = useField<number>({
    path: "order",
  });
  const currentId = id != null ? String(id) : null;

  const [members, setMembers] = useState<ChartMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch(
        "/api/committee-members?limit=50&depth=1&sort=order&select[name]=true&select[role]=true&select[order]=true&select[image]=true",
        { credentials: "include" },
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as { docs?: MemberDoc[] };
      const next = (data.docs ?? [])
        .map(toChartMember)
        .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));
      setMembers(next);
    } catch {
      toast.error("Could not load organization chart");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const sorted = useMemo(
    () => [...members].sort((a, b) => a.order - b.order || a.name.localeCompare(b.name)),
    [members],
  );

  const persistOrder = useCallback(
    async (next: ChartMember[]) => {
      setSaving(true);
      setMembers(next);

      const me = currentId
        ? next.find((m) => m.id === currentId)
        : undefined;
      if (me) {
        setOrder(me.order);
      }

      try {
        const results = await Promise.all(
          next.map((m) =>
            fetch(`/api/committee-members/${m.id}`, {
              method: "PATCH",
              credentials: "include",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ order: m.order }),
            }),
          ),
        );
        if (results.some((r) => !r.ok)) {
          throw new Error("One or more updates failed");
        }
        toast.success("Organization order saved");
      } catch {
        toast.error("Failed to save order — reloading");
        await load();
      } finally {
        setSaving(false);
      }
    },
    [currentId, load, setOrder],
  );

  const moveBefore = useCallback(
    async (fromId: string, toId: string) => {
      if (fromId === toId || saving) return;
      const list = [...sorted];
      const fromIndex = list.findIndex((m) => m.id === fromId);
      const toIndex = list.findIndex((m) => m.id === toId);
      if (fromIndex < 0 || toIndex < 0) return;

      const [item] = list.splice(fromIndex, 1);
      list.splice(toIndex, 0, item);

      const next = list.map((m, index) => ({ ...m, order: index }));
      await persistOrder(next);
    },
    [persistOrder, saving, sorted],
  );

  const applySlot = useCallback(
    (slot: number) => {
      if (saving) return;
      setOrder(slot);
      toast.success(`Order set to ${slot}`);
    },
    [saving, setOrder],
  );

  return (
    <div
      style={{
        marginTop: "0.75rem",
        padding: "0.75rem",
        borderRadius: 8,
        border: "1px solid var(--theme-elevation-150)",
        background: "var(--theme-elevation-50)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: "0.5rem",
          marginBottom: "0.55rem",
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
          Organization chart
        </p>
        <span
          style={{
            fontSize: "0.7rem",
            color: "var(--theme-elevation-500)",
          }}
        >
          {saving ? "Saving…" : `Current order: ${orderValue ?? 0}`}
        </span>
      </div>

      <p
        style={{
          margin: "0 0 0.75rem",
          fontSize: "0.8rem",
          lineHeight: 1.45,
          color: "var(--theme-elevation-800)",
        }}
      >
        Same order as the About page. Drag to swap places (numbers update
        automatically), or click a number to copy it into Order.
      </p>

      {loading ? (
        <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--theme-elevation-500)" }}>
          Loading members…
        </p>
      ) : sorted.length === 0 ? (
        <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--theme-elevation-500)" }}>
          No committee members yet. Save this member first, then reorder.
        </p>
      ) : (
        <ul
          style={{
            listStyle: "none",
            margin: 0,
            padding: 0,
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          {sorted.map((member) => {
            const isCurrent = currentId === member.id;
            const isDragging = dragId === member.id;
            const isOver = overId === member.id && dragId !== member.id;

            return (
              <li
                key={member.id}
                draggable={!saving}
                onDragStart={(e) => {
                  setDragId(member.id);
                  e.dataTransfer.effectAllowed = "move";
                  e.dataTransfer.setData("text/plain", member.id);
                }}
                onDragEnd={() => {
                  setDragId(null);
                  setOverId(null);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = "move";
                  if (overId !== member.id) setOverId(member.id);
                }}
                onDragLeave={() => {
                  if (overId === member.id) setOverId(null);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  const from =
                    e.dataTransfer.getData("text/plain") || dragId || "";
                  setOverId(null);
                  setDragId(null);
                  if (from) void moveBefore(from, member.id);
                }}
                style={{
                  display: "grid",
                  gridTemplateColumns: "28px 40px 1fr",
                  alignItems: "center",
                  gap: 8,
                  padding: "6px 8px",
                  borderRadius: 8,
                  border: isCurrent
                    ? "1px solid var(--theme-success-500)"
                    : isOver
                      ? "1px dashed var(--theme-elevation-400)"
                      : "1px solid var(--theme-elevation-150)",
                  background: isCurrent
                    ? "color-mix(in srgb, var(--theme-success-500) 12%, var(--theme-elevation-0))"
                    : "var(--theme-elevation-0)",
                  opacity: isDragging ? 0.45 : 1,
                  cursor: saving ? "default" : "grab",
                }}
                title={
                  isCurrent
                    ? "You are editing this member"
                    : "Drag to change position"
                }
              >
                <button
                  type="button"
                  onClick={() => applySlot(member.order)}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 6,
                    border: "1px solid var(--theme-elevation-200)",
                    background: "var(--theme-elevation-100)",
                    color: "var(--theme-elevation-800)",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    padding: 0,
                  }}
                  title={`Set Order to ${member.order}`}
                >
                  {member.order}
                </button>

                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 8,
                    overflow: "hidden",
                    background: "var(--theme-elevation-100)",
                    border: "1px solid var(--theme-elevation-150)",
                  }}
                >
                  {member.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element -- admin sidebar preview
                    <img
                      src={member.imageUrl}
                      alt=""
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : null}
                </div>

                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      color: "var(--theme-elevation-900)",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {member.name}
                    {isCurrent ? (
                      <span
                        style={{
                          marginLeft: 6,
                          fontSize: "0.65rem",
                          letterSpacing: "0.06em",
                          textTransform: "uppercase",
                          color: "var(--theme-success-500)",
                        }}
                      >
                        You
                      </span>
                    ) : null}
                  </div>
                  <div
                    style={{
                      fontSize: "0.72rem",
                      color: "var(--theme-elevation-500)",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {member.role}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
