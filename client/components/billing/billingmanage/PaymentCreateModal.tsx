"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";

import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getUserID, getUserReg } from "@/data/cookies/getCookies";
import { APIENDPOINTS } from "@/data/urls";
import { headerConfig } from "@/lib/header_config";
import { uploadImageToCloud } from "@/utils/ImageUploadService";

type PaymentType = {
  payment_typeid: number;
  payment_type: string;
  year: string;
  subtype: string;
  amount: number;
};

type Method = {
  payment_methodid: number;
  method_name: string;
  transaction_account: string;
  account_holder: string;
};

type Props = {
  onClose: () => void;
};



const PaymentModal: React.FC<Props> = ({ onClose }) => {
  const { toast } = useToast();
  const userId = getUserID();
  const regno = getUserReg();
  

  const [paymentTypes, setPaymentTypes] = useState<PaymentType[]>([]);
  const [methods, setMethods] = useState<Method[]>([]);
  const [selectedType, setSelectedType] = useState<PaymentType | null>(null);
  const [amount, setAmount] = useState<number>(0);
  const [methodId, setMethodId] = useState<number | null>(null);
  const [transactionId, setTransactionId] = useState<string>("");
  const [transactionSlip, setTransactionSlip] = useState<File | null>(null);
  const [transactionSlipUrl, setTransactionSlipUrl] = useState<String | null>(null);
  const [slipPreview, setSlipPreview] = useState<string>("");
const getFirstFourChars = (str: string): string => str.slice(0, 4);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const [typesRes, methodsRes] = await Promise.all([

          axios.get(`${APIENDPOINTS.billing.getIndiviudalPayments}/${getFirstFourChars(regno || '')}`, headerConfig()),
          axios.get(`${APIENDPOINTS.billing.getAllMethodTypes}`, headerConfig()),
        ]);

        setPaymentTypes(typesRes.data);
        setMethods(methodsRes.data);
      } catch (error) {
        console.error("Error fetching form data:", error);
      }
    };

    fetchData();
  }, [userId]);

  const handleSlipUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    handleFileUpload(file!);
    setTransactionSlip(file);
    if (file) {
      setSlipPreview(URL.createObjectURL(file));
    }
  };

    const handleFileUpload = async (file: File) => {
      try {
        const uploadedURL = await uploadImageToCloud(file);
        setTransactionSlipUrl(uploadedURL);
        console.log("Image uploaded successfully:", uploadedURL);
      } catch (error) {
        console.error("Failed to upload image:", error);
      }
    };

  const handleSubmit = async () => {
    if (!selectedType || !methodId || !transactionId || !transactionSlip) {
      toast({ title: "Error", description: "Please fill in all fields", variant: "destructive" });
      return;
    }

  

    const payload = {
      userId,
      payment_typeid: selectedType.payment_typeid,
      methodid: methodId,
      amount,
      transaction_id: transactionId,
      transaction_slip: transactionSlipUrl,
    };

    try {
      await axios.post(`${APIENDPOINTS.billing.createPayment}`, payload, headerConfig());

      toast({ title: "Payment Submitted", description: "Your payment has been recorded." });
      onClose();
    } catch (error) {
      console.error("Payment submission failed:", error);
      toast({ title: "Error", description: "Submission failed", variant: "destructive" });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 p-6 rounded-xl w-full max-w-lg space-y-4 shadow-xl">
        <h2 className="text-xl font-semibold mb-4">Submit Payment</h2>

        {/* Payment Type Dropdown */}
        <div>
          <Label>Payment Type</Label>
          <Select
            onValueChange={(val) => {
              const pt = paymentTypes.find((pt) => pt.payment_typeid.toString() === val);
              setSelectedType(pt || null);
              if (pt) setAmount(pt.amount);
            }}
          >
            <SelectTrigger className="bg-gray-800 text-white">
              <SelectValue placeholder="Select a payment type" />
            </SelectTrigger>
            <SelectContent>
              {paymentTypes.map((pt) => (
                <SelectItem key={pt.payment_typeid} value={pt.payment_typeid.toString()}>
                  {pt.payment_type}-{pt.subtype}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Regno */}
        <div>
          <Label>Registration No.</Label>
          <Input value={regno} disabled className="bg-gray-800 text-white" />
        </div>

        {/* Session and Semester */}
        {selectedType && (
          <>
            <div>
              <Label>Session</Label>
              <Input
                value={`${selectedType.year}-${Number(selectedType.year) + 1}`}
                disabled
                className="bg-gray-800 text-white"
              />
            </div>
            <div>
              <Label>Semester</Label>
              <Input value={selectedType.subtype} disabled className="bg-gray-800 text-white" />
            </div>
          </>
        )}

        {/* Amount */}
        <div>
          <Label>Amount</Label>
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="bg-gray-800 text-white"
          />
        </div>

        {/* Method Dropdown */}
        <div>
          <Label>Payment Method</Label>
          <Select onValueChange={(val) => setMethodId(Number(val))}>
            <SelectTrigger className="bg-gray-800 text-white">
              <SelectValue placeholder="Select a method" />
            </SelectTrigger>
            <SelectContent>
              {methods.map((m) => (
                <SelectItem key={m.payment_methodid} value={m.payment_methodid.toString()}>
                  {`${m.method_name}- ${m.transaction_account} - ${m.account_holder}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Transaction ID */}
        <div>
          <Label>Transaction ID</Label>
          <Input
            value={transactionId}
            onChange={(e) => setTransactionId(e.target.value)}
            className="bg-gray-800 text-white"
          />
        </div>

        {/* Image Upload */}
        <div>
          <Label>Transaction Slip (Image)</Label>
          <Input type="file" accept="image/*" onChange={handleSlipUpload} className="text-white" />
          {slipPreview && (
            <img
              src={slipPreview}
              alt="Preview"
              className="mt-2 rounded border border-gray-700 max-h-48 object-contain"
            />
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4 pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="bg-gray-600 text-white">
            Submit
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
