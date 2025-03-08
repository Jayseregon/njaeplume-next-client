"use client";

import {
  useActionState,
  useState,
  useRef,
  startTransition,
  useEffect,
} from "react";
import { Category, Tag } from "@prisma/client";
import { CircleCheckBig, X } from "lucide-react";

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
import { createProductWithUploads } from "@/src/actions/bunny/action";
import { ProductFormState } from "@/src/interfaces/Products";
import { TagInput } from "@/src/components/product/TagInput";
import { useImageUpload } from "@/src/hooks/useImageUpload";
import { useZipFileUpload } from "@/src/hooks/useZipFileUpload";
import { ProductImageUploader } from "@/src/components/product/ProductImageUploader";
import { ProductZipUploader } from "@/src/components/product/ProductZipUploader";

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
    if (formState.status === "success" && !formReset) {
      // Set flag to prevent multiple resets
      setFormReset(true);

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
    } else if (formState.status !== "success" && formReset) {
      // Reset the flag when form status changes from success
      setFormReset(false);
    }
  }, [formState.status, formReset, imageUploadHook, zipUploadHook]);

  // Handle form submission with file paths
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Client-side validation
    if (imageUploadHook.productImages.length === 0) {
      alert("Please upload at least one image");

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

        await imageUploadHook.uploadAllImages(productName);

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
        const uploadSuccessful =
          await zipUploadHook.uploadZipFileToBunny(productName);

        if (!uploadSuccessful) return;
      }

      // If we don't have a zip path at this point, something went wrong
      if (!zipUploadHook.uploadedZipPath) {
        alert("Please upload a zip file");

        return;
      }

      const form = e.currentTarget;
      const formData = new FormData(form);

      // Instead of the actual files, pass the paths of the uploaded files
      formData.set("zipFilePath", zipUploadHook.uploadedZipPath);

      // Add image paths and alt texts using the helper function from our hook
      const imageData = imageUploadHook.prepareImageDataForSubmission();

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

                {/* Zip file upload section using our component */}
                <ProductZipUploader
                  productName={getProductNameFromForm()}
                  zipUploadHook={zipUploadHook}
                />

                {/* Image uploads using our component */}
                <ProductImageUploader
                  imageUploadHook={imageUploadHook}
                  productName={getProductNameFromForm()}
                />
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
