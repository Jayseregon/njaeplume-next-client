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
