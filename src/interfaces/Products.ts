import { Category, Tag, Order, OrderItem } from "@/generated/client";

export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  description_fr: string;
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

export interface CategoryRowProps {
  category: Category;
  products: Product[];
}

export interface OrderWithItems extends Order {
  displayId: string; // Add the displayId field
  items: OrderItemWithProduct[];
}

export interface OrderItemWithProduct extends OrderItem {
  product: Product;
}

export interface WishlistItem {
  userId: string;
  productId: string;
  createdAt: Date;
  product?: Product; 
}
