import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";

import {
  generateBunnyUploadUrl,
  verifyBunnyUpload,
  deleteFileFromBunny,
} from "@/src/actions/bunny/action";
import { createFilePreview, revokeFilePreview } from "@/src/lib/actionHelpers";

export interface ImageUploadState {
  file?: File;
  preview: string;
  altText: string;
  status: "existing" | "pending" | "uploading" | "success" | "error";
  progress: number;
  path?: string;
  error?: string;
  id?: string;
}

export function useImageUpload(initialImages: ImageUploadState[] = []) {
  const [productImages, setProductImages] =
    useState<ImageUploadState[]>(initialImages);
  const [isUploadingImages, setIsUploadingImages] = useState(false);

  // Clean up image previews when component unmounts
  useEffect(() => {
    return () => {
      // Only revoke URLs created by createFilePreview, not CDN URLs for existing images
      productImages.forEach((image) => {
        if (image.file) {
          revokeFilePreview(image.preview);
        }
      });
    };
  }, []);

  // Handle new image selection
  const handleImageUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        const newImages = Array.from(e.target.files);

        // Create upload states for new images
        const newImageStates = newImages.map((file) => ({
          file,
          preview: createFilePreview(file),
          altText: "",
          status: "pending" as const,
          progress: 0,
        }));

        setProductImages((prev) => [...prev, ...newImageStates]);
      }
    },
    [],
  );

  // Update image alt text
  const handleAltTextChange = useCallback((index: number, value: string) => {
    setProductImages((prev) => {
      const updated = [...prev];

      updated[index] = {
        ...updated[index],
        altText: value,
      };

      return updated;
    });
  }, []);

  // Update image upload status
  const updateImageStatus = useCallback(
    (
      index: number,
      status: ImageUploadState["status"],
      progress: number = 0,
      error?: string,
      path?: string,
    ) => {
      setProductImages((prev) => {
        const updated = [...prev];

        updated[index] = {
          ...updated[index],
          status,
          progress,
          ...(error && { error }),
          ...(path && { path }),
        };

        return updated;
      });
    },
    [],
  );

  // Remove image
  const removeImage = useCallback(
    async (index: number) => {
      const imageToRemove = productImages[index];

      // If it's an existing image or uploaded image, delete from storage
      if (
        (imageToRemove.status === "existing" ||
          imageToRemove.status === "success") &&
        imageToRemove.path
      ) {
        try {
          const result = await deleteFileFromBunny(imageToRemove.path);

          if (!result.success) {
            console.error(
              `Failed to delete image from storage: ${result.error}`,
            );
            toast.error(
              `The image couldn't be deleted from storage. ${result.error}`,
            );

            return;
          }
        } catch (error) {
          console.error("Error deleting image from storage:", error);

          return;
        }
      }

      // Clean up preview URL for new uploads
      if (imageToRemove.file) {
        revokeFilePreview(imageToRemove.preview);
      }

      // Remove from state
      setProductImages((prev) => prev.filter((_, i) => i !== index));
    },
    [productImages],
  );

  // Upload an image to Bunny
  const uploadImageToBunny = useCallback(
    async (
      imageFile: File,
      productName: string,
      imageIndex: number,
    ): Promise<boolean> => {
      try {
        // Generate upload URL with authentication headers from server
        const urlResult = await generateBunnyUploadUrl(
          `${productName}-image-${Date.now()}-${imageIndex}`,
          "product-images",
        );

        if (
          !urlResult.success ||
          !urlResult.uploadUrl ||
          !urlResult.authHeaders
        ) {
          throw new Error(urlResult.error || "Failed to get upload URL");
        }

        // Upload the file directly to Bunny with progress tracking
        const xhr = new XMLHttpRequest();

        xhr.open("PUT", urlResult.uploadUrl, true);

        // Apply authentication headers
        Object.entries(urlResult.authHeaders).forEach(([key, value]) => {
          xhr.setRequestHeader(key, value);
        });

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percentComplete = Math.round(
              (event.loaded / event.total) * 100,
            );

            updateImageStatus(imageIndex, "uploading", percentComplete);
          }
        };

        // Create a promise to handle the XHR request
        const uploadPromise = new Promise<boolean>((resolve, reject) => {
          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              // Save the file path and update status
              updateImageStatus(
                imageIndex,
                "success",
                100,
                undefined,
                urlResult.filePath,
              );
              resolve(true);
            } else {
              updateImageStatus(
                imageIndex,
                "error",
                0,
                `Upload failed with status ${xhr.status}`,
              );
              reject(new Error(`Upload failed with status ${xhr.status}`));
            }
          };

          xhr.onerror = () => {
            updateImageStatus(
              imageIndex,
              "error",
              0,
              "Network error during upload",
            );
            reject(new Error("Upload failed due to network error"));
          };
        });

        xhr.send(imageFile);
        await uploadPromise;

        // Verify upload
        await verifyBunnyUpload(urlResult.filePath!);

        return true;
      } catch (error) {
        console.error("Error uploading image:", error);

        return false;
      }
    },
    [updateImageStatus],
  );

  // Upload all pending images
  const uploadAllImages = useCallback(
    async (productName: string) => {
      setIsUploadingImages(true);

      try {
        // Filter images that need to be uploaded
        const imagesToUpload = productImages
          .map((img, index) => ({ ...img, index }))
          .filter((img) => img.status === "pending" && img.file);

        if (imagesToUpload.length === 0) {
          return true;
        }

        // Upload each image sequentially
        for (const image of imagesToUpload) {
          updateImageStatus(image.index, "uploading", 0);
          const success = await uploadImageToBunny(
            image.file!,
            productName || "product",
            image.index,
          );

          if (!success) {
            updateImageStatus(
              image.index,
              "error",
              0,
              "Failed to upload image",
            );

            return false;
          }
        }

        return true;
      } catch (error) {
        console.error("Error uploading images:", error);

        return false;
      } finally {
        setIsUploadingImages(false);
      }
    },
    [productImages, uploadImageToBunny, updateImageStatus],
  );

  // Prepare image data for form submission
  const prepareImageDataForSubmission = useCallback(() => {
    return productImages
      .filter((img) => img.path) // Ensure we only include images with paths
      .map((img) => ({
        ...(img.id ? { id: img.id } : {}), // Only include id if it exists
        url: img.path!,
        path: img.path!, // Add path property to match server expectation
        alt_text: img.altText,
      }));
  }, [productImages]);

  // Reset images
  const resetImages = useCallback(() => {
    // Clean up all previews created by createFilePreview
    productImages.forEach((image) => {
      if (image.file) {
        revokeFilePreview(image.preview);
      }
    });
    setProductImages([]);
  }, [productImages]);

  return {
    productImages,
    isUploadingImages,
    handleImageUpload,
    handleAltTextChange,
    uploadAllImages,
    removeImage,
    prepareImageDataForSubmission,
    resetImages,
    setProductImages,
  };
}
