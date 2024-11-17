import Navbar from "@/components/navbar";
import { Button, buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import React from "react";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className="flex flex-col h-full">
      <Navbar />
      {children}
    </main>
  );
};

export default Layout;
