import { useState } from "react";
import Image from "next/image";
import { CloudDownload } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ErrorBoundary from "@/src/components/root/ErrorBoundary";
import { Product } from "@/interfaces/Products";
import { SimpleSpinner } from "@/components/root/SimpleSpinner";
import { generateBunnySignedUrl } from "@/src/actions/bunny/action";

export const FreebieCard = ({ product }: { product: Product }) => {
  const t = useTranslations("FreebieCard");
  const [isLoading, setIsLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const pullZone = process.env.NEXT_PUBLIC_BUNNY_PUBLIC_ASSETS_PULL_ZONE_URL;

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      setIsLoading(true);

      // Generate a signed URL that expires in 5 minutes (default)
      const response = await generateBunnySignedUrl(product.zip_file_name);

      if (!response.success || !response.url) {
        throw new Error("Download generation failed");
      }

      // Create a temporary anchor element for download
      const downloadLink = document.createElement("a");

      downloadLink.href = response.url;

      // Extract filename from zip_file_name
      const fileName =
        product.zip_file_name.split("/").pop() || `${product.slug}.zip`;

      downloadLink.download = fileName;

      // Trigger click to start download
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      toast.success(t("downloadSuccessTitle"), {
        description: t("downloadSuccessDesc", { productName: product.name }),
      });
    } catch (error) {
      console.error("Download error:", error);
      toast.error(t("downloadErrorTitle"), {
        description: t("downloadErrorDesc"),
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Button animation variants
  const buttonVariants = {
    initial: { scale: 1 },
    hover: {
      scale: 1.1,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10,
      },
    },
    tap: { scale: 0.98 },
  };

  // Icon animation variants
  const iconVariants = {
    initial: { y: 0 },
    hover: {
      y: [0, -5, 0],
      transition: {
        repeat: Infinity,
        repeatType: "reverse" as const,
        duration: 1.2,
        ease: "easeInOut",
      },
    },
  };

  return (
    <Card className="rounded-2xl pt-3 text-foreground transition-all duration-200 hover:shadow-md relative overflow-hidden">
      <CardHeader>
        <h3 className="text-xl pb-1 font-bold">{product.name}</h3>
        <p className="italic text-sm pb-2">
          {t(`category.${product.category}`)}
        </p>
      </CardHeader>
      <CardContent>
        <div className="pb-5">
          {product.images[0] && (
            <ErrorBoundary
              fallback={
                <div className="w-5/6 mx-auto p-4 text-center bg-stone-100">
                  <p>{t("imageLoadError")}</p>
                </div>
              }
            >
              <div
                key={product.images[0].id}
                className="w-5/6 mx-auto bg-stone-200 relative"
              >
                <Image
                  alt={
                    product.images[0].alt_text ||
                    "default product image alt text"
                  }
                  className="w-full h-auto object-contain"
                  height={600}
                  priority={false}
                  sizes="(max-width: 768px) 100vw, 50vw"
                  src={`${pullZone}/${product.images[0].url}`}
                  width={800}
                />
              </div>
            </ErrorBoundary>
          )}
        </div>
      </CardContent>
      <CardFooter className="justify-center items-center pt-0 pb-3">
        <motion.div
          animate={isHovered ? "hover" : "initial"}
          className="w-full sm:w-3/4"
          initial="initial"
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
          onHoverEnd={() => setIsHovered(false)}
          onHoverStart={() => setIsHovered(true)}
        >
          <Button
            className="flex items-center justify-center space-x-2 w-full"
            disabled={isLoading}
            size="sm"
            title={t("downloadButtonTitle")}
            variant="form"
            onClick={handleDownload}
          >
            {isLoading ? (
              <SimpleSpinner />
            ) : (
              <>
                <motion.div variants={iconVariants}>
                  <CloudDownload className="h-4 w-4 mr-2" />
                </motion.div>
                <span className="group-hover:font-medium transition-all">
                  {t("downloadButtonText")}
                </span>
              </>
            )}
          </Button>
        </motion.div>
      </CardFooter>
    </Card>
  );
};
