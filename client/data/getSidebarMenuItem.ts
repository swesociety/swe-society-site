import { RoleAccessType, SidebarItems } from "@/data/types";
import { headerConfig } from "@/lib/header_config";
import {
  Award,
  BarChart2,
  BookUser,
  CalendarFold,
  CreditCard,
  History,
  Megaphone,
  NotebookPen,
  PencilRuler,
  Send,
  User,
  UserCog,
  Users,
} from "lucide-react";
import { APIENDPOINTS } from "./urls";

const getItem = (roleAccess: RoleAccessType): SidebarItems => {
  const links = [
    { label: "Profile", href: "/dashboard/profile", Icon: User },
    { label: "Billing", href: "/dashboard/billing", Icon: CreditCard },
    { label: "Achievement", href: "/dashboard/achievement", Icon: Award },
    { label: "Write Blog", href: "/dashboard/usersblog", Icon: NotebookPen },
  ];

  if (roleAccess.achievementmanage) {
    links.push({
      label: "Achievement Manage",
      href: "/dashboard/achievement_manage",
      Icon: Award,
    });
  }

  if (roleAccess.billingacl?.hasBillingAccess) {
    links.push({
      label: "Billing Manage",
      href: "/dashboard/billing_manage",
      Icon: CreditCard,
    });
  }

  if (roleAccess.blog) {
    links.push({
      label: "Blog Manage",
      href: "/dashboard/blog",
      Icon: NotebookPen,
    });
  }
  if (roleAccess.bulkmail) {
    links.push({ label: "Bulk Mail", href: "/dashboard/bulkmail", Icon: Send });
  }
  if (roleAccess.events) {
    links.push({
      label: "Event",
      href: "/dashboard/event",
      Icon: CalendarFold,
    });
  }
  if (roleAccess.ec) {
    links.push({
      label: "Executive Committee",
      href: "/dashboard/ec",
      Icon: BookUser,
    });
  }
  if (roleAccess.landingpage) {
    links.push({
      label: "Landing Page",
      href: "/dashboard/landingpage",
      Icon: PencilRuler,
    });
  }
  if (roleAccess.member) {
    links.push({ label: "Members", href: "/dashboard/members", Icon: Users });
  }
  if (roleAccess.notice) {
    links.push({ label: "Notice", href: "/dashboard/notice", Icon: Megaphone });
  }
  if (roleAccess.roles) {
    links.push({ label: "Roles", href: "/dashboard/roles", Icon: UserCog });
  }
  if (roleAccess.statistics) {
    links.push({
      label: "Statistics",
      href: "/dashboard/statistics",
      Icon: BarChart2,
    });
  }

  if (roleAccess.activitylog || roleAccess.roles) {
    links.push({
      label: "Activity Log",
      href: "/dashboard/activity_log",
      Icon: History,
    });
  } else {
    links.push({
      label: "My Activity",
      href: "/dashboard/activity_log",
      Icon: History,
    });
  }
  // if (roleAccess.usersblog) {
  //   links.push({
  //     label: "Users Blog",
  //     href: "/dashboard/usersblog",
  //     Icon: NotebookPen,
  //   });
  // }

  return { links };
};

export const fetchRoleAccess = async (): Promise<RoleAccessType> => {
  const response = await fetch(
    APIENDPOINTS.users.getRoleAccess,
    headerConfig()
  );
  if (!response.ok) {
    throw new Error("Failed to fetch role access data");
  }
  return response.json();
};

export default getItem;
