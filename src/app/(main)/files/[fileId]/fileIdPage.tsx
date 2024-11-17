"use client";

import { files, FoodNutrationsType } from "@/lib/db/schema";
import { Loader2, AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import Nutrations from "./nutrations";

type FileType = typeof files.$inferSelect;

const StatusDisplay = ({ status }: { status: string }) => {
  const statusConfig = {
    PENDING: {
      icon: <Loader2 className="h-8 w-8 text-yellow-500 animate-spin" />,
      title: "Processing Image",
      description:
        "We're analyzing your image to extract nutrition information. This may take a minute...",
      className: "bg-yellow-50 border-yellow-200",
    },
    PROCESSING: {
      icon: <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />,
      title: "Almost Done",
      description: "Final steps of processing your image...",
      className: "bg-blue-50 border-blue-200",
    },
    FAILED: {
      icon: <AlertCircle className="h-8 w-8 text-red-500" />,
      title: "Processing Failed",
      description:
        "We couldn't process this image. Please try uploading it again.",
      className: "bg-red-50 border-red-200",
    },
    SUCCESS: {
      icon: <CheckCircle2 className="h-8 w-8 text-green-500" />,
      title: "Processing Complete",
      description: "Your nutrition information is ready.",
      className: "bg-green-50 border-green-200",
    },
  };

  const config = statusConfig[status as keyof typeof statusConfig];

  if (!config) return null;

  return (
    <Alert className={`max-w-xl w-full ${config.className}`}>
      <div className="flex items-start gap-4">
        {config.icon}
        <div>
          <AlertTitle className="text-lg font-semibold">
            {config.title}
          </AlertTitle>
          <AlertDescription className="text-sm mt-1">
            {config.description}
          </AlertDescription>
        </div>
      </div>
    </Alert>
  );
};

interface FileIdPageProps {
  fileId: string;
}

interface data {
  userFile: FileType;
  foodNutritions: (typeof FoodNutrationsType)[];
}

const FileIdPage = ({ fileId }: FileIdPageProps) => {
  const {
    data: file,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["files", fileId],
    queryFn: async () => {
      const res = await fetch(`/api/files/${fileId}`);
      if (!res.ok) throw new Error("Failed to fetch file");
      return res.json() as Promise<data>;
    },
    refetchInterval: (query) => {
      const status = query.state.data?.userFile.uploadStatus;
      return status === "PROCESSING" || status === "PENDING" ? 500 : false;
    },
  });

  // Loading state
  if (isLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <Alert className="max-w-xl w-full bg-blue-50 border-blue-200">
          <Loader2 className="size-4 text-blue-500 animate-spin" />
          <AlertTitle>Loading</AlertTitle>
          <AlertDescription>Loading file information...</AlertDescription>
        </Alert>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <Alert className="max-w-xl w-full bg-red-50 border-red-200">
          <AlertCircle className="h-8 w-8 text-red-500" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load file information. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // File not found state
  if (!file) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <Alert className="max-w-xl w-full bg-red-50 border-red-200">
          <AlertCircle className="h-8 w-8 text-red-500" />
          <AlertTitle>File Not Found</AlertTitle>
          <AlertDescription>
            The requested file could not be found. It may have been deleted or
            moved.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <section className="h-full w-full flex flex-col px-5 py-6 gap-6 overflow-y-auto">
      <div className="w-full max-w-6xl mx-auto">
        <Link
          href="/"
          className="text-muted-foreground text-xs flex gap-2 items-center mb-2"
        >
          <ArrowLeft className="size-4" />
          Go Back
        </Link>
        <div className="flex items-center gap-2 mb-2">
          <div
            className={`w-2 h-2 rounded-full ${
              file.userFile.uploadStatus === "SUCCESS"
                ? "bg-green-500"
                : file.userFile.uploadStatus === "FAILED"
                ? "bg-red-500"
                : "bg-yellow-500 animate-pulse"
            }`}
          />
          <h2 className="text-2xl font-semibold">{file.userFile.name}</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          {/* Uploaded on {file.createAt?.toLocaleDateString()} */}
        </p>
      </div>

      <div className="w-full h-full flex flex-col items-center gap-6">
        <StatusDisplay status={file.userFile.uploadStatus} />

        {file.userFile.uploadStatus === "SUCCESS" && (
          <Nutrations nutrations={file.foodNutritions} />
        )}
      </div>
    </section>
  );
};

export default FileIdPage;
