"use client";

import { useEffect, useState } from "react";
import { Category, Tag } from "@prisma/client";
import { useRouter } from "next/navigation";

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

export const ProductEditDialog = () => {
  const router = useRouter();
  const { selectedProduct, isDialogOpen, closeDialog } = useProductStore();
  const [formData, setFormData] = useState<any>({});
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    }
  }, [selectedProduct]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;

    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (value: string) => {
    setFormData((prev: any) => ({
      ...prev,
      category: value,
    }));
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

    setIsSubmitting(true);
    try {
      // Include tags in the update data
      await updateProduct({
        ...formData,
        tags: selectedTags,
      });
      closeDialog();
      router.refresh(); // Refresh the page to get updated data
    } catch (error) {
      console.error("Failed to update product:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedProduct?.id) return;

    setIsSubmitting(true);
    try {
      const result = await deleteProductWithFiles(selectedProduct.id);

      if (result.success) {
        closeDialog();
        router.refresh(); // Refresh the page to get updated data
      } else {
        alert(`Failed to delete product: ${result.error}`);
      }
    } catch (error) {
      console.error("Failed to delete product:", error);
      alert("An error occurred while deleting the product.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!selectedProduct) return null;

  return (
    <Dialog open={isDialogOpen} onOpenChange={closeDialog}>
      <DialogContent aria-describedby={undefined} className="sm:max-w-[800px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right" htmlFor="name">
                Name
              </Label>
              <Input
                className="col-span-3"
                id="name"
                name="name"
                value={formData.name || ""}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right" htmlFor="price">
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

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right" htmlFor="category">
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

            {/* Add Tags Field */}
            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right pt-2" htmlFor="tags">
                Tags
              </Label>
              <div className="col-span-3">
                <TagInput
                  selectedTags={selectedTags}
                  onChange={handleTagsChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right" htmlFor="slug">
                Slug
              </Label>
              <Input
                className="col-span-3"
                id="slug"
                name="slug"
                value={formData.slug || ""}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right" htmlFor="zip_file_name">
                Zip File Name
              </Label>
              <Input
                className="col-span-3"
                id="zip_file_name"
                name="zip_file_name"
                value={formData.zip_file_name || ""}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right pt-2" htmlFor="description">
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
              <Button disabled={isSubmitting} type="submit">
                {isSubmitting ? "Saving..." : "Save changes"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
