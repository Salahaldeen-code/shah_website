"use client";

import type { DefaultCellComponentProps } from "payload";
import { Button, toast, useConfig } from "@payloadcms/ui";
import { formatAdminURL } from "payload/shared";
import { useRouter } from "next/navigation.js";
import { useState, useTransition } from "react";

import { MembershipViewDialog } from "@/payload/components/MembershipViewDialog";

export function MembershipRowActions(props: DefaultCellComponentProps) {
  const { collectionSlug, rowData } = props;
  const id = rowData?.id;
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [deleting, setDeleting] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [viewRow, setViewRow] = useState<Record<string, unknown> | null>(null);
  const [loadingView, setLoadingView] = useState(false);
  const {
    config: {
      routes: { admin: adminRoute, api },
    },
  } = useConfig();

  if (id == null) return null;

  const editHref = formatAdminURL({
    adminRoute,
    path: `/collections/${collectionSlug}/${id}`,
  });

  const onView = async () => {
    setLoadingView(true);
    try {
      const res = await fetch(`${api}/${collectionSlug}/${id}?depth=1`, {
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        throw new Error(`Could not load registration (${res.status})`);
      }

      const data = (await res.json()) as Record<string, unknown> | { doc: Record<string, unknown> };
      const doc = "doc" in data && data.doc ? data.doc : data;
      setViewRow(doc);
      setViewOpen(true);
    } catch (error) {
      if (rowData && typeof rowData === "object") {
        setViewRow(rowData as Record<string, unknown>);
        setViewOpen(true);
        return;
      }

      toast.error(error instanceof Error ? error.message : "Could not open view");
    } finally {
      setLoadingView(false);
    }
  };

  const onDelete = async () => {
    const title = String(rowData?.fullName ?? "this registration");
    const confirmed = window.confirm(
      `Delete “${title}”? This cannot be undone.`,
    );
    if (!confirmed) return;

    setDeleting(true);
    try {
      const res = await fetch(`${api}/${collectionSlug}/${id}`, {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        throw new Error(`Delete failed (${res.status})`);
      }

      toast.success("Deleted");
      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div
        className="psr-list-row-actions"
        onClick={(event) => event.stopPropagation()}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <Button
          buttonStyle="secondary"
          disabled={loadingView}
          margin={false}
          onClick={onView}
          size="small"
        >
          {loadingView ? "…" : "View"}
        </Button>
        <Button
          buttonStyle="secondary"
          el="link"
          margin={false}
          size="small"
          to={editHref}
        >
          Edit
        </Button>
        <Button
          buttonStyle="error"
          disabled={pending || deleting}
          margin={false}
          onClick={onDelete}
          size="small"
        >
          {deleting ? "…" : "Delete"}
        </Button>
      </div>

      <MembershipViewDialog
        open={viewOpen}
        row={viewRow}
        onClose={() => {
          setViewOpen(false);
          setViewRow(null);
        }}
      />
    </>
  );
}
