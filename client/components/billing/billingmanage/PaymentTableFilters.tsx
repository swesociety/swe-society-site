"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { PaymentTypeOption } from "./paymentTypeTypes";

interface PaymentTableFiltersProps {
  regno: string;
  setRegno: (val: string) => void;
  year: string;
  setYear: (val: string) => void;
  semester: string;
  setSemester: (val: string) => void;
  method: string;
  setMethod: (val: string) => void;
  paymentTypeFilter: string;
  setPaymentTypeFilter: (val: string) => void;
  status: string;
  setStatus: (val: string) => void;
}

export const PaymentTableFilters: React.FC<PaymentTableFiltersProps> = ({
  regno,
  setRegno,
  year,
  setYear,
  semester,
  setSemester,
  method,
  setMethod,
  paymentTypeFilter,
  setPaymentTypeFilter,
  status,
  setStatus,
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
      <Input
        placeholder="Filter Reg No / Name"
        value={regno}
        onChange={(e) => setRegno(e.target.value)}
        className="bg-gray-900 border-gray-800 text-xs text-white"
      />
      <Input
        placeholder="Filter Session"
        value={year}
        onChange={(e) => setYear(e.target.value)}
        className="bg-gray-900 border-gray-800 text-xs text-white"
      />
      <Select
        value={paymentTypeFilter}
        onValueChange={(val) => setPaymentTypeFilter(val)}
      >
        <SelectTrigger className="bg-gray-900 border-gray-800 text-xs text-white">
          <SelectValue placeholder="Payment Type" />
        </SelectTrigger>
        <SelectContent className="bg-gray-950 border-gray-800 text-white">
          <SelectItem value="all">All Payment Types</SelectItem>
          {Object.values(PaymentTypeOption).map((pt) => (
            <SelectItem key={pt} value={pt}>
              {pt}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input
        placeholder="Filter Semester"
        value={semester}
        onChange={(e) => setSemester(e.target.value)}
        className="bg-gray-900 border-gray-800 text-xs text-white"
      />
      <Input
        placeholder="Filter Method"
        value={method}
        onChange={(e) => setMethod(e.target.value)}
        className="bg-gray-900 border-gray-800 text-xs text-white"
      />
      <Select value={status} onValueChange={(val) => setStatus(val)}>
        <SelectTrigger className="bg-gray-900 border-gray-800 text-xs text-white">
          <SelectValue placeholder="Status Filter" />
        </SelectTrigger>
        <SelectContent className="bg-gray-950 border-gray-800 text-white">
          <SelectItem value="all">All Statuses</SelectItem>
          <SelectItem value="accepted">Accepted Only</SelectItem>
          <SelectItem value="pending">Pending Only</SelectItem>
          <SelectItem value="verified">Verified Only</SelectItem>
          <SelectItem value="unverified">Unverified Only</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
