import { UsersTable } from "@/components/castle/UsersTable";
import { SerializableUser } from "@/interfaces/Castle";
import { PageTitle } from "@/src/components/root/PageTitle";
import { getUsersWithRole } from "@/src/actions/clerk/action";

export default async function UsersPage() {
  const customers: SerializableUser[] = await getUsersWithRole(false);

  return (
    <div className="space-y-6">
      <PageTitle title="Customers Management" />
      <UsersTable users={customers} />
    </div>
  );
}
