import FileCards from "@/components/file-cards";
import UploadModal from "@/components/upload-dialog";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth();

  if (!session?.user) redirect("/sign-in");
  return (
    <section className="flex h-full flex-col gap-6 items-center px-5 py-6 container mx-auto overflow-auto">
      <div className="flex flex-col gap-2 md:flex-row w-full items-center justify-between">
        <div className="space-y-2">
          <h1 className="font-bold text-3xl md:text-4xl relative">
            <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
              Smart Food Analysis
            </span>
            <span className="absolute -bottom-2 left-0 w-24 h-1 bg-blue-500 rounded-full"></span>
          </h1>
          <p className="text-gray-600 text-lg pt-4">
            Upload any dish. Get instant nutritional insights.
          </p>
        </div>
        <UploadModal />
      </div>
      <FileCards />
    </section>
  );
}
