"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { PageTitle } from "@/src/components/root/PageTitle";
import ErrorBoundary from "@/src/components/root/ErrorBoundary";
import { ErrorDefaultDisplay } from "@/src/components/root/ErrorDefaultDisplay";
import { DownloadsList } from "@/src/components/account/DownloadsList";
import { Button } from "@/components/ui/button";

export default function DownloadsPage() {
  const { user, isLoaded } = useUser();
  const [downloads, setDownloads] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchDownloads() {
      if (user?.id) {
        try {
          setIsLoading(true);
          // Replace with your actual data fetching
          // const userDownloads = await getUserDownloads(user.id);
          // setDownloads(userDownloads);
          setDownloads([]); // Placeholder
        } catch (error) {
          console.error("Error fetching downloads:", error);
        } finally {
          setIsLoading(false);
        }
      }
    }

    if (isLoaded) {
      fetchDownloads();
    }
  }, [user, isLoaded]);

  if (!isLoaded || isLoading) {
    return (
      <div className="p-8 text-center">Loading your digital products...</div>
    );
  }

  if (!user) {
    return (
      <div className="p-8 text-center">
        Please sign in to access your downloads
      </div>
    );
  }

  return (
    <ErrorBoundary fallback={<ErrorDefaultDisplay />}>
      <div className="space-y-6">
        <Button
          asChild
          className="mb-4 text-foreground"
          size="sm"
          variant="ghost"
        >
          <Link className="flex items-center" href="/account">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>

        <PageTitle title="My Downloads" />

        {downloads.length > 0 ? (
          <DownloadsList downloads={downloads} />
        ) : (
          <div className="border rounded-md p-8 text-center">
            <h3 className="text-xl font-medium mb-2">No downloads available</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              You haven&apos;t purchased any digital products yet.
            </p>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}
