"use server";

import { clerkClient } from "@clerk/nextjs/server";

import { checkRole } from "@/src/lib/clerkUtils";
import {
  SerializableUser,
  serializeAndValidateClerkUsers,
} from "@/src/interfaces/Castle";

export async function setRole(formData: FormData): Promise<void> {
  const client = await clerkClient();

  // Check that the user trying to set the role is an admin
  if (!checkRole("castleAdmin")) {
    throw new Error("Not Authorized");
  }

  try {
    await client.users.updateUserMetadata(formData.get("id") as string, {
      publicMetadata: { role: formData.get("role") },
    });
  } catch (err) {
    throw new Error(`Failed to set role: ${err}`);
  }
}

export async function removeRole(formData: FormData): Promise<void> {
  const client = await clerkClient();

  if (!checkRole("castleAdmin")) {
    throw new Error("Not Authorized");
  }

  try {
    await client.users.updateUserMetadata(formData.get("id") as string, {
      publicMetadata: { role: null },
    });
  } catch (err) {
    throw new Error(`Failed to remove role: ${err}`);
  }
}

export async function getUsersWithRole(isAdmin: boolean) {
  const client = await clerkClient();

  if (!checkRole("castleAdmin")) {
    throw new Error("Not Authorized");
  }

  const clerkUsers = await client.users.getUserList();

  const allUsers: SerializableUser[] = serializeAndValidateClerkUsers(
    clerkUsers.data,
  );

  if (isAdmin) {
    return allUsers.filter(
      (user) => user.publicMetadata.role === "castleAdmin",
    );
  } else {
    return allUsers.filter(
      (user) => user.publicMetadata.role !== "castleAdmin",
    );
  }
}
