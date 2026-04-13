import { v2 as cloudinary } from "cloudinary";

let isConfigured = false;

const configureCloudinary = () => {
  if (isConfigured) return;

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    console.warn(
      "Cloudinary is not fully configured. Skipping image deletion cleanup.",
    );
    return;
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });

  isConfigured = true;
};

const extractPublicIdFromCloudinaryUrl = (imageUrl) => {
  try {
    const parsed = new URL(imageUrl);

    if (!parsed.hostname.includes("cloudinary.com")) {
      return null;
    }

    const parts = parsed.pathname.split("/").filter(Boolean);
    const uploadIndex = parts.findIndex((part) => part === "upload");

    if (uploadIndex === -1) {
      return null;
    }

    const idParts = parts.slice(uploadIndex + 1);

    if (!idParts.length) {
      return null;
    }

    if (/^v\d+$/.test(idParts[0])) {
      idParts.shift();
    }

    if (!idParts.length) {
      return null;
    }

    idParts[idParts.length - 1] = idParts[idParts.length - 1].replace(
      /\.[^/.]+$/,
      "",
    );

    return idParts.join("/");
  } catch (error) {
    return null;
  }
};

export const deleteCloudinaryImagesByUrls = async (urls = []) => {
  configureCloudinary();

  if (!isConfigured || !Array.isArray(urls) || urls.length === 0) {
    return;
  }

  const publicIds = [...new Set(urls.map(extractPublicIdFromCloudinaryUrl).filter(Boolean))];

  if (publicIds.length === 0) {
    return;
  }

  await Promise.allSettled(
    publicIds.map((publicId) =>
      cloudinary.uploader.destroy(publicId, {
        resource_type: "image",
        invalidate: true,
      }),
    ),
  );
};

export const getRemovedCloudinaryUrls = (previousUrls = [], nextUrls = []) => {
  const previous = new Set(
    (Array.isArray(previousUrls) ? previousUrls : [previousUrls]).filter(Boolean),
  );
  const next = new Set(
    (Array.isArray(nextUrls) ? nextUrls : [nextUrls]).filter(Boolean),
  );

  return [...previous].filter((url) => !next.has(url));
};
