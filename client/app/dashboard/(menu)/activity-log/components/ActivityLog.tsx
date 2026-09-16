'use client';

import React, { useEffect, useTransition, useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { getJWT } from '@/data/cookies/getCookies';
import type { ActivityLogItem, ActivityLogResponse } from '../types';
import { fetchActivityLogs } from '../actions';
import { ActivityLogFilters } from './ActivityLogFilters';
import { ActivityLogHeader } from './ActivityLogHeader';
import { ActivityLogTable } from './ActivityLogTable';
import { ActivityLogPagination } from './ActivityLogPagination';

interface ActivityLogProps {
  initialData: ActivityLogResponse;
}

export default function ActivityLogComponent({
  initialData,
}: ActivityLogProps) {
  const { toast } = useToast();
  const [logs, setLogs] = useState<ActivityLogItem[]>(initialData.logs);
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

  const [loading, startFetchTransition] = useTransition();

  const fetchLogs = () => {
    startFetchTransition(async () => {
      try {
        const data = await fetchActivityLogs(
          getJWT() || '',
          page,
          selectedCategory,
          searchAction,
          statusFilter,
        );
        setLogs(data.logs);
        setTotalPages(data.totalPages);
        setTotalCount(data.total);
        setIsAdminView(data.isAdminView);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Something went wrong';
        toast({
          title: 'Error loading logs',
          description: errorMessage,
          variant: 'destructive',
        });
      }
    });
  };

  useEffect(() => {
    // Avoid double-fetching on mount when initialData already covers default state
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
