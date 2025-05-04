"use client";

import { useState } from "react";
import { toast } from "sonner";
import { generateBunnySignedUrl } from "@/src/actions/bunny/action";
import { updateOrderItemDownload } from "@/src/actions/prisma/action";

interface UseProductDownloadResult {
  downloadingItems: Record<string, boolean>;
  handleDownload: (item: any, orderId: string) => Promise<void>;
}

export function useProductDownload(
  onDownloadSuccess?: (item: any, orderId: string) => void
): UseProductDownloadResult {
  const [downloadingItems, setDownloadingItems] = useState<Record<string, boolean>>({});

  const handleDownload = async (item: any, orderId: string) => {
    // Skip if already downloaded or currently downloading
    if (
      item.downnloadCount > 0 ||
      item.downloadedAt ||
      downloadingItems[item.id]
    ) {
      return;
    }

    try {
      // Mark this item as currently downloading
      setDownloadingItems((prev) => ({ ...prev, [item.id]: true }));

      // Generate a signed URL that expires in 5 minutes (default)
      const response = await generateBunnySignedUrl(item.product.zip_file_name);

      if (!response.success || !response.url) {
        throw new Error("Download generation failed");
      }

      // Update the OrderItem with download information first
      // This ensures we track the download even if the browser download fails
      const updateResult = await updateOrderItemDownload(item.id);
      
      if (!updateResult) {
        throw new Error("Failed to update download status");
      }

      // Extract filename from zip_file_name
      const fileName =
        item.product.zip_file_name.split("/").pop() ||
        `${item.product.slug}.zip`;

      // Create a temporary anchor element for download
      const downloadLink = document.createElement("a");
      downloadLink.href = response.url;
      downloadLink.download = fileName;
      
      // Trigger click to start download
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      // Call the success callback if provided
      if (onDownloadSuccess) {
        onDownloadSuccess(item, orderId);
      }

      toast.success("Thank you for downloading!", {
        description: `We hope you enjoy ${item.product.name}!`,
      });
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Unable to download file", {
        description: "Please try again later or contact us for assistance.",
      });
    } finally {
      // Clear the downloading status
      setDownloadingItems((prev) => ({ ...prev, [item.id]: false }));
    }
  };

  return { downloadingItems, handleDownload };
}
