'use client';

import React, { useEffect, useState } from 'react';
import { APIENDPOINTS } from '@/data/urls';
import { headerConfig } from '@/lib/header_config';
import { useToast } from '@/components/ui/use-toast';
import { ActivityLogItem } from '@/components/dashboardpage/activitylog/activityLogTypes';
import { ActivityLogHeader } from '@/components/dashboardpage/activitylog/ActivityLogHeader';
import { ActivityLogFilters } from '@/components/dashboardpage/activitylog/ActivityLogFilters';
import { ActivityLogTable } from '@/components/dashboardpage/activitylog/ActivityLogTable';
import { ActivityLogPagination } from '@/components/dashboardpage/activitylog/ActivityLogPagination';
import type { ActivityLogResponse } from '../types';

interface ActivityLogProps {
  initialData: ActivityLogResponse;
}

export default function ActivityLogComponent({
  initialData,
}: ActivityLogProps) {
  const { toast } = useToast();
  const [logs, setLogs] = useState<ActivityLogItem[]>(initialData.logs);
  const [loading, setLoading] = useState<boolean>(false);
  const [isAdminView, setIsAdminView] = useState<boolean>(
    initialData.isAdminView,
  );
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(initialData.totalPages);
  const [totalCount, setTotalCount] = useState<number>(initialData.total);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchAction, setSearchAction] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      // First try admin endpoint
      let url = `${APIENDPOINTS.activityLog.getAllLogs}?page=${page}&limit=20`;
      if (selectedCategory !== 'all') url += `&category=${selectedCategory}`;
      if (searchAction) url += `&action=${encodeURIComponent(searchAction)}`;
      if (statusFilter !== 'all') url += `&status=${statusFilter}`;

      let res = await fetch(url, headerConfig());

      if (res.status === 403) {
        // Fallback to user "my" logs endpoint
        setIsAdminView(false);
        let myUrl = `${APIENDPOINTS.activityLog.getMyLogs}?page=${page}&limit=20`;
        if (selectedCategory !== 'all')
          myUrl += `&category=${selectedCategory}`;
        res = await fetch(myUrl, headerConfig());
      } else {
        setIsAdminView(true);
      }

      if (!res.ok) {
        throw new Error('Failed to fetch activity logs');
      }

      const data = await res.json();
      setLogs(data.logs || []);
      setTotalPages(data.totalPages || 1);
      setTotalCount(data.total || 0);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Something went wrong';
      toast({
        title: 'Error loading logs',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Avoid double fetching on mount if initialData is provided for default state
    if (page !== 1 || selectedCategory !== 'all' || statusFilter !== 'all') {
      fetchLogs();
    }
  }, [page, selectedCategory, statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchLogs();
  };

  const exportToCSV = () => {
    if (!logs.length) return;
    const headers = [
      'Log ID',
      'Date/Time',
      'Actor RegNo',
      'Role',
      'Action',
      'Category',
      'Target',
      'Status',
      'IP',
      'Description',
    ];
    const rows = logs.map((l) => [
      l.logid,
      new Date(l.created_at).toLocaleString(),
      l.actor_regno || 'N/A',
      l.actor_role || 'N/A',
      l.action,
      l.category,
      `${l.target_type || ''}:${l.target_id || ''}`,
      l.status,
      l.ip_address || 'N/A',
      `"${(l.description || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `activity_logs_${new Date().toISOString().split('T')[0]}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 pt-16">
      <ActivityLogHeader
        isAdminView={isAdminView}
        loading={loading}
        hasLogs={logs.length > 0}
        onRefresh={fetchLogs}
        onExportCSV={exportToCSV}
      />

      <ActivityLogFilters
        isAdminView={isAdminView}
        searchAction={searchAction}
        setSearchAction={setSearchAction}
        selectedCategory={selectedCategory}
        setSelectedCategory={(val) => {
          setSelectedCategory(val);
          setPage(1);
        }}
        statusFilter={statusFilter}
        setStatusFilter={(val) => {
          setStatusFilter(val);
          setPage(1);
        }}
        onSearchSubmit={handleSearch}
      />

      <ActivityLogTable
        logs={logs}
        loading={loading}
        isAdminView={isAdminView}
      />

      {!loading && logs.length > 0 && (
        <ActivityLogPagination
          page={page}
          totalPages={totalPages}
          totalCount={totalCount}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
