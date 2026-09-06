"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Download, RefreshCw, ShieldAlert, UserCheck } from "lucide-react";

interface ActivityLogHeaderProps {
  isAdminView: boolean;
  loading: boolean;
  hasLogs: boolean;
  onRefresh: () => void;
  onExportCSV: () => void;
}

export const ActivityLogHeader: React.FC<ActivityLogHeaderProps> = ({
  isAdminView,
  loading,
  hasLogs,
  onRefresh,
  onExportCSV,
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          {isAdminView ? (
            <ShieldAlert className="w-6 h-6 text-primary" />
          ) : (
            <UserCheck className="w-6 h-6 text-primary" />
          )}
          {isAdminView ? "System Activity Logs" : "My Activity History"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {isAdminView
            ? "Track all system operations, user actions, and administrative activities."
            : "Audit log of your recent operations and account activities."}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onRefresh} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} /> Refresh
        </Button>
        {isAdminView && (
          <Button variant="default" size="sm" onClick={onExportCSV} disabled={!hasLogs}>
            <Download className="w-4 h-4 mr-2" /> Export CSV
          </Button>
        )}
      </div>
    </div>
  );
};
