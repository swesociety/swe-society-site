"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { ActivityLogItem } from "./activityLogTypes";

interface ActivityLogTableProps {
  logs: ActivityLogItem[];
  loading: boolean;
  isAdminView: boolean;
}

export const ActivityLogTable: React.FC<ActivityLogTableProps> = ({
  logs,
  loading,
  isAdminView,
}) => {
  if (loading) {
    return (
      <div className="border rounded-lg bg-card shadow-sm flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="border rounded-lg bg-card shadow-sm text-center py-16 text-muted-foreground">
        No activity logs found matching your criteria.
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden bg-card shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted/60 text-muted-foreground font-medium border-b">
            <tr>
              <th className="py-3 px-4">Time</th>
              {isAdminView && <th className="py-3 px-4">Actor</th>}
              {isAdminView && <th className="py-3 px-4">Role</th>}
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Action</th>
              <th className="py-3 px-4">Description</th>
              <th className="py-3 px-4">Status</th>
              {isAdminView && <th className="py-3 px-4">IP Address</th>}
            </tr>
          </thead>
          <tbody className="divide-y">
            {logs.map((log) => (
              <tr key={log.logid} className="hover:bg-muted/20 transition-colors">
                <td className="py-3 px-4 whitespace-nowrap text-xs text-muted-foreground">
                  {new Date(log.created_at).toLocaleString()}
                </td>
                {isAdminView && (
                  <td className="py-3 px-4 font-medium">
                    {log.actor_regno ? (
                      <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded">
                        {log.actor_regno}
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-xs italic">System / Guest</span>
                    )}
                  </td>
                )}
                {isAdminView && (
                  <td className="py-3 px-4 text-xs">
                    {log.actor_role ? (
                      <Badge variant="outline" className="capitalize">
                        {log.actor_role}
                      </Badge>
                    ) : (
                      "-"
                    )}
                  </td>
                )}
                <td className="py-3 px-4">
                  <Badge variant="secondary" className="capitalize text-xs">
                    {log.category}
                  </Badge>
                </td>
                <td className="py-3 px-4 font-mono text-xs font-semibold text-foreground">
                  {log.action}
                </td>
                <td className="py-3 px-4 text-xs text-muted-foreground max-w-xs truncate" title={log.description || ""}>
                  {log.description || "-"}
                </td>
                <td className="py-3 px-4">
                  {log.status === "success" ? (
                    <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/25">
                      Success
                    </Badge>
                  ) : (
                    <Badge variant="destructive">Fail</Badge>
                  )}
                </td>
                {isAdminView && (
                  <td className="py-3 px-4 font-mono text-xs text-muted-foreground">
                    {log.ip_address || "N/A"}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
