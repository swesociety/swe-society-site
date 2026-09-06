"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import { CATEGORIES } from "./activityLogTypes";

interface ActivityLogFiltersProps {
  isAdminView: boolean;
  searchAction: string;
  setSearchAction: (val: string) => void;
  selectedCategory: string;
  setSelectedCategory: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
}

export const ActivityLogFilters: React.FC<ActivityLogFiltersProps> = ({
  isAdminView,
  searchAction,
  setSearchAction,
  selectedCategory,
  setSelectedCategory,
  statusFilter,
  setStatusFilter,
  onSearchSubmit,
}) => {
  return (
    <div className="flex flex-wrap items-center gap-3 bg-muted/40 p-4 rounded-lg">
      <form onSubmit={onSearchSubmit} className="flex items-center gap-2 flex-1 min-w-[200px]">
        <Input
          placeholder="Search action (e.g. login, payment)..."
          value={searchAction}
          onChange={(e) => setSearchAction(e.target.value)}
          className="bg-background"
        />
        <Button type="submit" variant="secondary" size="sm">
          <Search className="w-4 h-4 mr-1" /> Search
        </Button>
      </form>

      <div className="w-[180px]">
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="bg-background">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((c) => (
              <SelectItem key={c.value} value={c.value}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isAdminView && (
        <div className="w-[140px]">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="success">Success</SelectItem>
              <SelectItem value="fail">Fail</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
};
