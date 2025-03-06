"use client";

import {
  useActionState,
  useState,
  useRef,
  startTransition,
  useEffect,
} from "react";
import { Category } from "@prisma/client";
import { Trash2 } from "lucide-react";

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
import { createFilePreview, revokeFilePreview } from "@/src/lib/actionHelpers";
import { ProductFormState } from "@/src/interfaces/Products";

// Initial state for the form
const initialState: ProductFormState = { status: "idle" };

export default function NewProductPage() {
  // Form and file state
  const formRef = useRef<HTMLFormElement>(null);
  const [productImages, setProductImages] = useState<File[]>([]);
  const [productZip, setProductZip] = useState<File | null>(null);
  const [imageAltTexts, setImageAltTexts] = useState<string[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );
  const [formReset, setFormReset] = useState(false);

  // Form action state
  const [formState, formAction, isPending] = useActionState(
    createProductWithUploads,
    initialState,
  );

  // Clean up image previews when component unmounts
  useEffect(() => {
    return () => {
      // Revoke all object URLs to avoid memory leaks
      imagePreviews.forEach((preview) => revokeFilePreview(preview));
    };
  }, []); // Empty dependency array since this runs only on unmount

  // Reset form and state after successful submission
  useEffect(() => {
    if (formState.status === "success" && !formReset) {
      // Set flag to prevent multiple resets
      setFormReset(true);

      // Clean up all previews
      imagePreviews.forEach((preview) => revokeFilePreview(preview));

      // Reset state in a single batch
      setProductImages([]);
      setProductZip(null);
      setImageAltTexts([]);
      setImagePreviews([]);
      setSelectedCategory(null);

      // Reset form
      if (formRef.current) {
        formRef.current.reset();
      }
    } else if (formState.status !== "success" && formReset) {
      // Reset the flag when form status changes from success
      setFormReset(false);
    }
  }, [formState.status, formReset]); // Only depend on formState.status and formReset, not imagePreviews

  // Handle form submission with file uploads
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Client-side validation
    if (productImages.length === 0 || !productZip) {
      alert("Please upload at least one image and a zip file");

      return;
    }

    const form = e.currentTarget;
    const formData = new FormData(form);

    // Add files to form data
    formData.set("zipFile", productZip);

    // Add images and alt texts
    formData.delete("imageFiles");
    productImages.forEach((image) => {
      formData.append("imageFiles", image);
    });
    formData.set("imageAltTexts", JSON.stringify(imageAltTexts));

    // Submit form within a transition to avoid blocking UI
    startTransition(() => {
      formAction(formData);
    });
  };

  // Handle image uploads
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newImages = Array.from(e.target.files);

      // Generate previews for new images
      const newPreviews = newImages.map((file) => createFilePreview(file));

      // Update state
      setProductImages((prev) => [...prev, ...newImages]);
      setImageAltTexts((prev) => [...prev, ...newImages.map(() => "")]);
      setImagePreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  // Handle zip file upload
  const handleZipUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProductZip(e.target.files[0]);
    }
  };

  // Handle alt text changes
  const handleAltTextChange = (index: number, value: string) => {
    setImageAltTexts((prev) => {
      const updated = [...prev];

      updated[index] = value;

      return updated;
    });
  };

  // Handle category selection
  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value as Category);
  };

  // Remove an image
  const removeImage = (index: number) => {
    // Clean up the preview URL to prevent memory leaks
    revokeFilePreview(imagePreviews[index]);

    // Update state by removing the image at the specified index
    setProductImages((prev) => prev.filter((_, i) => i !== index));
    setImageAltTexts((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // Status messages for the UI
  const getSubmitButtonText = () => {
    if (isPending) {
      return formState.status === "uploading"
        ? "Uploading Files..."
        : "Creating Product...";
    }

    return "Create Product";
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
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    required
                    id="name"
                    name="name"
                    placeholder="This is a new product..."
                  />
                </div>

                {/* Price field */}
                <div className="grid gap-2">
                  <Label htmlFor="price">Price</Label>
                  <Input
                    required
                    id="price"
                    name="price"
                    placeholder="0.00"
                    step="0.01"
                    type="number"
                  />
                </div>

                {/* Description field */}
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    required
                    id="description"
                    name="description"
                    placeholder="Here comes the description..."
                    rows={5}
                  />
                </div>

                {/* Category field */}
                <div className="grid gap-2">
                  <Label htmlFor="category">Category</Label>
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
                      <SelectItem value="brushes">Brushes</SelectItem>
                      <SelectItem value="stickers">Stickers</SelectItem>
                      <SelectItem value="templates">Templates</SelectItem>
                      <SelectItem value="planners">Planners</SelectItem>
                      <SelectItem value="freebies">Freebies</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Zip file upload */}
                <div className="grid gap-2">
                  <Label htmlFor="productZip">Zip File</Label>
                  <Input
                    required
                    accept=".zip"
                    id="productZip"
                    type="file"
                    onChange={handleZipUpload}
                  />
                  {productZip && (
                    <p className="text-sm text-green-600">
                      File selected: {productZip.name}
                    </p>
                  )}
                </div>

                {/* Image uploads */}
                <div className="grid gap-2">
                  <Label htmlFor="productImages">Images</Label>
                  <Input
                    multiple
                    accept="image/*"
                    id="productImages"
                    type="file"
                    onChange={handleImageUpload}
                  />
                </div>

                {/* Image previews */}
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
                              src={imagePreviews[index]}
                            />
                          </div>
                          <div className="flex-1">
                            <Input
                              placeholder="Alt text"
                              value={imageAltTexts[index] || ""}
                              onChange={(e) =>
                                handleAltTextChange(index, e.target.value)
                              }
                            />
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
                <div className="bg-red-50 text-red-600 p-3 rounded-md">
                  {formState.error}
                </div>
              )}

              {formState.status === "success" && (
                <div className="bg-green-50 text-green-600 p-3 rounded-md">
                  {formState.message}
                </div>
              )}

              {/* Submit button */}
              <Button
                className="w-full"
                disabled={isPending}
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
