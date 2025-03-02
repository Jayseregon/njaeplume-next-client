"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Product } from "@/interfaces/Products";
import { formatDate } from "@/src/lib/utils";

export const ProductsTable = ({ products }: { products: Product[] }) => {
  return (
    <div className="rounded-md border">
      <Table className="w-full mx-auto">
        <TableHeader>
          <TableRow>
            <TableHead className="text-center">ID</TableHead>
            <TableHead className="text-center">SKU</TableHead>
            <TableHead className="text-center">Name</TableHead>
            <TableHead className="text-center">Price</TableHead>
            <TableHead className="text-center">Category</TableHead>
            <TableHead className="text-center">Created</TableHead>
            <TableHead className="text-center">Updated</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id} className="text-center">
              <TableCell className="font-medium">
                {product.id || "N/A"}
              </TableCell>
              <TableCell className="font-medium">
                {product.old_sku || "N/A"}
              </TableCell>
              <TableCell>{product.old_name || "N/A"}</TableCell>
              <TableCell>
                {product.old_price
                  ? `$${(product.old_price || 0).toFixed(2)}`
                  : "N/A"}
              </TableCell>
              <TableCell>{product.old_category || "Uncategorized"}</TableCell>
              <TableCell>{formatDate(product.old_date_created)}</TableCell>
              <TableCell>{formatDate(product.old_date_updated)}</TableCell>
            </TableRow>
          ))}
          {products.length === 0 && (
            <TableRow className="text-center">
              <TableCell className="text-center py-6" colSpan={7}>
                No products found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
