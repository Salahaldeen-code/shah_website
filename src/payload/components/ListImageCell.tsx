"use client";

import type { DefaultCellComponentProps, UploadFieldClient } from "payload";
import {
  Thumbnail,
  useConfig,
  useListRelationships,
} from "@payloadcms/ui";
import { getBestFitFromSizes, isImage } from "payload/shared";
import { useEffect, useState } from "react";

function mediaId(cellData: unknown): string | number | null {
  if (typeof cellData === "number" || typeof cellData === "string") {
    return cellData;
  }
  if (cellData && typeof cellData === "object" && "id" in cellData) {
    const id = (cellData as { id?: string | number }).id;
    return id ?? null;
  }
  return null;
}

function isMediaRecord(
  value: unknown,
): value is Record<string, unknown> & { url?: string; thumbnailURL?: string } {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

export function ListImageCell(props: DefaultCellComponentProps) {
  const { cellData, field } = props;
  const uploadField = field as UploadFieldClient;
  const relationTo =
    typeof uploadField.relationTo === "string"
      ? uploadField.relationTo
      : "media";

  const { getEntityConfig } = useConfig();
  const { documents, getRelationships } = useListRelationships();
  const [requested, setRequested] = useState(false);

  const id = mediaId(cellData);
  const stored = id != null ? documents?.[relationTo]?.[id] : undefined;
  const fromCell =
    isMediaRecord(cellData) && ("url" in cellData || "thumbnailURL" in cellData)
      ? cellData
      : null;
  const media =
    fromCell ?? (isMediaRecord(stored) ? stored : null);
  const failed = stored === false;
  const loading = id != null && !media && !failed;

  useEffect(() => {
    if (id == null || requested || media || failed) return;
    getRelationships([{ relationTo, value: id }]);
    setRequested(true);
  }, [failed, getRelationships, id, media, relationTo, requested]);

  useEffect(() => {
    setRequested(false);
  }, [id]);

  if (id == null || failed) {
    return <span className="psr-list-image psr-list-image--empty">—</span>;
  }

  if (loading || !media) {
    return <span className="psr-list-image psr-list-image--empty">…</span>;
  }

  const collectionConfig = getEntityConfig({ collectionSlug: relationTo });
  const mimeType =
    typeof media.mimeType === "string" ? media.mimeType : undefined;
  const url = typeof media.url === "string" ? media.url : undefined;
  const thumbnailURL =
    typeof media.thumbnailURL === "string" ? media.thumbnailURL : undefined;
  const width = typeof media.width === "number" ? media.width : undefined;
  const sizes =
    media.sizes && typeof media.sizes === "object"
      ? (media.sizes as Record<string, { url?: string; width?: number }>)
      : undefined;

  const fileSrc = isImage(mimeType ?? "")
    ? getBestFitFromSizes({
        sizes,
        thumbnailURL,
        url: url ?? "",
        width,
      })
    : thumbnailURL || url;

  if (!fileSrc) {
    return <span className="psr-list-image psr-list-image--empty">—</span>;
  }

  const uploadConfig =
    typeof collectionConfig?.upload === "object"
      ? collectionConfig.upload
      : undefined;
  const imageCacheTag =
    uploadConfig && "cacheTags" in uploadConfig && uploadConfig.cacheTags
      ? typeof media.updatedAt === "string"
        ? media.updatedAt
        : undefined
      : undefined;

  return (
    <span className="psr-list-image">
      <Thumbnail
        className="psr-list-image__thumb"
        collectionSlug={relationTo}
        doc={media}
        fileSrc={fileSrc}
        imageCacheTag={imageCacheTag}
        size="small"
        uploadConfig={uploadConfig}
      />
    </span>
  );
}
