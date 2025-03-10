"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState,
  getFilteredRowModel,
} from "@tanstack/react-table";
import { ArrowDown10, ArrowUp01, CloudDownload, Search } from "lucide-react";
import { toast } from "sonner";

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
import { useProductStore } from "@/src/stores/productStore";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { generateBunnySignedUrl } from "@/src/actions/bunny/action";
import { SimpleSpinner } from "@/components/root/SimpleSpinner";

export const ProductsTable = ({ products }: { products: Product[] }) => {
  // Store randomized tags for each product
  const [randomizedProductTags, setRandomizedProductTags] = useState<
    Record<string | number, any[]>
  >({});

  // Store loading state for downloads
  const [loadingDownloads, setLoadingDownloads] = useState<
    Record<string, boolean>
  >({});

  // Add state for sorting and filtering with default sort by name
  const [sorting, setSorting] = useState<SortingState>([
    { id: "createdAt", desc: true },
  ]);
  const [globalFilter, setGlobalFilter] = useState("");

  const { setSelectedProduct, openDialog } = useProductStore();

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

  const handleRowClick = (product: Product) => {
    setSelectedProduct(product);
    openDialog();
  };

  // Function to handle downloads
  const handleDownload = async (e: React.MouseEvent, product: Product) => {
    e.stopPropagation(); // Prevent row click from triggering

    try {
      setLoadingDownloads((prev) => ({ ...prev, [product.id]: true }));

      // Generate a signed URL that expires in 5 minutes (default)
      const response = await generateBunnySignedUrl(product.zip_file_name);

      if (!response.success || !response.url) {
        throw new Error(response.error || "Failed to generate download link");
      }

      // Create a temporary anchor element for download
      const downloadLink = document.createElement("a");

      downloadLink.href = response.url;

      // Extract filename from zip_file_name
      const fileName =
        product.zip_file_name.split("/").pop() || `${product.slug}.zip`;

      downloadLink.download = fileName; // Force download instead of navigation

      // Trigger click to start download
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Download Error", {
        description:
          error instanceof Error ? error.message : "Failed to start download",
      });
    } finally {
      setLoadingDownloads((prev) => ({ ...prev, [product.id]: false }));
    }
  };

  // Define columns for TanStack Table
  const columns = useMemo<ColumnDef<Product>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Name",
      },
      {
        accessorKey: "price",
        header: "Price",
        cell: ({ row }) => `$${(row.original.price || 0).toFixed(2)}`,
      },
      {
        accessorKey: "category",
        header: "Category",
      },
      {
        accessorKey: "description",
        header: "Description",
        cell: ({ row }) => (
          <div className="overflow-hidden text-ellipsis max-w-sm">
            {row.original.description}
          </div>
        ),
      },
      {
        accessorKey: "createdAt",
        header: "Created",
        cell: ({ row }) => formatDate(row.original.createdAt),
      },

      {
        accessorKey: "zip_file_name",
        header: "Zipfile",
      },
      {
        accessorKey: "slug",
        header: "Slug",
      },
      {
        accessorKey: "tags",
        header: "Tags",
        enableSorting: false,
        cell: ({ row }) => {
          const product = row.original;

          return (
            <div className="overflow-hidden text-ellipsis max-w-sm">
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
            </div>
          );
        },
      },
      {
        accessorKey: "updatedAt",
        header: "Updated",
        cell: ({ row }) => formatDate(row.original.updatedAt),
      },
      {
        accessorKey: "id",
        header: "cuid",
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <Button
            disabled={loadingDownloads[row.original.id]}
            size="xs"
            variant="form"
            onClick={(e) => handleDownload(e, row.original)}
          >
            {loadingDownloads[row.original.id] ? (
              <SimpleSpinner />
            ) : (
              <CloudDownload size={16} />
            )}
          </Button>
        ),
      },
    ],
    [randomizedProductTags, loadingDownloads],
  );

  // Set up the table instance
  const table = useReactTable({
    data: products,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="space-y-4">
      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          className="pl-10 pr-10 w-full md:max-w-sm"
          placeholder="Search products..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table className="w-full mx-auto">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="text-center"
                    style={{
                      cursor: header.column.getCanSort()
                        ? "pointer"
                        : "default",
                    }}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="inline-flex items-center">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                      {header.column.getCanSort() && (
                        <span className="ml-1">
                          {{
                            asc: <ArrowUp01 size={16} />,
                            desc: <ArrowDown10 size={16} />,
                          }[header.column.getIsSorted() as string] ?? ""}
                        </span>
                      )}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="text-start cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-900"
                  onClick={() => handleRowClick(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow className="text-center">
                <TableCell
                  className="text-center py-6"
                  colSpan={columns.length}
                >
                  No products found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
