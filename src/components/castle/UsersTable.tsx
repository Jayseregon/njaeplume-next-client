"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

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
import { setRole, removeRole } from "@/actions/clerk/action";
import { SerializableUser } from "@/interfaces/Castle";

export const UsersTable = ({ users }: { users: SerializableUser[] }) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState<Record<string, boolean>>({});

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

  return (
    <div className="rounded-md border">
      <Table className="w-full mx-auto">
        <TableHeader>
          <TableRow>
            <TableHead className="text-center">First Name</TableHead>
            <TableHead className="text-center">Last Name</TableHead>
            <TableHead className="text-center">Email</TableHead>
            <TableHead className="text-center">Current Role</TableHead>
            <TableHead className="text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id} className="text-center">
              <TableCell className="font-medium">{user.firstName}</TableCell>
              <TableCell className="font-medium">{user.lastName}</TableCell>
              <TableCell>
                {user.emailAddresses.find(
                  (email) => email.id === user.primaryEmailAddressId,
                )?.emailAddress || "No email"}
              </TableCell>
              <TableCell>{user.publicMetadata.role || "None"}</TableCell>
              <TableCell>
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
              </TableCell>
            </TableRow>
          ))}
          {users.length === 0 && (
            <TableRow className="text-center">
              <TableCell className="text-center py-6" colSpan={5}>
                No users found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
