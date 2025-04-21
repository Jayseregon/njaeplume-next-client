"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Tag } from "@/generated/client";
import { useProductStore } from "@/src/stores/productStore";
import { updateProduct } from "@/actions/prisma/action";
import { deleteProductWithFiles } from "@/src/actions/bunny/action";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { TagInput } from "@/src/components/castle/TagInput";
import { useImageUpload } from "@/src/hooks/useImageUpload";
import { useZipFileUpload } from "@/src/hooks/useZipFileUpload";
import { ProductImageUploader } from "@/src/components/castle/ProductImageUploader";
import { ProductZipUploader } from "@/src/components/castle/ProductZipUploader";
import { slugifyProductName } from "@/src/lib/actionHelpers";
import { SimpleSpinner } from "@/components/root/SimpleSpinner";
import { FormField } from "@/src/components/castle/FormField";
import { CategoryField } from "@/src/components/castle/CategoryField";

export const ProductEditDialog = () => {
  const router = useRouter();
  const { selectedProduct, isDialogOpen, closeDialog } = useProductStore();
  const [formData, setFormData] = useState<any>({});
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Initialize our custom hooks
  const imageUploadHook = useImageUpload([]);
  const zipUploadHook = useZipFileUpload();

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
        imageUploadHook.setProductImages(
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
        imageUploadHook.resetImages();
      }

      // Set up existing zip file
      zipUploadHook.setUploadedZipPath(selectedProduct.zip_file_name);
      zipUploadHook.setShowZipUpload(false);
    }
  }, [selectedProduct]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.id) return;

    // Check if we have a zip file
    if (!zipUploadHook.uploadedZipPath) {
      toast.error("Please upload a zip file for the product");

      return;
    }

    // Check if all images are uploaded
    const pendingImages = imageUploadHook.productImages.filter(
      (img) => img.status === "pending",
    );

    if (pendingImages.length > 0) {
      toast.info("Uploading pending images first...");
      const success = await imageUploadHook.uploadAllImages(
        formData.name,
        getProductCategory(),
      );

      if (!success) {
        toast.error("Failed to upload all images");

        return;
      }
    }

    setIsSubmitting(true);
    try {
      // Prepare image data using our hook's helper function
      const imageData = imageUploadHook.prepareImageDataForSubmission();

      // Update product with all data
      await updateProduct({
        ...formData,
        tags: selectedTags,
        images: imageData,
        zip_file_name: zipUploadHook.uploadedZipPath,
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

    setIsSubmitting(true);
    setHasError(false);
    try {
      const result = await deleteProductWithFiles(selectedProduct.id);

      if (result.success) {
        toast.success("Product deleted successfully");
        closeDialog();
        router.refresh(); // Refresh the page to get updated data
      } else {
        setHasError(true);
        toast.error(`Failed to delete product: ${result.error}`);
      }
    } catch (error) {
      setHasError(true);
      console.error("Failed to delete product:", error);
      toast.error("An error occurred while deleting the product.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to get current category or fallback
  const getProductCategory = (): string => {
    return formData.category || "uncategorized";
  };

  if (!selectedProduct) return null;

  return (
    <Dialog
      open={isDialogOpen}
      onOpenChange={() => {
        // Only close the dialog if not submitting and no errors; if error exists, do nothing.
        if (isSubmitting || hasError) return;
        closeDialog();
      }}
    >
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
              <div className="grid grid-cols-2 gap-4">
                {/* Name field */}
                <FormField
                  id="name"
                  inputProps={{
                    value: formData.name || "",
                    onChange: handleChange,
                  }}
                  inputType="text"
                  label="Name"
                  name="name"
                />

                {/* id field */}
                <FormField
                  className="col-span-1"
                  disabled={true}
                  id="id"
                  inputProps={{
                    value: formData.id || "",
                    onChange: handleChange,
                  }}
                  inputType="text"
                  label="ID"
                  name="id"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Price field */}
                <FormField
                  className="col-span-3"
                  id="price"
                  inputProps={{
                    step: "0.01",
                    value: formData.price || 0,
                    onChange: handlePriceChange,
                  }}
                  inputType="number"
                  label="Price"
                  name="price"
                />

                {/* Category field using the new component with readOnly prop */}
                <CategoryField
                  readOnly={true}
                  selectedCategory={formData.category}
                  onChange={handleCategoryChange}
                />
              </div>

              {/* Description Field */}
              <FormField
                className="col-span-3"
                id="description"
                inputProps={{
                  rows: 5,
                  value: formData.description || "",
                  onChange: handleChange,
                }}
                inputType="textarea"
                label="Description"
                name="description"
              />

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

              {/* Rest of the form remains unchanged */}
              <ProductZipUploader
                category={getProductCategory()}
                productName={formData.name || "product"}
                zipUploadHook={zipUploadHook}
              />

              <ProductImageUploader
                category={getProductCategory()}
                imageUploadHook={imageUploadHook}
                productName={formData.name || "product"}
              />
            </div>
          </form>
        </div>

        {/* Dialog footer remains unchanged */}
        <DialogFooter className="flex w-full items-center">
          <div className="mr-auto">
            <Button
              disabled={isSubmitting}
              size="icon"
              type="button"
              variant="destructive"
              onClick={handleDelete}
            >
              {isSubmitting ? <SimpleSpinner /> : <Trash2 />}
            </Button>
          </div>
          <div className="ml-auto">
            <Button
              disabled={
                isSubmitting ||
                imageUploadHook.isUploadingImages ||
                zipUploadHook.isUploadingZip
              }
              form="edit-product-form"
              size="icon"
              type="submit"
              variant="success"
            >
              {isSubmitting ? <SimpleSpinner /> : <Save />}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
