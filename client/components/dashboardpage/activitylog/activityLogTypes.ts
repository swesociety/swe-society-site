export interface ActivityLogItem {
  logid: number;
  actor_userid: number | null;
  actor_regno: string | null;
  actor_role: string | null;
  action: string;
  category: string;
  target_type: string | null;
  target_id: string | null;
  description: string | null;
  metadata: any;
  ip_address: string | null;
  status: "success" | "fail";
  created_at: string;
}

export const CATEGORIES = [
  { label: "All Categories", value: "all" },
  { label: "Authentication", value: "auth" },
  { label: "Users", value: "user" },
  { label: "Roles", value: "role" },
  { label: "Payments", value: "payment" },
  { label: "Elections", value: "election" },
  { label: "Achievements", value: "achievement" },
  { label: "Blogs", value: "blog" },
  { label: "Events", value: "event" },
  { label: "Notices", value: "notice" },
  { label: "Candidate", value: "candidate" },
  { label: "Vote", value: "vote" },
];
