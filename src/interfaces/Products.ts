export interface Product {
  id: string;
  sku: string | null;
  old_sku: string | null;
  name: string | null;
  old_name: string | null;
  price: number | null;
  old_price: number | null;
  description: string | null;
  old_description: string | null;
  details: string | null;
  old_details: string | null;
  category: string | null;
  old_category: string | null;
  createdAt: Date;
  old_date_created: Date | null;
  updatedAt: Date;
  old_date_updated: Date | null;
  zip_file_name: string | null;
  old_zip_file_name: string | null;
  slug: string | null;
  old_slug: string | null;
  old_tags: string | null;
  images: ProductImage[];
}

export interface ProductImage {
  id: string;
  productId: string;
  url: string | null;
  old_url: string | null;
  alt_text: string | null;
  old_alt_text: string | null;
}
