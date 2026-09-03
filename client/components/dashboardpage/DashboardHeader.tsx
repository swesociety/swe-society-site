"use client";

import logo from "@/public/logo.png";
import Image from "next/image";
import Link from "next/link";

function DashboardHeader() {
  return (
    <div className="lg:pl-[270px] border-b p-2 flex justify-around items-center bg-background fixed top-0 right-0 w-full">
      <Link href="/" className="flex justify-center w-full">
        <img src="/logo.png" alt="" width={80} height={35} />
      </Link>
    </div>
  );
}

export default DashboardHeader;
