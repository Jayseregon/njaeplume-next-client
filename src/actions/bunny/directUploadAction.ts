"use server";

import { getProductZipFileName } from "@/src/lib/actionHelpers";

interface GenerateUploadUrlResult {
  success: boolean;
  uploadUrl?: string;
  filePath?: string;
  error?: string;
}

// Generate a direct upload URL for Bunny storage
export async function generateBunnyUploadUrl(
  fileName: string,
  folder: string = "product-files",
): Promise<GenerateUploadUrlResult> {
  try {
    const storageZone = process.env.BUNNY_PUBLIC_ASSETS_STORAGE_ZONE;
    const accessKey = process.env.BUNNY_PUBLIC_ASSETS_PWD;

    if (!storageZone || !accessKey) {
      throw new Error("Missing Bunny.net configuration");
    }

    // Sanitize and format the file name
    const sanitizedFileName = getProductZipFileName(fileName);

    // Construct the path according to Bunny.net documentation
    const filePath = `${folder}/${sanitizedFileName}`;
    const uploadUrl = `https://storage.bunnycdn.com/${storageZone}/${filePath}`;

    return {
      success: true,
      uploadUrl,
      filePath,
    };
  } catch (error) {
    console.error("Error generating upload URL:", error);

    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
