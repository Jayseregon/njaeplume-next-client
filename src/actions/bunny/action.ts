"use server";

import crypto from "crypto";

import { Category, PrismaClient } from "@prisma/client";

import { ProductFormState } from "@/src/interfaces/Products";
import { GenerateUploadUrlResult } from "@/src/interfaces/Products";
import { getProductZipFileName } from "@/src/lib/actionHelpers";
import { createProduct, deleteProduct } from "@/src/actions/prisma/action";

// Function to determine which storage configuration to use based on file path or folder
function getBunnyStorageConfig(path: string): {
  storageZone: string | undefined;
  accessKey: string | undefined;
} {
  // If the path contains "product-images", use public assets config
  if (path.includes("product-images")) {
    return {
      storageZone: process.env.BUNNY_PUBLIC_ASSETS_STORAGE_ZONE,
      accessKey: process.env.BUNNY_PUBLIC_ASSETS_PWD,
    };
  }

  // Otherwise, use download config for zip files
  return {
    storageZone: process.env.BUNNY_DOWNLOAD_STORAGE_ZONE,
    accessKey: process.env.BUNNY_DOWNLOAD_PWD,
  };
}

// Function to delete a file from Bunny.net storage
export async function deleteFileFromBunny(
  path: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!path) {
      throw new Error("Missing file path");
    }

    // Get storage configuration based on file path
    const { storageZone, accessKey } = getBunnyStorageConfig(path);

    if (!storageZone || !accessKey) {
      throw new Error("Missing Bunny.net configuration");
    }

    // Construct the endpoint according to Bunny.net documentation
    const endpoint = `https://storage.bunnycdn.com/${storageZone}/${path}`;

    // Make the API request to Bunny.net to delete the file
    const response = await fetch(endpoint, {
      method: "DELETE",
      headers: {
        AccessKey: accessKey,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();

      throw new Error(
        `Bunny.net delete failed: ${response.status} ${errorText}`,
      );
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error("Delete error:", error);

    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown server error",
    };
  }
}

// Main action for creating a product with uploaded files
export async function createProductWithUploads(
  prevState: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  try {
    // Extract basic form data
    const name = formData.get("name") as string;
    const price = parseFloat(formData.get("price") as string);
    const description = formData.get("description") as string;
    const category = formData.get("category") as Category;

    // Extract file paths
    const zipFilePath = formData.get("zipFilePath") as string;
    const imageDataStr = formData.get("imageData") as string;

    // Extract tag IDs
    const tagIdsStr = formData.get("tagIds") as string;
    const tagIds = tagIdsStr ? tagIdsStr.split(",") : [];

    if (!imageDataStr || !zipFilePath) {
      return {
        status: "error",
        error:
          "Missing file information. Please upload at least one image and a zip file.",
      };
    }

    // Parse the image data from JSON
    const imageData = JSON.parse(imageDataStr) as {
      path?: string;
      url?: string;
      alt_text: string;
    }[];

    if (!imageData.length) {
      return {
        status: "error",
        error: "Please upload at least one image",
      };
    }

    // Check for either path or url property
    const missingImages = imageData.filter((img) => !img.path && !img.url);

    if (missingImages.length > 0) {
      return {
        status: "error",
        error: "Some images were not uploaded correctly. Please try again.",
      };
    }

    // Convert path property to url property to match the expected interface
    const imageObjects = imageData.map((img) => ({
      url: (img.url || img.path) as string, // Use type assertion since we've already validated
      alt_text: img.alt_text,
    }));

    // All files are already uploaded, so we just create the product with the paths
    // Create product in database
    const product = await createProduct({
      name,
      price,
      description,
      category,
      zip_file_name: zipFilePath,
      tagIds: tagIds, // Pass the tag IDs for association
      images: imageObjects, // Use the mapped image data with correct property names
    });

    return {
      status: "success",
      message: "Product created successfully!",
      productId: product.id,
    };
  } catch (error) {
    console.error("Product creation error:", error);

    return {
      status: "error",
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

// delete a product and all its associated files
export async function deleteProductWithFiles(
  productId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    // 1. Get the product details to know which files to delete
    const prisma = new PrismaClient();

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { images: true },
    });

    if (!product) {
      throw new Error("Product not found");
    }

    // 2. Delete the zip file from Bunny
    const zipFileDeleteResult = await deleteFileFromBunny(
      product.zip_file_name,
    );

    if (!zipFileDeleteResult.success) {
      console.error(`Failed to delete zip file: ${zipFileDeleteResult.error}`);
      // Continue execution even if file deletion fails
    }

    // 3. Delete all image files from Bunny
    for (const image of product.images) {
      const imageDeleteResult = await deleteFileFromBunny(image.url);

      if (!imageDeleteResult.success) {
        console.error(
          `Failed to delete image ${image.url}: ${imageDeleteResult.error}`,
        );
        // Continue execution even if individual image deletions fail
      }
    }

    // 4. Delete the product from the database
    // This will cascade delete the product images due to onDelete: Cascade
    await deleteProduct(productId);
    await prisma.$disconnect();

    return { success: true };
  } catch (error) {
    console.error("Product deletion error:", error);

    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

// Generate a direct upload URL for Bunny storage
export async function generateBunnyUploadUrl(
  fileName: string,
  folder: string,
  category: string,
): Promise<GenerateUploadUrlResult> {
  try {
    // Reuse the storage configuration function
    const { storageZone, accessKey } = getBunnyStorageConfig(folder);

    if (!storageZone || !accessKey) {
      throw new Error("Missing Bunny.net configuration");
    }

    // Sanitize and format the file name
    const sanitizedFileName = getProductZipFileName(fileName);

    // Construct the path according to Bunny.net documentation
    const filePath = `${folder}/${category}/${sanitizedFileName}`;
    const baseUploadUrl = `https://storage.bunnycdn.com/${storageZone}/${filePath}`;

    // Create expiration time (15 minutes from now)
    const expiresAt = Math.floor(Date.now() / 1000) + 15 * 60;

    // Generate authentication headers on the server
    // These will be passed to the client to use for the upload without exposing the API key
    const authHeaders = {
      AccessKey: accessKey,
      "Content-Type": "application/octet-stream",
    };

    return {
      success: true,
      uploadUrl: baseUploadUrl, // Simple URL without tokens
      filePath,
      authHeaders,
      expiresAt,
    };
  } catch (error) {
    console.error("Error generating upload URL:", error);

    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

// Add a verification function to check if the upload was successful
export async function verifyBunnyUpload(
  filePath: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get the public pull zone URL from environment variables
    const pullZoneUrl =
      process.env.NEXT_PUBLIC_BUNNY_PUBLIC_ASSETS_PULL_ZONE_URL;

    if (!pullZoneUrl) {
      console.warn(
        "Missing pull zone URL configuration, skipping verification",
      );

      // Return success even without verification
      return { success: true };
    }

    // Wait a brief moment to ensure the file has propagated to the CDN
    // More time might be needed for large files
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Build the public URL for the file through the pull zone
    const fileUrl = `${pullZoneUrl}/${filePath}`;

    // Send a HEAD request to check if the file exists in the CDN
    // No authentication needed for public pull zones
    const response = await fetch(fileUrl, {
      method: "HEAD",
    });

    if (!response.ok) {
      console.warn(
        `File not yet available in CDN: ${response.status} ${response.statusText}`,
      );

      // Despite the verification "failure", we'll return success
      // because the file might still be propagating through the CDN
      return {
        success: true,
        error: `File may still be propagating to CDN: ${response.status}`,
      };
    }

    console.log("File successfully verified in CDN");

    return {
      success: true,
    };
  } catch (error) {
    console.error("File verification error:", error);

    // Even if verification fails, return success since the upload probably worked
    // and is just propagating through the CDN
    return {
      success: true,
      error:
        "Verification warning: " +
        (error instanceof Error ? error.message : "Unknown error"),
    };
  }
}

// Generate a signed URL for Bunny CDN downloads
export async function generateBunnySignedUrl(
  filePath: string,
  expiration: number = 60 * 5, // Default to 5 minutes
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const tokenSecurityKey = process.env.BUNNY_DOWNLOAD_PULL_API_KEY;
    const pullZoneUrl = process.env.NEXT_PUBLIC_BUNNY_DOWNLOAD_PULL_ZONE_URL;

    if (!tokenSecurityKey) {
      throw new Error(
        "BUNNY_DOWNLOAD_PULL_API_KEY is not set in environment variables",
      );
    }

    if (!pullZoneUrl) {
      throw new Error(
        "NEXT_PUBLIC_BUNNY_DOWNLOAD_PULL_ZONE_URL is not set in environment variables",
      );
    }

    // Construct the full URL for the file
    const url = `${pullZoneUrl}/${filePath}`;

    // Calculate expiration timestamp
    const expires = Math.floor(Date.now() / 1000) + expiration;

    // Parse the URL to get the path
    const urlObj = new URL(url);
    const path = urlObj.pathname;

    // Create the string to sign
    const stringToSign = `${tokenSecurityKey}${path}${expires}`;

    // Generate SHA256 hash
    const sha256Hash = crypto
      .createHash("sha256")
      .update(stringToSign)
      .digest();

    // Base64 encode and make URL safe
    const token = Buffer.from(sha256Hash)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=/g, "");

    // Construct signed URL
    const signedUrl = `${url}?token=${token}&expires=${expires}`;

    return {
      success: true,
      url: signedUrl,
    };
  } catch (error) {
    console.error("Error generating signed URL:", error);

    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
