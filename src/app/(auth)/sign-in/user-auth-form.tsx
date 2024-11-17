import { Button } from "@/components/ui/button";
import { signIn } from "@/lib/auth";

const UserAuthForm = () => {
  return (
    <form
      action={async () => {
        "use server";
        await signIn("google", { redirectTo: "/" });
      }}
    >
      <Button variant="outline" type="submit">
        Sign in with Google
      </Button>
    </form>
  );
};

export default UserAuthForm;
