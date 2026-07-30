export type CloudinaryCredentials = {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
  /** Asset folder every upload is nested under, e.g. "psr". */
  folder: string;
};

export function readCloudinaryCredentials(): CloudinaryCredentials | null {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) return null;

  return {
    cloudName,
    apiKey,
    apiSecret,
    folder: process.env.CLOUDINARY_FOLDER || "psr",
  };
}
