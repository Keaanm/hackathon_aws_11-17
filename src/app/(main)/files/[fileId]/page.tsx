import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import FileIdPage from "./fileIdPage";

const Page = async ({ params }: { params: { fileId: string } }) => {
  const session = await auth();
  if (!session?.user) redirect("/sign-in");

  return <FileIdPage fileId={params.fileId} />;
};

export default Page;
