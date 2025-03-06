"use server";

import { Category, PrismaClient } from "@prisma/client";

import { ProductFormState, UploadResponse } from "@/src/interfaces/Products";
import { sanitizeFileName } from "@/src/lib/actionHelpers";

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
    const zipFile = formData.get("zipFile") as File;
    const imageFiles = formData.getAll("imageFiles") as File[];
    const imageAltTexts = JSON.parse(
      formData.get("imageAltTexts") as string,
    ) as string[];

    if (!zipFile || imageFiles.length === 0) {
      return {
        status: "error",
        error: "Please upload at least one image and a zip file",
      };
    }

    // 1. Upload zip file
    const sanitizedProductName = sanitizeFileName(name);
    const zipFileName = `${sanitizedProductName}-${Date.now()}.zip`;

    const zipUpload = await uploadFileToBunny(
      zipFile,
      "product-files",
      zipFileName,
    );

    if (!zipUpload.success || !zipUpload.path) {
      return {
        status: "error",
        error: zipUpload.error || "Failed to upload zip file",
      };
    }

    // 2. Upload images
    const uploadedImages: { url: string; alt_text: string }[] = [];

    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i];
      const extension = file.name.split(".").pop() || "jpg";
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

    // 3. Create product in database
    const product = await createProduct({
      name,
      price,
      description,
      category,
      zip_file_name: zipUpload.path,
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
