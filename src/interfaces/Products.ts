import { Category } from "@prisma/client";

export interface Tag {
  id: string;
  name: string;
  slug: string;
}

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

export interface UploadResponse {
  success: boolean;
  path?: string;
  error?: string;
}

// State interface for the form
export interface ProductFormState {
  status: "idle" | "uploading" | "creating" | "success" | "error";
  message?: string;
  productId?: string;
  error?: string;
}
