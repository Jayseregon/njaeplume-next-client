import { z } from "zod";
import { User } from "@clerk/nextjs/server";

// Zod schemas for validation
export const emailAddressSchema = z.object({
  id: z.string(),
  emailAddress: z.string().email(),
});

export const userSchema = z.object({
  id: z.string(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  primaryEmailAddressId: z.string().nullable(),
  emailAddresses: z.array(emailAddressSchema),
  publicMetadata: z.object({
    role: z.string().optional(),
  }),
});

export const usersSchema = z.array(userSchema);

// TypeScript interfaces (derived from Zod schemas)
export type SerializableUser = z.infer<typeof userSchema>;
export type UserEmailAddress = z.infer<typeof emailAddressSchema>;

/**
 * Serializes a Clerk User object into a plain SerializableUser object
 * that can be safely passed from server to client components
 */
export function serializeClerkUser(user: User): SerializableUser {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    primaryEmailAddressId: user.primaryEmailAddressId,
    emailAddresses: user.emailAddresses.map((email) => ({
      id: email.id,
      emailAddress: email.emailAddress,
    })),
    publicMetadata: {
      role: user.publicMetadata.role as string | undefined,
    },
  };
}

/**
 * Serializes an array of Clerk User objects and validates them with Zod
 * Returns SerializableUser[] if valid, throws an error if not
 */
export function serializeAndValidateClerkUsers(
  users: User[],
): SerializableUser[] {
  const serializedUsers = users.map(serializeClerkUser);
  const result = usersSchema.safeParse(serializedUsers);

  if (!result.success) {
    console.error("User data validation failed:", result.error);
    throw new Error("Failed to parse user data");
  }

  return result.data;
}
