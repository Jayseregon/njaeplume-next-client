import { clerkClient } from "@clerk/nextjs/server";

import { UsersTable } from "@/components/castle/UsersTable";
import {
  SerializableUser,
  serializeAndValidateClerkUsers,
} from "@/interfaces/Castle";

export default async function CastlePage() {
  const client = await clerkClient();
  const clerkUsers = await client.users.getUserList({ limit: 100 });

  // Serialize and validate users data
  const users: SerializableUser[] = serializeAndValidateClerkUsers(
    clerkUsers.data,
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage user roles and permissions across the platform.
        </p>
      </div>

      <UsersTable users={users} />
    </div>
  );
}
