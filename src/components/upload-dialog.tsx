"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "./ui/button";
import Dropzone from "react-dropzone";
import { toast } from "sonner";
import { File } from "lucide-react";
import { useState } from "react";
import { Progress } from "@/components/ui/progress";
import { useQueryClient } from "@tanstack/react-query";

const UploadModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showProgressBar, setShowProgressBar] = useState(false);
  const queryClient = useQueryClient();

  const startSimulatedProgress = () => {
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((oldProgress) => {
        if (oldProgress >= 95) {
          clearInterval(interval);
          return oldProgress;
        }
        return oldProgress + 5;
      });
    }, 500);

    return interval;
  };

  const uploadFileToS3 = async (file: File) => {
    setShowProgressBar(true);
    const progress = startSimulatedProgress();

    // Get pre-signed URL from the backend
    const response = await fetch("/api/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileName: file.name, fileType: file.type }),
    });

    const { url } = await response.json();

    console.log({ url });

    // Upload the file directly to S3
    const uploadResponse = await fetch(url, {
      method: "PUT",
      body: file,
    });

    if (!uploadResponse.ok) {
      throw new Error("Failed to upload file to S3");
    }

    queryClient.invalidateQueries({
      queryKey: ["cards", "list"],
    });

    setIsOpen(false);
    setProgress(100);
    clearInterval(progress);
    toast.success("Your file is being processed");

    // Return the file URL
    return url.split("?")[0]; // Remove the query string
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>Upload Food</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload Your Food picture</DialogTitle>
          <DialogDescription>
            We will generate the description of your food.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col w-full">
          <Dropzone
            accept={{
              "image/jpeg": [".jpg", ".jpeg"],
              "image/png": [".png"],
              "image/gif": [".gif"],
            }}
            onError={(error) => toast.error(error.message)}
            multiple={false}
            onDrop={async (acceptedFiles) => {
              if (acceptedFiles.length === 0) {
                toast.error("Please upload a file.");
                return; // Exit the function early
              }
              await uploadFileToS3(acceptedFiles[0]);
            }}
          >
            {({ getRootProps, getInputProps, acceptedFiles }) => (
              <section className="w-full h-[200px] border bg-gray-50 hover:bg-gray-100 border-dashed rounded-lg border-[#E4E4E7] cursor-pointer">
                <div
                  {...getRootProps()}
                  className="w-full h-full flex flex-col items-center justify-center gap-2"
                >
                  <input
                    accept="image/jpeg, image/png, image/gif"
                    type="file "
                    {...getInputProps()}
                    id="dropzone-file"
                    className="hidden"
                    {...getInputProps()}
                  />
                  <div className="flex flex-col gap-2 w-full px-8 items-center justify-center">
                    <p className="mb-2 text-lg text-[#09090B]">
                      <span className="font-semibold">Click to Upload</span> or
                      drag and drop
                    </p>
                    {acceptedFiles && acceptedFiles[0] ? (
                      <div className="max-w-xs bg-white flex items-center rounded-md overflow-hidden outline outline-[1px] outline-zinc-200 divide-x divide-zinc-200 mx-2">
                        <div className="px-3 py-2 h-full grid place-items-center">
                          <File className="h-4 w-4 text-blue-500" />
                        </div>
                        <div className="px-3 py-2 h-full text-sm truncate">
                          {acceptedFiles[0].name}
                        </div>
                      </div>
                    ) : null}
                    {showProgressBar && (
                      <Progress className="h-1" value={progress} />
                    )}
                  </div>
                </div>
              </section>
            )}
          </Dropzone>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UploadModal;
