import SideBar from "@/components/dashboardpage/Sidebar";
import { Toaster } from "@/components/ui/toaster";
import React from "react";

type DashboardLayoutProps = {
  children: React.ReactNode;
};

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <>
      <SideBar />
      <main className=" lg:pl-[300px] h-screen">{children}</main>
      <Toaster />
    </>
  );
};

export default DashboardLayout;
