"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileType } from "@/lib/db/schema";
import { ExternalLinkIcon, FileIcon, Loader2, Trash2Icon } from "lucide-react";
import FileCard from "./file-card";

const FileCards = () => {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["cards", "list"],
    queryFn: async () => {
      const res = await fetch(`/api/files`);
      if (!res.ok) throw new Error("Failed to fetch files");
      return res.json() as Promise<(typeof FileType)[]>;
    },
    refetchInterval: (query) => {
      if (
        query?.state?.data?.some(
          (data) =>
            data.uploadStatus === "PROCESSING" ||
            data.uploadStatus === "PENDING"
        )
      ) {
        return 500;
      }
    },
  });

  if (isLoading) {
    return (
      <div className="w-full">
        <div className="flex space-x-4 overflow-x-auto pb-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="w-72 h-40 flex-shrink-0 animate-pulse bg-slate-100 rounded-lg"
            />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="w-full flex justify-center">
        <div className="text-center space-y-4 bg-red-50 p-6 rounded-lg">
          <p className="text-red-600 font-medium">Failed to fetch your files</p>
          <button
            onClick={() => refetch()}
            className="text-sm px-4 py-2 bg-white border rounded-md hover:bg-slate-50"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="w-full flex justify-center items-center h-full">
        <div className="text-center space-y-3 p-8 rounded-lg">
          <FileIcon className="w-10 h-10 text-slate-400 mx-auto" />
          <h2 className="text-xl font-medium text-slate-700">
            No Files Uploaded
          </h2>
          <p className="text-slate-500">
            Get started by uploading your first file
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex space-x-4 overflow-x-auto pb-4">
        {data.map((card) => (
          <FileCard key={card.id} card={card} />
        ))}
      </div>
    </div>
  );
};

export default FileCards;
