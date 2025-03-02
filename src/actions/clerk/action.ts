"use server";

import { clerkClient } from "@clerk/nextjs/server";

import { checkRole } from "@/src/lib/roles";

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
