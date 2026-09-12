export type { ActivityLogItem } from "@/components/dashboardpage/activitylog/activityLogTypes";

export type ActivityLogResponse = {
  logs: import("@/components/dashboardpage/activitylog/activityLogTypes").ActivityLogItem[];
  totalPages: number;
  total: number;
  isAdminView: boolean;
};
