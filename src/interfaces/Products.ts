export enum Category {
  brushes = "brushes",
  stickers = "stickers",
  templates = "templates",
  planners = "planners",
  freebies = "freebies",
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
}

export interface Product {
  id: string;
  name: string | null;
  old_name: string | null;
  price: number | null;
  old_price: number | null;
  description: string | null;
  old_description: string | null;
  category: Category | null;
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
  tags: Tag[];
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
