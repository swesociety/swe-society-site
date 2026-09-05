"use client";

import getItem from "@/data/getSidebarMenuItem";
import { SidebarItems } from "@/data/types";
import { useProfile } from "@/hooks/useProfile";
import { LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";
import DashboardHeader from "./DashboardHeader";
import SidebarDesktop from "./SidebarDesktop";
import SidebarMobile from "./SidebarMobile";

function SideBar() {
  const { roleAccess, loading: profileLoading } = useProfile();
  const [sidebarItems, setSidebarItems] = useState<SidebarItems>({ links: [] });

  useEffect(() => {
    if (roleAccess) {
      const items = getItem(roleAccess);
      setSidebarItems(items);
    }
  }, [roleAccess]);

  if (profileLoading && !roleAccess) {
    return (
      <div className="h-screen flex justify-center items-center">
        <LoaderCircle className="animate-spin w-10 h-10" />
      </div>
    );
  }

  return (
    <>
      <DashboardHeader />
      <div className="lg:visible invisible">
        <SidebarDesktop sidebarItems={sidebarItems} />
      </div>
      <div className="lg:invisible visible z-10">
        <SidebarMobile sidebarItems={sidebarItems} />
      </div>
    </>
  );
}

export default SideBar;
