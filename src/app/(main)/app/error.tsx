"use client";
import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import {
  DashboardPage,
  ErrorState,
  PageHeader,
} from "@/components/dashboard/DashboardPrimitives";
export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <DashboardPage>
      <PageHeader
        title="Something went wrong"
        description="The dashboard could not complete that operation."
      />
      <ErrorState
        message={error.message || "An unexpected error occurred."}
        retry={reset}
      />
      <span className="sr-only">
        <AlertTriangle />
        Error
      </span>
    </DashboardPage>
  );
}
