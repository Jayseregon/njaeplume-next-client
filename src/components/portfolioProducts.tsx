"use client";

import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { Button } from "@nextui-org/button";
import { CircularProgress } from "@nextui-org/progress";

import { getFreebieZip, fetchProductsData } from "@/lib/bunnyRequest";

import { DownloadIcon } from "./icons";

type ProductImageProps = {
  id: string;
  image: string;
  alt_text: string;
};

type ProductProps = {
  id: string;
  name: string;
  price: string;
  category: string;
  fr_category: string;
  description: string;
  fr_description: string;
  products_productimagesmodel: ProductImageProps[];
};

type ProductCardProps = {
  product: ProductProps;
  locale?: string;
};

type LazyImageProps = {
  src: string;
  alt: string;
};

type FreebiesProps = {
  id: string;
  name: string;
  image: string;
  alt_text: string;
  zip_file_name: string;
};

type FreebieCardProps = {
  freebie: FreebiesProps;
  locale?: string;
};

type DownloadButtonProps = {
  filePath: string;
};

const BUNNY_CDN_PULL_ZONE = process.env.NEXT_PUBLIC_BUNNY_PULL_ZONE_URL;
const BUNNY_STORAGE_REGION = process.env.NEXT_PUBLIC_BUNNY_STORAGE_REGION;
const BUNNY_STORAGE_ZONE_NAME = process.env.NEXT_PUBLIC_BUNNY_STORAGE_ZONE_NAME;
const BUNNY_API_ACCESS_KEY = process.env.NEXT_PUBLIC_BUNNY_API_ACCESS_KEY;

const fetchBunnyFile = async (filePath: string) => {
  const fileURL = `https://${BUNNY_STORAGE_REGION}.storage.bunnycdn.com/${BUNNY_STORAGE_ZONE_NAME}/zipfile/${filePath}`;
  const headers = new Headers();

  headers.set("AccessKey", BUNNY_API_ACCESS_KEY ?? "");
  const response = await fetch(fileURL, { headers });

  if (!response.ok) {
    throw new Error("Failed to fetch data");
  }

  const blob = await response.blob();

  return blob;
};

// lazy load image component
export const LazyImage = ({ src, alt }: LazyImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  useEffect(() => {
    if (inView) {
      const img = new Image();

      img.src = src;
      img.onload = () => setIsLoaded(true);
    }
  }, [inView, src]);

  return (
    <div ref={ref} className="relative aspect-auto w-5/6 mx-auto bg-stone-200">
      {isLoaded ? (
        <img alt={alt} className="object-scale-down" src={src} />
      ) : (
        <div className="flex items-center justify-center text-foreground bg-background">
          <CircularProgress
            aria-label="Loading..."
            classNames={{
              indicator: "stroke-foreground",
              track: "stroke-white/10",
            }}
            color={undefined}
            label="Loading..."
            strokeWidth={5}
          />
        </div>
      )}
    </div>
  );
};

// download button component
export const DownloadButton = ({ filePath }: DownloadButtonProps) => {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      await getFreebieZip(filePath);

      // const fileBlob = await fetchBunnyFile(filePath);
      // const url = window.URL.createObjectURL(fileBlob);
      // const a = document.createElement("a");

      // a.href = url;
      // a.download = fileName;
      // document.body.appendChild(a);
      // a.click();
      // a.remove();
      // window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading file", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      isIconOnly
      className="bg-transparent text-foreground pt-5"
      isLoading={loading}
      radius="full"
      size="sm"
      onClick={handleDownload}
    >
      <DownloadIcon />
    </Button>
  );
};

// product card component
export const ProductCard = ({ product, locale }: ProductCardProps) => {
  return (
    <div
      key={product.id}
      className="border-1 border-foreground rounded-2xl pt-3"
    >
      <h3 className="text-xl pb-1 font-bold">{product.name}</h3>
      <p className="italic text-sm pb-2">
        {locale === "en" ? product.category : product.fr_category}
      </p>
      <div className="pb-8">
        {product.products_productimagesmodel[0] && (
          <div key={product.products_productimagesmodel[0].id}>
            <LazyImage
              key={product.products_productimagesmodel[0].id}
              alt={product.products_productimagesmodel[0].alt_text}
              src={`${BUNNY_CDN_PULL_ZONE}/${product.products_productimagesmodel[0].image}`}
            />
          </div>
        )}
      </div>
    </div>
  );
};

// freebie card component
export const FreebieCard = ({ freebie }: FreebieCardProps) => {
  return (
    <div
      key={freebie.id}
      className="border-1 border-foreground rounded-2xl pt-3"
    >
      <h3 className="text-xl pb-1 font-bold">{freebie.name}</h3>
      <div className="pt-2 pb-2">
        <LazyImage
          key={freebie.id}
          alt={freebie.alt_text}
          src={`${BUNNY_CDN_PULL_ZONE}/${freebie.image}`}
        />
      </div>
      <div className="pb-2">
        <DownloadButton filePath={freebie.zip_file_name} />
      </div>
    </div>
  );
};

// component to display a list of products and freebies
export const ProductList = ({ locale }: { locale: string }) => {
  const [products, setProducts] = useState<ProductProps[]>([]);
  const [freebies, setFreebies] = useState<FreebiesProps[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchProductsData();
        setProducts(data.products);
        setFreebies(data.freebies);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center">
        <CircularProgress
          aria-label="Loading..."
          classNames={{
            svg: "w-28 h-28 drop-shadow-md",
            indicator: "stroke-foreground",
            track: "stroke-white/10",
          }}
          color={undefined}
          label="Loading..."
          strokeWidth={5}
        />
      </div>
    );
  if (error) return <div>Something went wrong...</div>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10 mx-20">
      {products.map((product) => (
        <ProductCard key={product.id} locale={locale} product={product} />
      ))}
      {freebies.map((freebie) => (
        <FreebieCard key={freebie.id} freebie={freebie} />
      ))}
    </div>
  );
};
