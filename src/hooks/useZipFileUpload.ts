import { useState, useCallback } from "react";
import { toast } from "sonner";

import {
  generateBunnyUploadUrl,
  verifyBunnyUpload,
  deleteFileFromBunny,
} from "@/src/actions/bunny/action";

export function useZipFileUpload(initialZipPath: string | null = null) {
  const [productZip, setProductZip] = useState<File | null>(null);
  const [isUploadingZip, setIsUploadingZip] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedZipPath, setUploadedZipPath] = useState<string | null>(
    initialZipPath,
  );
  const [showZipUpload, setShowZipUpload] = useState(!initialZipPath);

  // Handle zip file selection
  const handleZipUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        setProductZip(e.target.files[0]);
      }
    },
    [],
  );

  // Upload zip file to Bunny
  const uploadZipFileToBunny = useCallback(
    async (productName: string, category: string): Promise<boolean> => {
      if (!productZip) {
        toast.error("Please select a zip file first");

        return false;
      }

      try {
        setIsUploadingZip(true);
        setUploadProgress(0);

        toast.info("Uploading zip file...");

        // Generate upload URL with authentication headers from server
        const urlResult = await generateBunnyUploadUrl(
          productName,
          "product-files",
          category,
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

            setUploadProgress(percentComplete);
          }
        };

        // Create a promise to handle the XHR request
        const uploadPromise = new Promise<boolean>((resolve, reject) => {
          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              // Save the file path for later use in form submission
              setUploadedZipPath(urlResult.filePath || "");
              resolve(true);
            } else {
              reject(new Error(`Upload failed with status ${xhr.status}`));
            }
          };

          xhr.onerror = () => {
            reject(new Error("Upload failed due to network error"));
          };
        });

        xhr.send(productZip);
        await uploadPromise;

        // Verify upload
        await verifyBunnyUpload(urlResult.filePath!);

        toast.success("Zip file uploaded successfully");

        return true;
      } catch (error) {
        console.error("Error uploading zip file:", error);
        toast.error(
          `Upload failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        );

        return false;
      } finally {
        setIsUploadingZip(false);
      }
    },
    [productZip],
  );

  // Remove existing zip to allow uploading a new one
  const handleRemoveExistingZip = useCallback(async () => {
    // Only attempt deletion if we have a path
    if (uploadedZipPath) {
      try {
        setIsUploadingZip(true);

        // Delete the file from Bunny storage
        const result = await deleteFileFromBunny(uploadedZipPath);

        if (!result.success) {
          // Deletion failed
          toast.error(`Failed to delete zip file: ${result.error}`);

          return; // Don't proceed with reset if deletion failed
        }

        // If successful, toast success message
        toast.success("Previous zip file deleted successfully");
      } catch (error) {
        // Handle unexpected errors
        console.error("Error deleting zip file:", error);
        toast.error("An error occurred while deleting the zip file");

        return; // Don't proceed if there was an error
      } finally {
        setIsUploadingZip(false);
      }
    }

    // Reset state to allow new upload
    setShowZipUpload(true);
    setUploadedZipPath(null);
  }, [uploadedZipPath]);

  // Reset the zip file state
  const resetZip = useCallback(() => {
    setProductZip(null);
    setUploadProgress(0);
    setUploadedZipPath(null);
    setShowZipUpload(true);
  }, []);

  return {
    productZip,
    isUploadingZip,
    uploadProgress,
    uploadedZipPath,
    showZipUpload,
    handleZipUpload,
    uploadZipFileToBunny,
    handleRemoveExistingZip,
    setUploadedZipPath,
    resetZip,
    setShowZipUpload,
  };
}
