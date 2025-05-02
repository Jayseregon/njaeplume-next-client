import { useMemo, useState } from "react"; // Import hooks
import {
  ColumnDef, // Import TanStack Table types and components
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState,
} from "@tanstack/react-table";
import { ArrowDown10, ArrowUp01 } from "lucide-react"; // Import sorting icons
import Image from "next/image";

import { OrderWithItems } from "@/interfaces/Products";
import { formatPrice } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface OrdersTableProps {
  orders: OrderWithItems[];
}

export function OrdersTable({ orders }: OrdersTableProps) {
  const pullZone = process.env.NEXT_PUBLIC_BUNNY_PUBLIC_ASSETS_PULL_ZONE_URL;
  // Add state for sorting with default sort by createdAt descending
  const [sorting, setSorting] = useState<SortingState>([
    { id: "createdAt", desc: true },
  ]);

  // Define columns for TanStack Table
  const columns = useMemo<ColumnDef<OrderWithItems>[]>(
    () => [
      {
        accessorKey: "displayId",
        header: "Order ID",
        // Enable sorting for this column
        enableSorting: true,
      },
      {
        accessorKey: "createdAt",
        header: "Date",
        // Enable sorting for this column
        enableSorting: true,
        cell: ({ row }) =>
          new Date(row.original.createdAt).toLocaleDateString(),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <Badge variant="bordered">{row.original.status}</Badge>
        ),
      },
      {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ row }) => (
          <div className="text-right">{formatPrice(row.original.amount)}</div>
        ),
      },
      {
        id: "items", // Use a unique ID for the items column
        header: "Items",
        // Disable sorting for this column
        enableSorting: false,
        cell: ({ row }) => {
          const order = row.original;

          return (
            <Dialog>
              <DialogTrigger asChild>
                <Button size="xs" variant="form">
                  View {order.items.length} item(s)
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                  <DialogTitle>Items for Order {order.displayId}</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-4 py-4 max-h-[60vh] overflow-y-auto">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 border-b pb-3 last:border-b-0"
                    >
                      <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md bg-muted">
                        {item.product.images &&
                        item.product.images.length > 0 &&
                        pullZone ? (
                          <Image
                            fill
                            alt={
                              item.product.images[0].alt_text ||
                              item.product.name
                            }
                            className="object-cover"
                            sizes="64px"
                            src={`${pullZone}/${item.product.images[0].url}`}
                          />
                        ) : (
                          <div className="h-full w-full bg-secondary" />
                        )}
                      </div>
                      <div className="flex-1 text-sm">
                        <span className="font-semibold block">
                          {item.product.name}
                        </span>
                        <span className="text-xs text-muted-foreground capitalize block">
                          {item.product.category}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Price: {formatPrice(item.price)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          );
        },
      },
    ],
    [pullZone],
  ); // Include pullZone in dependency array if used inside useMemo

  // Set up the table instance
  const table = useReactTable({
    data: orders,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  style={{
                    cursor: header.column.getCanSort() ? "pointer" : "default",
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
                    {/* Add sorting indicator */}
                    {header.column.getCanSort() && (
                      <span className="ml-1">
                        {{
                          asc: <ArrowUp01 size={16} />,
                          desc: <ArrowDown10 size={16} />,
                        }[header.column.getIsSorted() as string] ?? null}
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
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell className="h-24 text-center" colSpan={columns.length}>
                No orders found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
