import Image from "next/image";
import UserAuthForm from "./user-auth-form";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AuthenticationPage() {
  const session = await auth();
  if (session?.user) redirect("/");

  return (
    <main className="w-full h-full flex relative">
      <div className="md:hidden absolute top-2 left-2 flex item-center justify-center">
        <Image src={"/hackathong-logo.png"} alt="" width={50} height={50} />
        <p className="mt-1">CalPal</p>
      </div>
      <div className="container relative h-full flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
        <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
          <div className="absolute inset-0 bg-zinc-900" />
          <div className="relative z-20 flex items-center text-lg font-medium">
            <Image
              src={"/hackathong-logo.png"}
              alt=""
              width={100}
              height={100}
            />
            <p className="mb-6">CalPal</p>
          </div>
          <div className="relative z-20 mt-auto">
            <blockquote className="space-y-2">
              <p className="text-lg">
                &ldquo;This app transformed the way I approach health and
                wellness.&rdquo;
              </p>
              <footer className="text-sm">Lex Hacket</footer>
            </blockquote>
          </div>
        </div>
        <div className="p-8 h-full flex flex-col justify-center items-center">
          <div className="mx-auto flex w-full flex-col items-center justify-center gap-6 sm:w-[350px]">
            <div className="flex flex-col gap-2 text-center">
              <h1 className="text-2xl font-semibold tracking-tight">
                Create an account
              </h1>
              <p className="text-sm text-muted-foreground">
                Sign in with Google OAuth to get started
              </p>
            </div>
            <UserAuthForm />
          </div>
        </div>
      </div>
    </main>
  );
}
