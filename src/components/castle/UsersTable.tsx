"use client";

import { useMemo, useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState,
  getFilteredRowModel,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { setRole, removeRole } from "@/actions/clerk/action";
import { SerializableUser } from "@/interfaces/Castle";

export const UsersTable = ({ users }: { users: SerializableUser[] }) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState<Record<string, boolean>>({});
  // Add state for sorting and filtering with default sort by lastName
  const [sorting, setSorting] = useState<SortingState>([
    { id: "lastName", desc: false },
  ]);
  const [globalFilter, setGlobalFilter] = useState("");

  const handleSetRole = async (userId: string, role: string) => {
    setIsSubmitting((prev) => ({ ...prev, [userId]: true }));

    const formData = new FormData();

    formData.append("id", userId);
    formData.append("role", role);

    try {
      await setRole(formData);
      toast.success("Role Updated", {
        description: `User role has been set to ${role}`,
      });
      router.refresh();
    } catch (error) {
      console.log("Error: ", error);
      toast.error("Error", {
        description: "Failed to update role",
      });
    } finally {
      setIsSubmitting((prev) => ({ ...prev, [userId]: false }));
    }
  };

  const handleRemoveRole = async (userId: string) => {
    setIsSubmitting((prev) => ({ ...prev, [userId]: true }));

    const formData = new FormData();

    formData.append("id", userId);

    try {
      await removeRole(formData);
      toast.success("Role Removed", {
        description: "User role has been removed",
      });
      router.refresh();
    } catch (error) {
      console.log("Error: ", error);
      toast.error("Error", {
        description: "Failed to remove role",
      });
    } finally {
      setIsSubmitting((prev) => ({ ...prev, [userId]: false }));
    }
  };

  // Define columns for TanStack Table
  const columns = useMemo<ColumnDef<SerializableUser>[]>(
    () => [
      {
        accessorKey: "firstName",
        header: "First Name",
      },
      {
        accessorKey: "lastName",
        header: "Last Name",
      },
      {
        id: "email",
        header: "Email",
        accessorFn: (row) => {
          return (
            row.emailAddresses.find(
              (email) => email.id === row.primaryEmailAddressId,
            )?.emailAddress || "No email"
          );
        },
      },
      {
        id: "role",
        header: "Current Role",
        accessorFn: (row) => row.publicMetadata.role || "None",
      },
      {
        id: "actions",
        header: "Actions",
        enableSorting: false,
        cell: ({ row }) => {
          const user = row.original;

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  disabled={isSubmitting[user.id]}
                  size="sm"
                  variant="outline"
                >
                  {isSubmitting[user.id] ? "Processing..." : "Manage Role"}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem
                  onClick={() => handleSetRole(user.id, "castleAdmin")}
                >
                  Make Admin
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleRemoveRole(user.id)}>
                  Remove Role
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [isSubmitting],
  );

  // Set up the table instance
  const table = useReactTable({
    data: users,
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
          className="pl-10 w-full md:max-w-sm"
          placeholder="Search users..."
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
                            asc: "↑",
                            desc: "↓",
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
                <TableRow key={row.id} className="text-center">
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
                  No users found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
