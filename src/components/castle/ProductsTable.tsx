"use client";

import { useEffect, useState } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Product } from "@/interfaces/Products";
import { formatDate, getRandomSubset } from "@/src/lib/utils";

export const ProductsTable = ({ products }: { products: Product[] }) => {
  // Store randomized tags for each product
  const [randomizedProductTags, setRandomizedProductTags] = useState<
    Record<string | number, any[]>
  >({});

  // Generate random tags only on client-side after initial render
  useEffect(() => {
    const randomizedTags: Record<string | number, any[]> = {};

    products.forEach((product) => {
      if (product.id && product.tags && product.tags.length > 0) {
        randomizedTags[product.id] = getRandomSubset(product.tags, 5);
      }
    });

    setRandomizedProductTags(randomizedTags);
  }, [products]);

  return (
    <div className="rounded-md border">
      <Table className="w-full mx-auto">
        <TableHeader>
          <TableRow>
            <TableHead className="text-center">ID</TableHead>
            <TableHead className="text-center">Name</TableHead>
            <TableHead className="text-center">Price</TableHead>
            <TableHead className="text-center">Category</TableHead>
            <TableHead className="text-center">Description</TableHead>
            <TableHead className="text-center">zipfile</TableHead>
            <TableHead className="text-center">slug</TableHead>
            <TableHead className="text-center">tags</TableHead>
            <TableHead className="text-center">Created</TableHead>
            <TableHead className="text-center">Updated</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id} className="text-start">
              <TableCell className="font-medium">{product.id}</TableCell>

              <TableCell>{product.name}</TableCell>
              <TableCell>{`$${(product.price || 0).toFixed(2)}`}</TableCell>
              <TableCell>{product.category}</TableCell>

              <TableCell className="overflow-hidden text-ellipsis max-w-sm">
                {product.description}
              </TableCell>
              <TableCell>{product.zip_file_name}</TableCell>
              <TableCell>{product.slug}</TableCell>
              <TableCell className="overflow-hidden text-ellipsis max-w-sm">
                {product.tags && product.tags.length > 0 && (
                  <div className="flex flex-row gap-0.5">
                    {(product.id && randomizedProductTags[product.id]
                      ? randomizedProductTags[product.id]
                      : product.tags.slice(0, 5)
                    ).map((tag) => (
                      <Badge key={tag.id} variant="primary">
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                )}
              </TableCell>

              <TableCell>{formatDate(product.createdAt)}</TableCell>
              <TableCell>{formatDate(product.updatedAt)}</TableCell>
            </TableRow>
          ))}
          {products.length === 0 && (
            <TableRow className="text-center">
              <TableCell className="text-center py-6" colSpan={10}>
                No products found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
