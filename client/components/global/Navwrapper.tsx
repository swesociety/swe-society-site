"use client";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "./Navbar";

export default function NavbarWrapper() {
  const pathname = usePathname();
  const [showNavbar, setShowNavbar] = useState<boolean>(true);
  const hiddenRoutes = ["/dashboard", "/election"];
  useEffect(() => {
    const isHiddenroute = hiddenRoutes.some((route) =>
      pathname?.startsWith(route)
    );
    setShowNavbar(!isHiddenroute);
  }, [pathname]);

  if (!showNavbar) {
    return null;
  }

  return <Navbar />;
}
