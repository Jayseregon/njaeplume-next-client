"use client";

import {
  useActionState,
  useState,
  useRef,
  startTransition,
  useEffect,
  useCallback,
} from "react";
import { Category, Tag } from "@prisma/client";
import { CircleCheckBig, Hourglass, Trash2, Upload, X } from "lucide-react";

import { PageTitle } from "@/src/components/root/PageTitle";
import ErrorBoundary from "@/src/components/root/ErrorBoundary";
import { ErrorDefaultDisplay } from "@/src/components/root/ErrorDefaultDisplay";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Textarea } from "@/src/components/ui/textarea";
import { Label } from "@/src/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { Card, CardContent } from "@/src/components/ui/card";
import { Progress } from "@/src/components/ui/progress";
import {
  createProductWithUploads,
  generateBunnyUploadUrl,
  verifyBunnyUpload,
  deleteFileFromBunny,
} from "@/src/actions/bunny/action";
import { createFilePreview, revokeFilePreview } from "@/src/lib/actionHelpers";
import { ProductFormState } from "@/src/interfaces/Products";
import { TagInput } from "@/src/components/product/TagInput";

// Initial state for the form
const initialState: ProductFormState = { status: "idle" };

interface ImageUploadState {
  file: File;
  preview: string;
  altText: string;
  status: "pending" | "uploading" | "success" | "error";
  progress: number;
  path?: string;
  error?: string;
}

export default function NewProductPage() {
  // Form and file state
  const formRef = useRef<HTMLFormElement>(null);
  const [productImages, setProductImages] = useState<ImageUploadState[]>([]);
  const [productZip, setProductZip] = useState<File | null>(null);
  const [formReset, setFormReset] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);

  // Direct upload state
  const [isUploadingZip, setIsUploadingZip] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedZipPath, setUploadedZipPath] = useState<string | null>(null);
  const [isUploadingImages, setIsUploadingImages] = useState(false);

  // Form action state
  const [formState, formAction, isPending] = useActionState(
    createProductWithUploads,
    initialState,
  );

  // Clean up image previews when component unmounts
  useEffect(() => {
    return () => {
      // Revoke all object URLs to avoid memory leaks
      productImages.forEach((image) => revokeFilePreview(image.preview));
    };
  }, []); // Empty dependency array since this runs only on unmount

  // Reset form and state after successful submission
  useEffect(() => {
    if (formState.status === "success" && !formReset) {
      // Set flag to prevent multiple resets
      setFormReset(true);

      // Clean up all previews
      productImages.forEach((image) => revokeFilePreview(image.preview));

      // Reset state in a single batch
      setProductImages([]);
      setProductZip(null);
      setSelectedCategory(null);
      setSelectedTags([]);
      setUploadedZipPath(null);
      setUploadProgress(0);

      // Reset form
      if (formRef.current) {
        formRef.current.reset();
      }
    } else if (formState.status !== "success" && formReset) {
      // Reset the flag when form status changes from success
      setFormReset(false);
    }
  }, [formState.status, formReset, productImages]);

  // Handle form submission with file paths
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Client-side validation
    if (productImages.length === 0) {
      alert("Please upload at least one image");

      return;
    }

    // Check if all images are uploaded
    const pendingImages = productImages.filter(
      (img) => img.status !== "success",
    );

    if (pendingImages.length > 0) {
      // If there are pending images, try to upload them first
      const confirmed = window.confirm(
        "Some images haven't been uploaded yet. Would you like to upload them now?",
      );

      if (confirmed) {
        await uploadAllImages();

        return; // Return and wait for uploads to complete
      } else {
        return; // User cancelled
      }
    }

    try {
      // If zip is not uploaded yet, upload it directly to Bunny first
      if (!uploadedZipPath && productZip) {
        const uploadSuccessful = await uploadZipFileToBunny();

        if (!uploadSuccessful) return;
      }

      // If we don't have a zip path at this point, something went wrong
      if (!uploadedZipPath) {
        alert("Please upload a zip file");

        return;
      }

      const form = e.currentTarget;
      const formData = new FormData(form);

      // Instead of the actual files, pass the paths of the uploaded files
      formData.set("zipFilePath", uploadedZipPath);

      // Add image paths and alt texts
      const imageData = productImages.map((img) => ({
        path: img.path,
        alt_text: img.altText,
      }));

      formData.set("imageData", JSON.stringify(imageData));

      // Submit form within a transition to avoid blocking UI
      startTransition(() => {
        formAction(formData);
      });
    } catch (error) {
      console.error("Form submission error:", error);
      alert(
        `Form submission failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  };

  // Upload all pending images
  const uploadAllImages = async () => {
    setIsUploadingImages(true);

    try {
      // Filter images that need to be uploaded
      const imagesToUpload = productImages
        .map((img, index) => ({ ...img, index }))
        .filter((img) => img.status !== "success");

      if (imagesToUpload.length === 0) {
        return true;
      }

      // Upload each image sequentially
      for (const image of imagesToUpload) {
        // Update status to uploading
        updateImageStatus(image.index, "uploading", 0);

        // Get product name from form for file naming
        // Fix: Access input element correctly
        const nameInput = formRef.current?.querySelector(
          "#name",
        ) as HTMLInputElement;
        const productName = nameInput?.value || "product";

        // Upload the image
        const success = await uploadImageToBunny(
          image.file,
          productName,
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

  // Handle image uploads
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

      // Update state
      setProductImages((prev) => [...prev, ...newImageStates]);
    }
  };

  // Handle zip file upload
  const handleZipUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProductZip(e.target.files[0]);
    }
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

  // Upload a single image to Bunny
  const uploadImageToBunny = async (
    imageFile: File,
    productName: string,
    imageIndex: number,
  ): Promise<boolean> => {
    try {
      // Generate upload URL with authentication headers from server
      const urlResult = await generateBunnyUploadUrl(
        `${productName}-image-${imageIndex}`,
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

      // Apply all authentication headers from the server
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

      // After upload is complete, verify on the server side
      try {
        await verifyBunnyUpload(urlResult.filePath!);
      } catch (error) {
        console.warn("Image verification warning:", error);
        // Continue anyway since the upload probably worked
      }

      return true;
    } catch (error) {
      console.error("Error uploading image:", error);

      return false;
    }
  };

  // Handle direct upload of zip file to Bunny
  const uploadZipFileToBunny = useCallback(async () => {
    if (!productZip || !formRef.current) {
      alert("Please select a zip file first");

      return false;
    }

    try {
      setIsUploadingZip(true);
      setUploadProgress(0);

      // Get product name from the form
      // Fix: Access input element correctly
      const nameInput = formRef.current.querySelector(
        "#name",
      ) as HTMLInputElement;
      const productName = nameInput?.value;

      if (!productName) {
        alert("Please enter a product name first");
        setIsUploadingZip(false);

        return false;
      }

      // Generate upload URL with authentication headers from server
      const urlResult = await generateBunnyUploadUrl(
        productName,
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

      // Apply all authentication headers from the server
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

      // After upload is complete, verify on the server side
      try {
        await verifyBunnyUpload(urlResult.filePath!);
      } catch (error) {
        console.warn("Verification warning:", error);
      }

      return true;
    } catch (error) {
      console.error("Error uploading zip file:", error);
      alert(
        `Upload failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );

      return false;
    } finally {
      setIsUploadingZip(false);
    }
  }, [productZip]);

  // Handle alt text changes
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

  // Handle category selection
  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value as Category);
  };

  // Handle tag selection changes
  const handleTagsChange = (tags: Tag[]) => {
    setSelectedTags(tags);
  };

  // Remove an image
  const removeImage = async (index: number) => {
    const imageToRemove = productImages[index];

    // If image was successfully uploaded to Bunny, delete it from storage
    if (imageToRemove.status === "success" && imageToRemove.path) {
      try {
        // Delete from Bunny storage
        const result = await deleteFileFromBunny(imageToRemove.path);

        if (!result.success) {
          console.error(`Failed to delete image from storage: ${result.error}`);
          // Optionally show an alert to the user
          alert(
            `Warning: The image couldn't be deleted from storage. ${result.error}`,
          );
        }
      } catch (error) {
        console.error("Error deleting image from storage:", error);
      }
    }

    // Clean up the preview URL to prevent memory leaks
    revokeFilePreview(productImages[index].preview);

    // Update state by removing the image at the specified index
    setProductImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Status messages for the UI
  const getSubmitButtonText = () => {
    if (isPending) {
      return "Creating Product...";
    }

    return "Create Product";
  };

  // Get image upload status indicator
  const getImageStatusIndicator = (
    status: ImageUploadState["status"],
    progress: number,
  ) => {
    switch (status) {
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
            <X className="h-4 w-4" size={16} />
            Failed
          </span>
        );
    }
  };

  return (
    <ErrorBoundary fallback={<ErrorDefaultDisplay />}>
      <div className="space-y-6">
        <PageTitle title="New Product" />

        <Card>
          <CardContent className="mt-4">
            <form ref={formRef} className="space-y-6" onSubmit={handleSubmit}>
              {/* Product details */}
              <div className="space-y-4">
                {/* Name field */}
                <div className="flex flex-col gap-2">
                  <Label className="text-foreground" htmlFor="name">
                    Name
                  </Label>
                  <Input
                    required
                    id="name"
                    name="name"
                    placeholder="This is a new product..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Price field */}
                  <div className="flex flex-col gap-2">
                    <Label className="text-foreground" htmlFor="price">
                      Price
                    </Label>
                    <Input
                      required
                      id="price"
                      name="price"
                      placeholder="0.00"
                      step="0.01"
                      type="number"
                    />
                  </div>

                  {/* Category field */}
                  <div className="flex flex-col gap-2">
                    <Label className="text-foreground" htmlFor="category">
                      Category
                    </Label>
                    <Input
                      id="category"
                      name="category"
                      type="hidden"
                      value={selectedCategory || ""}
                    />
                    <Select
                      required
                      value={selectedCategory || ""}
                      onValueChange={handleCategoryChange}
                    >
                      <SelectTrigger id="category">
                        <SelectValue placeholder="What will it be?" />
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

                {/* Description field */}
                <div className="flex flex-col gap-2">
                  <Label className="text-foreground" htmlFor="description">
                    Description
                  </Label>
                  <Textarea
                    required
                    id="description"
                    name="description"
                    placeholder="Here comes the description..."
                    rows={5}
                  />
                </div>

                {/* Tags field */}
                <div className="flex flex-col gap-2">
                  <Label className="text-foreground" htmlFor="tags">
                    Tags
                  </Label>
                  <TagInput
                    selectedTags={selectedTags}
                    onChange={handleTagsChange}
                  />
                </div>

                {/* Zip file upload */}
                <div className="flex flex-col gap-2">
                  <Label className="text-foreground" htmlFor="productZip">
                    Zip File
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      accept=".zip"
                      disabled={isUploadingZip || !!uploadedZipPath}
                      id="productZip"
                      required={!uploadedZipPath}
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

                  {isUploadingZip && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span>Uploading...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <Progress className="h-2" value={uploadProgress} />
                    </div>
                  )}

                  {uploadedZipPath && (
                    <p className="text-sm text-green-600 flex items-center gap-1">
                      <CircleCheckBig size={16} />
                      File uploaded successfully
                    </p>
                  )}
                </div>

                {/* Image uploads */}
                <div className="flex flex-col gap-2">
                  <Label className="text-foreground" htmlFor="productImages">
                    Images
                  </Label>
                  <div className="flex justify-between gap-2 items-center">
                    <Input
                      multiple
                      accept="image/*"
                      disabled={
                        productImages.length > 0 &&
                        productImages.every((img) => img.status === "success")
                      }
                      id="productImages"
                      type="file"
                      onChange={handleImageUpload}
                    />
                    {productImages.length > 0 &&
                      !productImages.every(
                        (img) => img.status === "success",
                      ) && (
                        <Button
                          className="whitespace-nowrap"
                          disabled={isUploadingImages}
                          type="button"
                          onClick={uploadAllImages}
                        >
                          <Upload className="mr-2 h-4 w-4" />
                          Upload Images
                        </Button>
                      )}
                  </div>

                  {/* Add success message when all images are uploaded */}
                  {productImages.length > 0 &&
                    productImages.every((img) => img.status === "success") && (
                      <p className="text-sm text-green-600 flex items-center gap-1">
                        <CircleCheckBig size={16} />
                        All images uploaded successfully
                      </p>
                    )}
                </div>

                {/* Image previews with upload status */}
                {productImages.length > 0 && (
                  <div className="border rounded-md p-4">
                    <h3 className="font-medium mb-2">Selected Images</h3>
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

              {/* Form status messages */}
              {formState.status === "error" && (
                <div className="flex text-red-600 p-1 gap-2">
                  <X />
                  {formState.error}
                </div>
              )}

              {formState.status === "success" && (
                <div className="flex text-green-600 p-1 gap-2">
                  <CircleCheckBig />
                  {formState.message}
                </div>
              )}

              {/* Submit button */}
              <Button
                className="w-full"
                disabled={isPending || isUploadingZip || isUploadingImages}
                type="submit"
                variant="form"
              >
                {getSubmitButtonText()}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </ErrorBoundary>
  );
}
