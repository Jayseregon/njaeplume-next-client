import React from "react";
import { Upload, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { ImageStatusIndicator } from "@/src/components/product/ImageStatusIndicator";
import { useImageUpload } from "@/src/hooks/useImageUpload";

interface ProductImageUploaderProps {
  imageUploadHook: ReturnType<typeof useImageUpload>;
  productName: string;
}

export const ProductImageUploader: React.FC<ProductImageUploaderProps> = ({
  imageUploadHook,
  productName,
}) => {
  const {
    productImages,
    isUploadingImages,
    handleImageUpload,
    handleAltTextChange,
    uploadAllImages,
    removeImage,
  } = imageUploadHook;

  // Check if any images need to be uploaded
  const hasPendingImages = productImages.some(
    (img) => img.status === "pending",
  );

  const handleUploadAllClick = async () => {
    if (!hasPendingImages) {
      toast.info("No pending images to upload");

      return;
    }

    await uploadAllImages(productName);
  };

  const handleRemoveImageClick = async (index: number) => {
    await removeImage(index);
  };

  return (
    <div className="flex flex-col gap-2">
      <Label className="text-foreground" htmlFor="productImages">
        Images
      </Label>
      <div className="space-y-3">
        <div className="flex justify-between gap-2 items-center">
          <Input
            multiple
            accept="image/*"
            id="productImages"
            type="file"
            onChange={handleImageUpload}
          />
          {hasPendingImages && (
            <Button
              className="whitespace-nowrap"
              disabled={isUploadingImages}
              type="button"
              onClick={handleUploadAllClick}
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload New Images
            </Button>
          )}
        </div>

        {/* Image previews with upload status */}
        {productImages.length > 0 && (
          <div className="border rounded-md p-4">
            <h3 className="font-medium mb-2">Product Images</h3>
            <div className="space-y-3">
              {productImages.map((image, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="h-16 w-16 rounded-md overflow-hidden">
                    <img
                      alt={`Preview ${index}`}
                      className="h-full w-full object-cover"
                      src={image.preview}
                    />
                  </div>
                  <div className="flex-1">
                    <Input
                      placeholder="Alt text"
                      value={image.altText}
                      onChange={(e) =>
                        handleAltTextChange(index, e.target.value)
                      }
                    />
                  </div>
                  <div className="w-24">
                    <ImageStatusIndicator
                      progress={image.progress}
                      status={image.status}
                    />
                  </div>
                  <Button
                    size="icon"
                    type="button"
                    variant="destructive"
                    onClick={() => handleRemoveImageClick(index)}
                  >
                    <Trash2 />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
