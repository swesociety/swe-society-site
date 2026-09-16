"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ActivityLogPaginationProps {
  page: number;
  totalPages: number;
  totalCount: number;
  onPageChange: (newPage: number) => void;
}

export const ActivityLogPagination: React.FC<ActivityLogPaginationProps> = ({
  page,
  totalPages,
  totalCount,
  onPageChange,
}) => {
  return (
    <div className="flex items-center justify-between text-sm border-t pt-4">
      <div className="text-muted-foreground text-xs">
        Showing Page <span className="font-semibold">{page}</span> of{" "}
        <span className="font-semibold">{totalPages}</span> ({totalCount} total events)
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(Math.max(1, page - 1))}
        >
          <ChevronLeft className="w-4 h-4 mr-1" /> Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
        >
          Next <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
};
