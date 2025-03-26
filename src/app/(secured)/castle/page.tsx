"use client";

import { useEffect, useState } from "react";

import { ErrorDefaultDisplay } from "@/src/components/root/ErrorDefaultDisplay";
import { PageTitle } from "@/src/components/root/PageTitle";
import ErrorBoundary from "@/src/components/root/ErrorBoundary";
import { getUsersWithRole } from "@/src/actions/clerk/action";
import { SerializableUser } from "@/src/interfaces/Castle";
import { UsersTable } from "@/src/components/castle/UsersTable";

export default function CastlePage() {
  const [users, setUsers] = useState<SerializableUser[]>([]);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const users = await getUsersWithRole(true);

        setUsers(users);
      } catch (err) {
        console.error("Failed to fetch users:", err);
      }
    }
    fetchUsers();
  }, []);

  return (
    <ErrorBoundary fallback={<ErrorDefaultDisplay />}>
      <PageTitle title="Castle Dashboard" />
      <UsersTable users={users} />
    </ErrorBoundary>
  );
}
