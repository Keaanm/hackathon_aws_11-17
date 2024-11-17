import { SignOut } from "./sign-out";
import Image from "next/image";

const Navbar = async () => {
  return (
    <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 z-20 w-full">
      <div className="flex h-14 items-center w-full justify-between px-4">
        <div className="flex items-center justify-between w-full gap-2">
          <div className="relative z-20 flex items-center text-lg font-medium">
            <Image
              className="mt-4"
              src={"/hackathong-logo.png"}
              alt=""
              width={50}
              height={50}
            />
            CalPal
          </div>
          <SignOut />
        </div>
        <div />
      </div>
    </header>
  );
};

export default Navbar;
