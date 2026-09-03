"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { format } from "date-fns";
import { APIENDPOINTS } from "@/data/urls";
import { headerConfig } from "@/lib/header_config";

interface Payment {
  paymentid: number;
  amount: number;
  transaction_id: string;
  transaction_slip: string;
  created_at: string;
  payment_status: boolean;
  fullname: string;
  session: string;
  regno: string;
  method_name: string;
  payment_type: string;
  year: string;
  subtype: string;
}

const ITEMS_PER_PAGE = 5;

const PaymentsTable = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filtered, setFiltered] = useState<Payment[]>([]);
  const [modalData, setModalData] = useState<Payment | null>(null);
  const [statusToggle, setStatusToggle] = useState<Payment | null>(null);

  const [regno, setRegno] = useState("");
  const [year, setYear] = useState("");
  const [semester, setSemester] = useState("");
  const [method, setMethod] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      const res = await axios.get(APIENDPOINTS.billing.getAllPayments, headerConfig());
      setPayments(res.data);
      setFiltered(res.data);
    };
    fetchData();
  }, []);

  useEffect(() => {
    let data = payments.filter((p) =>
      p.regno.includes(regno) &&
      p.year.includes(year) &&
      p.subtype.toLowerCase().includes(semester.toLowerCase()) &&
      p.method_name.toLowerCase().includes(method.toLowerCase()) &&
      (status === "all"
        ? true
        : status === "accepted"
        ? p.payment_status
        : status === "pending"
        ? !p.payment_status
        : true)
    );
    setFiltered(data);
    setPage(1);
  }, [regno, year, semester, method, status, payments]);

  const handleStatusUpdate = async (paymentid: number, newStatus: boolean) => {
    try {
      await axios.put(`${APIENDPOINTS.billing.updatePayment}/${paymentid}`, { payment_status: newStatus }, headerConfig());
      setPayments((prev) =>
        prev.map((p) => (p.paymentid === paymentid ? { ...p, payment_status: newStatus } : p))
      );
      setStatusToggle(null);
    } catch (err) {
      console.error(err);
    }
  };

  const startIndex = (page - 1) * ITEMS_PER_PAGE;
  const paginated = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">All Payments</h2>

      <div className="grid grid-cols-2 md:grid-cols-6 gap-2 mb-4">
        <Input placeholder="Reg. No" value={regno} onChange={(e) => setRegno(e.target.value)} />
        <Input placeholder="Year" value={year} onChange={(e) => setYear(e.target.value)} />
        <Select onValueChange={(val) => setStatus(val)}>
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="accepted">Accepted</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>
      </div>
    

      <table className="w-full text-sm border">
        <thead className="bg-gray-900">
          <tr>
            <th className="p-2 border">#</th>
            <th className="p-2 border">Reg / Name</th>
            <th className="p-2 border">Session</th>
            <th className="p-2 border">Type</th>
            <th className="p-2 border">Semester</th>
            <th className="p-2 border">Amount</th>
            <th className="p-2 border">Method</th>
            <th className="p-2 border">Status</th>
            <th className="p-2 border">Action</th>
          </tr>
        </thead>
        <tbody>
          {paginated.map((p, i) => (
            <tr key={p.paymentid} className="border">
              <td className="p-2 border">{startIndex + i + 1}</td>
              <td className="p-2 border">{p.regno}<br />{p.fullname}</td>
              <td className="p-2 border">{p.session}</td>
              <td className="p-2 border">{p.payment_type}</td>
              <td className="p-2 border">{p.subtype}</td>
              <td className="p-2 border">৳ {p.amount}</td>
              <td className="p-2 border">{p.method_name}</td>
              <td className="p-2 border">
                {p.payment_status ? <span className="text-green-600">Accepted</span> : <span className="text-yellow-600">Pending</span>}
              </td>
              <td className="p-2 border space-x-2">
                <Button size="sm" variant="outline" onClick={() => setModalData(p)}>
                  Details
                </Button>
                <Switch
                  checked={p.payment_status}
                  onCheckedChange={() => setStatusToggle(p)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="mt-4 flex justify-between">
        <Button disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</Button>
        <span>Page {page}</span>
        <Button disabled={startIndex + ITEMS_PER_PAGE >= filtered.length} onClick={() => setPage(page + 1)}>Next</Button>
      </div>

      {/* Details Modal */}
      {modalData && (
        <Dialog open={true} onOpenChange={() => setModalData(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Payment Details</DialogTitle>
            </DialogHeader>
            <div className="text-sm">
              <p><strong>Reg:</strong> {modalData.regno}</p>
              <p><strong>Name:</strong> {modalData.fullname}</p>
              <p><strong>Session:</strong> {modalData.session}</p>
              <p><strong>Type:</strong> {modalData.payment_type}</p>
              <p><strong>Semester:</strong> {modalData.subtype}</p>
              <p><strong>Amount:</strong> ৳{modalData.amount}</p>
              <p><strong>Transaction ID:</strong> {modalData.transaction_id}</p>
              <p><strong>Date:</strong> {format(new Date(modalData.created_at), "dd/MM/yyyy")}</p>
              <img src={modalData.transaction_slip} className="mt-2 max-h-64" alt="Slip" />
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Status Toggle Modal */}
      {statusToggle && (
        <Dialog open={true} onOpenChange={() => setStatusToggle(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Status Change</DialogTitle>
            </DialogHeader>
            <p>Are you sure you want to mark this payment as {statusToggle.payment_status ? "Pending" : "Accepted"}?</p>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setStatusToggle(null)}>Cancel</Button>
              <Button
                variant="destructive"
                onClick={() => handleStatusUpdate(statusToggle.paymentid, !statusToggle.payment_status)}
              >
                Confirm
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default PaymentsTable;
