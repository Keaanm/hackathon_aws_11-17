import { signOut } from "@/lib/auth";
import { Button } from "./ui/button";

export function SignOut() {
  return (
    <form
      action={async () => {
        "use server";
        await signOut();
      }}
    >
      <Button variant={"ghost"} type="submit">
        Sign Out
      </Button>
    </form>
  );
}
