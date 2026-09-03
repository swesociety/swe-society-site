"use client";

import getItem, { fetchRoleAccess } from "@/data/getSidebarMenuItem";
import { SidebarItems } from "@/data/types";
import { LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";
import DashboardHeader from "./DashboardHeader";
import SidebarDesktop from "./SidebarDesktop";
import SidebarMobile from "./SidebarMobile";

function SideBar() {
  const [sidebarItems, setSidebarItems] = useState<SidebarItems>({ links: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRoleAccess = async () => {
      try {
        const roleAccess = await fetchRoleAccess();
        const items = getItem(roleAccess);
        setSidebarItems(items);
      } catch (error) {
        console.error("Failed to fetch role access:", error);
      } finally {
        setLoading(false);
      }
    };

    loadRoleAccess();
  }, []);

  if (loading) {
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
