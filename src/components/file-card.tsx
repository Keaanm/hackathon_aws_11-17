import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileType } from "@/lib/db/schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ExternalLinkIcon, FileIcon, Loader2, Trash2Icon } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface FileCardProps {
  card: typeof FileType;
}
export const FileCard = ({ card }: FileCardProps) => {
  const queryClient = useQueryClient();
  const deleteMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/files/${card.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        throw new Error("Failed to delete file");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["cards", "list"],
      });
      toast.success("file successfully deleted");
    },
    onError: (error) => toast.error(error.message),
  });
  return (
    <Card className="w-72 flex-shrink-0 hover:shadow-lg transition-all duration-300 border-slate-200">
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center space-x-2">
          <FileIcon className="w-4 h-4 text-slate-400" />
          <CardTitle className="text-sm font-medium truncate">
            {card.name}
          </CardTitle>
        </div>
        <CardDescription className="text-xs mt-1">
          {card.uploadStatus?.toLowerCase()}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        {card.uploadStatus === "PROCESSING" && (
          <div className="flex items-center space-x-2 text-yellow-600 bg-yellow-50 px-3 py-2 rounded-md">
            <Loader2 className="w-3 h-3 animate-spin" />
            <span className="text-xs">Processing file...</span>
          </div>
        )}
        {card.uploadStatus === "FAILED" && (
          <div className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-md">
            Processing failed
          </div>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-2 flex justify-between">
        <Link
          href={`/files/${card.id}`}
          className="text-xs flex items-center space-x-1 text-slate-600 hover:text-slate-900 transition-colors"
          // disabled={card.uploadStatus !== "SUCCESS"}
        >
          <ExternalLinkIcon className="w-3 h-3" />
          <span>View</span>
        </Link>
        <button
          onClick={() => deleteMutation.mutate()}
          className="text-xs flex items-center space-x-1 text-red-600 hover:text-red-700 transition-colors"
        >
          {deleteMutation.isPending ? (
            <div className="text-xs flex items-center space-x-1 text-blue-500 transition-colors">
              <Loader2 className="animate-spin text-blue-500 size-3" />
              <span>Deleting...</span>
            </div>
          ) : (
            <div className="text-xs flex items-center space-x-1 text-red-600 hover:text-red-700 transition-colors">
              <Trash2Icon className="w-3 h-3" />
              <span>Delete</span>
            </div>
          )}
        </button>
      </CardFooter>
    </Card>
  );
};

export default FileCard;
