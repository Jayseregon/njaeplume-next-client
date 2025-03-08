"use client";

import { useEffect, useState } from "react";
import { Category, Tag } from "@prisma/client";
import { useRouter } from "next/navigation";
import { CircleCheckBig, Hourglass, Trash2, Upload, X } from "lucide-react";
import { toast } from "sonner";

import { useProductStore } from "@/src/stores/productStore";
import { updateProduct } from "@/actions/prisma/action";
import {
  deleteProductWithFiles,
  deleteFileFromBunny,
  generateBunnyUploadUrl,
  verifyBunnyUpload,
} from "@/src/actions/bunny/action";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TagInput } from "@/src/components/product/TagInput";
import { Progress } from "@/src/components/ui/progress";
import {
  createFilePreview,
  revokeFilePreview,
  slugifyProductName,
} from "@/src/lib/actionHelpers";

// Interface for image upload state
interface ImageUploadState {
  file?: File;
  preview: string;
  altText: string;
  status: "existing" | "pending" | "uploading" | "success" | "error";
  progress: number;
  path?: string;
  error?: string;
  id?: string;
}

export const ProductEditDialog = () => {
  const router = useRouter();
  const { selectedProduct, isDialogOpen, closeDialog } = useProductStore();
  const [formData, setFormData] = useState<any>({});
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Image state
  const [productImages, setProductImages] = useState<ImageUploadState[]>([]);
  const [isUploadingImages, setIsUploadingImages] = useState(false);

  // Zip file state
  const [productZip, setProductZip] = useState<File | null>(null);
  const [isUploadingZip, setIsUploadingZip] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedZipPath, setUploadedZipPath] = useState<string | null>(null);
  const [showZipUpload, setShowZipUpload] = useState(false);

  // Update form data when selected product changes
  useEffect(() => {
    if (selectedProduct) {
      setFormData({
        id: selectedProduct.id,
        name: selectedProduct.name,
        price: selectedProduct.price,
        description: selectedProduct.description,
        category: selectedProduct.category,
        zip_file_name: selectedProduct.zip_file_name,
        slug: selectedProduct.slug,
      });
      setSelectedTags(selectedProduct.tags || []);

      // Set up existing images
      if (selectedProduct.images && selectedProduct.images.length > 0) {
        setProductImages(
          selectedProduct.images.map((img) => ({
            id: img.id,
            preview: `${process.env.NEXT_PUBLIC_BUNNY_PUBLIC_ASSETS_PULL_ZONE_URL}/${img.url}`,
            altText: img.alt_text,
            status: "existing" as const,
            progress: 100,
            path: img.url,
          })),
        );
      } else {
        setProductImages([]);
      }

      // Set up existing zip file
      setUploadedZipPath(selectedProduct.zip_file_name);
      setShowZipUpload(false);
    }
  }, [selectedProduct]);

  // Clean up image previews when component unmounts or dialog closes
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

  // Helper function to update slug based on name and category
  const updateSlug = (name: string, category: string) => {
    if (name && category) {
      const newSlug = slugifyProductName(name, category);

      setFormData((prev: any) => ({
        ...prev,
        slug: newSlug,
      }));
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;

    setFormData((prev: any) => ({ ...prev, [name]: value }));

    // Auto-update slug when name changes
    if (name === "name" && formData.category) {
      updateSlug(value, formData.category);
    }
  };

  const handleCategoryChange = (value: string) => {
    setFormData((prev: any) => ({
      ...prev,
      category: value,
    }));

    // Auto-update slug when category changes
    if (formData.name) {
      updateSlug(formData.name, value);
    }
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const price = parseFloat(e.target.value);

    setFormData((prev: any) => ({
      ...prev,
      price: isNaN(price) ? 0 : price,
    }));
  };

  const handleTagsChange = (tags: Tag[]) => {
    setSelectedTags(tags);
  };

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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
  };

  // Handle zip file upload
  const handleZipUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProductZip(e.target.files[0]);
    }
  };

  // Remove existing zip to allow uploading a new one
  const handleRemoveExistingZip = async () => {
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
  };

  // Update image alt text
  const handleAltTextChange = (index: number, value: string) => {
    setProductImages((prev) => {
      const updated = [...prev];

      updated[index] = {
        ...updated[index],
        altText: value,
      };

      return updated;
    });
  };

  // Update image upload status
  const updateImageStatus = (
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
  };

  // Remove image
  const removeImage = async (index: number) => {
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
          console.error(`Failed to delete image from storage: ${result.error}`);
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
  };

  // Upload zip file to Bunny
  const uploadZipFileToBunny = async () => {
    if (!productZip) {
      toast.error("Please select a zip file first");

      return false;
    }

    try {
      setIsUploadingZip(true);
      setUploadProgress(0);

      // Generate upload URL with authentication headers from server
      const urlResult = await generateBunnyUploadUrl(
        formData.name || "product",
        "product-files",
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
  };

  // Upload an image to Bunny
  const uploadImageToBunny = async (
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
  };

  // Upload all pending images
  const uploadAllImages = async () => {
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
          formData.name || "product",
          image.index,
        );

        if (!success) {
          updateImageStatus(image.index, "error", 0, "Failed to upload image");

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
  };

  // Get image status indicator
  const getImageStatusIndicator = (
    status: ImageUploadState["status"],
    progress: number,
  ) => {
    switch (status) {
      case "existing":
        return (
          <span className="text-green-600 flex items-center gap-1 text-xs">
            <CircleCheckBig size={16} /> Existing
          </span>
        );
      case "pending":
        return (
          <span className="text-orange-600 flex items-center gap-1 text-xs">
            <Hourglass size={16} /> To Upload
          </span>
        );
      case "uploading":
        return (
          <div className="flex items-center gap-2">
            <Progress className="h-1.5 w-16" value={progress} />
            <span className="text-xs text-muted-foreground">{progress}%</span>
          </div>
        );
      case "success":
        return (
          <span className="text-green-600 flex items-center gap-1 text-xs">
            <CircleCheckBig size={16} /> Uploaded
          </span>
        );
      case "error":
        return (
          <span className="text-red-600 flex items-center gap-1 text-xs">
            <X className="h-4 w-4" size={16} /> Failed
          </span>
        );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.id) return;

    // Check if we have a zip file
    if (!uploadedZipPath) {
      toast.error("Please upload a zip file for the product");

      return;
    }

    // Check if all images are uploaded
    const pendingImages = productImages.filter(
      (img) => img.status === "pending",
    );

    if (pendingImages.length > 0) {
      toast.info("Uploading pending images first...");
      const success = await uploadAllImages();

      if (!success) {
        toast.error("Failed to upload all images");

        return;
      }
    }

    setIsSubmitting(true);
    try {
      // Prepare image data - only include id for existing images
      const imageData = productImages
        .filter((img) => img.path) // Ensure we only include images with paths
        .map((img) => ({
          ...(img.id ? { id: img.id } : {}), // Only include id if it exists
          url: img.path!,
          alt_text: img.altText,
        }));

      // Update product with all data
      await updateProduct({
        ...formData,
        tags: selectedTags,
        images: imageData,
        zip_file_name: uploadedZipPath,
      });

      toast.success("Product updated successfully!");
      closeDialog();
      router.refresh(); // Refresh the page to get updated data
    } catch (error) {
      console.error("Failed to update product:", error);
      toast.error(
        `Failed to update product: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedProduct?.id) return;

    // Instead of confirm, use a state to show a confirmation UI element
    setIsSubmitting(true);
    try {
      const result = await deleteProductWithFiles(selectedProduct.id);

      if (result.success) {
        toast.success("Product deleted successfully");
        closeDialog();
        router.refresh(); // Refresh the page to get updated data
      } else {
        toast.error(`Failed to delete product: ${result.error}`);
      }
    } catch (error) {
      console.error("Failed to delete product:", error);
      toast.error("An error occurred while deleting the product.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!selectedProduct) return null;

  return (
    <Dialog open={isDialogOpen} onOpenChange={closeDialog}>
      <DialogContent
        aria-describedby={undefined}
        className="sm:max-w-[800px] max-h-[80vh] flex flex-col"
      >
        <DialogHeader>
          <DialogTitle className="text-5xl font-bold mb-5 text-foreground">
            Edit Product
          </DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto flex-1 px-6 py-2">
          <form
            className="space-y-4"
            id="edit-product-form"
            onSubmit={handleSubmit}
          >
            <div className="grid gap-4">
              <div className="flex flex-col gap-2">
                <Label className="text-foreground" htmlFor="name">
                  Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name || ""}
                  onChange={handleChange}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label className="text-foreground" htmlFor="price">
                    Price
                  </Label>
                  <Input
                    className="col-span-3"
                    id="price"
                    name="price"
                    step="0.01"
                    type="number"
                    value={formData.price || 0}
                    onChange={handlePriceChange}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label className="text-foreground" htmlFor="category">
                    Category
                  </Label>
                  <Select
                    value={formData.category}
                    onValueChange={handleCategoryChange}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(Category).map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Description Field */}
              <div className="flex flex-col gap-2">
                <Label className="text-foreground" htmlFor="description">
                  Description
                </Label>
                <Textarea
                  className="col-span-3"
                  id="description"
                  name="description"
                  rows={5}
                  value={formData.description || ""}
                  onChange={handleChange}
                />
              </div>

              {/* Tags Field */}
              <div className="flex flex-col gap-2">
                <Label className="text-foreground" htmlFor="tags">
                  Tags
                </Label>
                <div className="col-span-3">
                  <TagInput
                    selectedTags={selectedTags}
                    onChange={handleTagsChange}
                  />
                </div>
              </div>

              {/* Zip file section */}
              <div className="flex flex-col gap-2">
                <Label className="text-foreground" htmlFor="zip_file_name">
                  Zip File
                </Label>
                <div className="col-span-3 space-y-2">
                  {!showZipUpload && uploadedZipPath && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{uploadedZipPath}</span>
                      <Button
                        size="sm"
                        type="button"
                        variant="outline"
                        onClick={handleRemoveExistingZip}
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Replace Zip
                      </Button>
                    </div>
                  )}

                  {(showZipUpload || !uploadedZipPath) && (
                    <div className="flex gap-2">
                      <Input
                        accept=".zip"
                        disabled={isUploadingZip || !!uploadedZipPath}
                        id="productZip"
                        type="file"
                        onChange={handleZipUpload}
                      />
                      {productZip && !uploadedZipPath && (
                        <Button
                          className="whitespace-nowrap"
                          disabled={isUploadingZip}
                          type="button"
                          onClick={uploadZipFileToBunny}
                        >
                          <Upload className="mr-2 h-4 w-4" />
                          Upload Zip
                        </Button>
                      )}
                    </div>
                  )}

                  {isUploadingZip && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span>Uploading...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <Progress className="h-2" value={uploadProgress} />
                    </div>
                  )}
                </div>
              </div>

              {/* Images section */}
              <div className="flex flex-col gap-2">
                <Label className="text-foreground" htmlFor="productImages">
                  Images
                </Label>
                <div className="col-span-3 space-y-3">
                  <div className="flex justify-between gap-2 items-center">
                    <Input
                      multiple
                      accept="image/*"
                      id="productImages"
                      type="file"
                      onChange={handleImageUpload}
                    />
                    {productImages.some((img) => img.status === "pending") && (
                      <Button
                        className="whitespace-nowrap"
                        disabled={isUploadingImages}
                        type="button"
                        onClick={uploadAllImages}
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
                              {getImageStatusIndicator(
                                image.status,
                                image.progress,
                              )}
                            </div>
                            <Button
                              size="icon"
                              type="button"
                              variant="destructive"
                              onClick={() => removeImage(index)}
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
            </div>
          </form>
        </div>

        <DialogFooter className="flex justify-between">
          <Button
            disabled={isSubmitting}
            type="button"
            variant="destructive"
            onClick={handleDelete}
          >
            {isSubmitting ? "Deleting..." : "Delete Product"}
          </Button>
          <div>
            <Button
              className="mr-2"
              type="button"
              variant="outline"
              onClick={closeDialog}
            >
              Cancel
            </Button>
            <Button
              disabled={isSubmitting || isUploadingImages || isUploadingZip}
              form="edit-product-form"
              type="submit"
            >
              {isSubmitting ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
