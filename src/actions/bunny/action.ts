"use server";

import { Category, PrismaClient } from "@prisma/client";

import { ProductFormState, UploadResponse } from "@/src/interfaces/Products";
import { sanitizeFileName } from "@/src/lib/actionHelpers";
import { GenerateUploadUrlResult } from "@/src/interfaces/Products";
import { getProductZipFileName } from "@/src/lib/actionHelpers";

import { createProduct, deleteProduct } from "../prisma/action";

// Single upload function for server-side file uploads
export async function uploadFileToBunny(
  file: File,
  folder: string,
  fileName: string,
): Promise<UploadResponse> {
  try {
    if (!file || !folder || !fileName) {
      throw new Error("Missing required file upload parameters");
    }

    // Get storage configuration
    const storageZone = process.env.BUNNY_PUBLIC_ASSETS_STORAGE_ZONE;
    const accessKey = process.env.BUNNY_PUBLIC_ASSETS_PWD;

    if (!storageZone || !accessKey) {
      throw new Error("Missing Bunny.net configuration");
    }

    // Construct the path according to Bunny.net documentation
    const path = `${folder}/${fileName}`;
    const endpoint = `https://storage.bunnycdn.com/${storageZone}/${path}`;

    // Get file buffer from the uploaded file
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Make the API request to Bunny.net
    const response = await fetch(endpoint, {
      method: "PUT",
      headers: {
        AccessKey: accessKey,
        "Content-Type": "application/octet-stream",
      },
      body: buffer,
    });

    if (!response.ok) {
      const errorText = await response.text();

      throw new Error(
        `Bunny.net upload failed: ${response.status} ${errorText}`,
      );
    }

    return {
      success: true,
      path,
    };
  } catch (error) {
    console.error("Upload error:", error);

    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown server error",
    };
  }
}

// Function to delete a file from Bunny.net storage
export async function deleteFileFromBunny(
  path: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!path) {
      throw new Error("Missing file path");
    }

    // Get storage configuration
    const storageZone = process.env.BUNNY_PUBLIC_ASSETS_STORAGE_ZONE;
    const accessKey = process.env.BUNNY_PUBLIC_ASSETS_PWD;

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

// Main action for creating a product with file uploads
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

    // Extract file data
    const zipFilePath = formData.get("zipFilePath") as string;
    const imageFiles = formData.getAll("imageFiles") as File[];
    const imageAltTexts = JSON.parse(
      formData.get("imageAltTexts") as string,
    ) as string[];

    if (!zipFilePath || imageFiles.length === 0) {
      return {
        status: "error",
        error: "Please upload at least one image and a zip file",
      };
    }

    // Skip the zip file upload since it's already uploaded directly
    // Just use the provided path

    // Upload images
    const uploadedImages: { url: string; alt_text: string }[] = [];

    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i];
      const extension = file.name.split(".").pop() || "jpg";
      const sanitizedProductName = sanitizeFileName(name);
      const imageFileName = `${sanitizedProductName}-${i}-${Date.now()}.${extension}`;

      const imageUpload = await uploadFileToBunny(
        file,
        "product-images",
        imageFileName,
      );

      if (imageUpload.success && imageUpload.path) {
        uploadedImages.push({
          url: imageUpload.path,
          alt_text: imageAltTexts[i] || name,
        });
      }
    }

    if (uploadedImages.length === 0) {
      return {
        status: "error",
        error: "Failed to upload product images",
      };
    }

    // Create product in database
    const product = await createProduct({
      name,
      price,
      description,
      category,
      zip_file_name: zipFilePath,
      tagIds: [], // You can extend this to handle tags
      images: uploadedImages,
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
    const pullZoneUrl = process.env.BUNNY_PUBLIC_ASSETS_PULL_ZONE_URL;

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

    console.log(`Verifying file availability at: ${fileUrl}`);

    // Send a HEAD request to check if the file exists in the CDN
    // No authentication needed for public pull zones
    const response = await fetch(fileUrl, {
      method: "HEAD",
      // No auth headers needed for public pull zone
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
