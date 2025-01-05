// /src/interfaces/products.ts

export interface ProductImage {
  id: string;
  image: string;
  alt_text: string;
}

export interface Product {
  id: string;
  name: string;
  price: string;
  category: string;
  fr_category: string;
  description: string;
  fr_description: string;
  products_productimagesmodel: ProductImage[];
}

export interface ProductCardProps {
  product: Product;
}

export interface LazyImageProps {
  src: string;
  alt: string;
}

export interface Freebie {
  id: string;
  name: string;
  image: string;
  alt_text: string;
  zip_file_name: string;
}

export interface FreebieCardProps {
  freebie: Freebie;
}

export interface DownloadButtonProps {
  filePath: string;
}
