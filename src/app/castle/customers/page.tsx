import { clerkClient } from "@clerk/nextjs/server";

import { UsersTable } from "@/components/castle/UsersTable";
import {
  SerializableUser,
  serializeAndValidateClerkUsers,
} from "@/interfaces/Castle";
import { PageTitle } from "@/src/components/root/PageTitle";

export default async function UsersPage() {
  const client = await clerkClient();
  const clerkUsers = await client.users.getUserList({ limit: 100 });

  // Serialize and validate users data
  const users: SerializableUser[] = serializeAndValidateClerkUsers(
    clerkUsers.data,
  );

  return (
    <div className="space-y-6">
      <PageTitle title="Customers Management" />
      <UsersTable users={users} />
    </div>
  );
}
