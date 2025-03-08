export function sanitizeFileName(fileName: string): string {
  return fileName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function slugifyProductName(fileName: string, category: string): string {
  const fullName = `${fileName} ${category}`;

  return sanitizeFileName(fullName);
}

export async function verifyRecaptcha(
  token: string,
  recaptchaKey: string,
): Promise<boolean> {
  const response = await fetch(
    `https://www.google.com/recaptcha/api/siteverify`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `secret=${recaptchaKey}&response=${token}`,
    },
  );
  const data = await response.json();

  return data.success;
}

/**
 * Generate a safe file name for a product zip file
 */
export function getProductZipFileName(productName: string): string {
  const sanitizedName = sanitizeFileName(productName);

  return `${sanitizedName}-${Date.now()}.zip`;
}

/**
 * Create a file preview URL for client-side display
 */
export function createFilePreview(file: File): string {
  return URL.createObjectURL(file);
}

/**
 * Clean up a file preview URL when no longer needed
 */
export function revokeFilePreview(url: string): void {
  URL.revokeObjectURL(url);
}

/**
 * Normalize tag name and generate a URL-safe slug
 */
export function normalizeTagName(
  tagName: string,
): { name: string; slug: string } | null {
  const normalizedName = tagName.trim().toLowerCase();

  if (!normalizedName) return null;

  const slug = normalizedName
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");

  return {
    name: normalizedName,
    slug,
  };
}
