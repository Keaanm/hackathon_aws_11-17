import FileCards from "@/components/file-cards";
import UploadModal from "@/components/upload-dialog";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth();

  if (!session?.user) redirect("/sign-in");
  return (
    <section className="flex h-full flex-col gap-6 items-center px-5 py-6 container mx-auto">
      <div className="flex w-full items-center justify-between">
        <h1 className="font-semibold text-3xl">Check your food</h1>
        <UploadModal />
      </div>
      <FileCards />
    </section>
  );
}
