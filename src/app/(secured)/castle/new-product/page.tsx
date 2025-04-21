"use client";
import {
  useActionState,
  useState,
  useRef,
  startTransition,
  useEffect,
} from "react";
import { toast } from "sonner";

import { Category, Tag } from "@/generated/client";
import { PageTitle } from "@/src/components/root/PageTitle";
import ErrorBoundary from "@/src/components/root/ErrorBoundary";
import { ErrorDefaultDisplay } from "@/src/components/root/ErrorDefaultDisplay";
import { Button } from "@/src/components/ui/button";
import { Label } from "@/src/components/ui/label";
import { Card, CardContent } from "@/src/components/ui/card";
import { createProductWithUploads } from "@/src/actions/bunny/action";
import { ProductFormState } from "@/src/interfaces/Products";
import { TagInput } from "@/src/components/castle/TagInput";
import { useImageUpload } from "@/src/hooks/useImageUpload";
import { useZipFileUpload } from "@/src/hooks/useZipFileUpload";
import { ProductImageUploader } from "@/src/components/castle/ProductImageUploader";
import { ProductZipUploader } from "@/src/components/castle/ProductZipUploader";
import { FormField } from "@/src/components/castle/FormField";
import { CategoryField } from "@/src/components/castle/CategoryField";

// Initial state for the form
const initialState: ProductFormState = { status: "idle" };

export default function NewProductPage() {
  // Form and category/tag state
  const formRef = useRef<HTMLFormElement>(null);
  const [formReset, setFormReset] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);

  // Initialize our custom hooks
  const imageUploadHook = useImageUpload([]);
  const zipUploadHook = useZipFileUpload();

  // Form action state
  const [formState, formAction, isPending] = useActionState(
    createProductWithUploads,
    initialState,
  );

  // Reset form and state after successful submission
  useEffect(() => {
    // If submission was successful and form hasn't been reset yet
    if (formState.status === "success" && !formReset) {
      // Show success toast
      toast.success(formState.message || "Product created successfully");

      // Reset hooks
      imageUploadHook.resetImages();
      zipUploadHook.resetZip();

      // Reset other state
      setSelectedCategory(null);
      setSelectedTags([]);

      // Reset form
      if (formRef.current) {
        formRef.current.reset();
      }

      // Set flag to prevent multiple resets
      setFormReset(true);
    } else if (formState.status === "error" && !formReset) {
      // Show error toast
      toast.error(formState.error || "Failed to create product");
    }
  }, [
    formState.status,
    formState.message,
    formState.error,
    formReset,
    imageUploadHook,
    zipUploadHook,
  ]);

  // Reset the formReset flag when a new submission starts or completes
  useEffect(() => {
    if (isPending) {
      // When a submission starts, we should prepare for the next reset cycle
      setFormReset(false);
    }
  }, [isPending]);

  // Handle form submission with file paths
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Client-side validation
    if (imageUploadHook.productImages.length === 0) {
      toast.error("Please upload at least one image");

      return;
    }

    // Check if all images are uploaded
    const pendingImages = imageUploadHook.productImages.filter(
      (img) => img.status === "pending",
    );

    if (pendingImages.length > 0) {
      // If there are pending images, try to upload them first
      const confirmed = window.confirm(
        "Some images haven't been uploaded yet. Would you like to upload them now?",
      );

      if (confirmed) {
        // Get product name from form for uploads
        const nameInput = formRef.current?.querySelector(
          "#name",
        ) as HTMLInputElement;
        const productName = nameInput?.value || "product";

        toast.info("Uploading images...");
        await imageUploadHook.uploadAllImages(
          productName,
          getProductCategory(),
        );

        return; // Return and wait for uploads to complete
      } else {
        return; // User cancelled
      }
    }

    try {
      // Get product name for zip upload
      const nameInput = formRef.current?.querySelector(
        "#name",
      ) as HTMLInputElement;
      const productName = nameInput?.value || "product";

      // If zip is not uploaded yet, upload it directly to Bunny first
      if (!zipUploadHook.uploadedZipPath && zipUploadHook.productZip) {
        toast.info("Uploading zip file...");
        const uploadSuccessful = await zipUploadHook.uploadZipFileToBunny(
          productName,
          getProductCategory(),
        );

        if (!uploadSuccessful) return;
      }

      // If we don't have a zip path at this point, something went wrong
      if (!zipUploadHook.uploadedZipPath) {
        toast.error("Please upload a zip file");

        return;
      }

      const form = e.currentTarget;
      const formData = new FormData(form);

      // Instead of the actual files, pass the paths of the uploaded files
      formData.set("zipFilePath", zipUploadHook.uploadedZipPath);

      // Add image paths and alt texts using the helper function from our hook
      const imageData = imageUploadHook.prepareImageDataForSubmission();

      formData.set("imageData", JSON.stringify(imageData));

      // Clear formReset flag before submitting to ensure proper reset after submission
      setFormReset(false);

      toast.info("Creating product...");

      // Submit form within a transition to avoid blocking UI
      startTransition(() => {
        formAction(formData);
      });
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error(
        `Form submission failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  };

  // Handle category selection
  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value as Category);
  };

  // Handle tag selection changes
  const handleTagsChange = (tags: Tag[]) => {
    setSelectedTags(tags);
  };

  // Status messages for the UI
  const getSubmitButtonText = () => {
    if (isPending) {
      return "Creating Product...";
    }

    return "Create Product";
  };

  // Get product name from form for using in components
  const getProductNameFromForm = (): string => {
    if (!formRef.current) return "product";
    const nameInput = formRef.current.querySelector(
      "#name",
    ) as HTMLInputElement;

    return nameInput?.value || "product";
  };

  // Get category from form or selected state
  const getProductCategory = (): string => {
    return selectedCategory || "uncategorized";
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
                <FormField
                  id="name"
                  inputProps={{
                    placeholder: "This is a new product...",
                  }}
                  inputType="text"
                  label="Name"
                  name="name"
                />

                <div className="grid grid-cols-2 gap-4">
                  {/* Price field */}
                  <FormField
                    containerClassName="flex flex-col gap-2"
                    id="price"
                    inputProps={{
                      placeholder: "0.00",
                      step: "0.01",
                    }}
                    inputType="number"
                    label="Price"
                    name="price"
                  />

                  {/* Category field using the new component */}
                  <CategoryField
                    selectedCategory={selectedCategory}
                    onChange={handleCategoryChange}
                  />
                </div>

                {/* Description field */}
                <FormField
                  id="description"
                  inputProps={{
                    placeholder: "Here comes the description...",
                    rows: 5,
                  }}
                  inputType="textarea"
                  label="Description"
                  name="description"
                />

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

                {/* Zip file upload section using our component */}
                <ProductZipUploader
                  category={getProductCategory()}
                  productName={getProductNameFromForm()}
                  zipUploadHook={zipUploadHook}
                />

                {/* Image uploads using our component */}
                <ProductImageUploader
                  category={getProductCategory()}
                  imageUploadHook={imageUploadHook}
                  productName={getProductNameFromForm()}
                />
              </div>

              {/* Submit button */}
              <Button
                className="w-full"
                disabled={
                  isPending ||
                  zipUploadHook.isUploadingZip ||
                  imageUploadHook.isUploadingImages
                }
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
