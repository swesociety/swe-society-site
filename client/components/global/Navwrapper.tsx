"use client";
import { usePathname } from "next/navigation";
import Navbar from "./Navbar";

export default function NavbarWrapper() {
  const pathname = usePathname();

  const isDashboard = pathname?.startsWith("/dashboard");
  const isElectionSubroute =
    pathname?.startsWith("/election/") && pathname !== "/election";
  const showNavbar = !isDashboard && !isElectionSubroute;

  if (!showNavbar) {
    return null;
  }

  return <Navbar />;
}

