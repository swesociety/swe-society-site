"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { clearCookies } from "@/data/cookies/deleteCookies";
import { getUserDP, getUserName, getUserReg } from "@/data/cookies/getCookies";
import { SidebarItems } from "@/data/types";
import { Home, LogOut, Menu, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useToast } from "../ui/use-toast";
import SidebarButton from "./SidebarButton";

interface SidebarMobileProps {
  sidebarItems: SidebarItems;
}
function SidebarMobile(props: SidebarMobileProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const [name, setName] = useState<string>("SWE Member");
  const [regNo, setregNo] = useState<string>("2020831000");
  const [photourl, setphotourl] = useState<string>("");
  useEffect(() => {
    setName(getUserName() as string);
    setregNo(getUserReg() as string);
    setphotourl(getUserDP() as string);
  }, []);
  const handleLogout = () => {
    clearCookies();
    toast({
      title: "Logout Successfully",
      duration: 3000,
    });
    router.push("/signin");
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button size="icon" variant="ghost" className="fixed top-3 left-3">
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0">
        <div className="h-full px-3 py-4 snap-y">
          <div className="flex flex-col gap-1 overflow-y-auto h-5/6 max-h-5/6">
            {props.sidebarItems.links.map((link, index) => (
              <SheetClose asChild key={index}>
                <Link href={link.href}>
                  <SidebarButton
                    variant={pathname === link.href ? "default" : "ghost"}
                    Icon={link.Icon}
                    className="w-full"
                  >
                    {link.label}
                  </SidebarButton>
                </Link>
              </SheetClose>
            ))}
          </div>
          <div className="absolute left-0 bottom-3 w-full px-1">
            <Drawer>
              <DrawerTrigger asChild>
                <div className="flex justify-between items-center w-full px-4 py-2 bg-background hover:bg-accent rounded-full border cursor-pointer">
                  <div className="flex gap-2 items-center">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={photourl} />
                      <AvatarFallback>SWE</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-base font-bold">{name}</p>
                      <p className="text-[11px] text-slate-300">{regNo}</p>
                    </div>
                  </div>
                  <MoreHorizontal size={20} />
                </div>
              </DrawerTrigger>
              <DrawerContent className="mb-2 p-3">
                <div className="space-y-1">
                  <Link href="/">
                    <SidebarButton size="lg" Icon={Home} className="w-full">
                      Go To Homepage
                    </SidebarButton>
                  </Link>
                  <SidebarButton
                    size="lg"
                    Icon={LogOut}
                    variant="default"
                    className="w-full"
                    onClick={handleLogout}
                  >
                    Log Out
                  </SidebarButton>
                </div>
              </DrawerContent>
            </Drawer>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default SidebarMobile;
