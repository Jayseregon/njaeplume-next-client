import { Category, Tag } from "@prisma/client";

export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  category: Category;
  createdAt: Date;
  updatedAt: Date;
  zip_file_name: string;
  slug: string;
  tags: Tag[];
  images: ProductImage[];
}

export interface ProductImage {
  id: string;
  productId: string;
  url: string;
  alt_text: string;
}

// State interface for the form
export interface ProductFormState {
  status: "idle" | "uploading" | "creating" | "success" | "error";
  message?: string;
  productId?: string;
  error?: string;
}

export interface GenerateUploadUrlResult {
  success: boolean;
  uploadUrl?: string;
  filePath?: string;
  authHeaders?: Record<string, string>;
  error?: string;
  expiresAt?: number;
}
