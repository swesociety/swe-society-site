import React from "react";

import { AppWindowIcon, CodeIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PaymentTypeManager from "./PaymentTypes";
import PaymentsTable from "./AdminPaymentTable";
import SocietyFeeTable from "./SocietyFeeTable";

interface PaymentBodyProps {
  canViewPaymentType: boolean;
  canEditPaymentType: boolean;
  canDeletePaymentType: boolean;
}

const PaymentBody: React.FC<PaymentBodyProps> = ({
  canViewPaymentType,
  canEditPaymentType,
  canDeletePaymentType,
}) => {
  return (
    <div className="flex w-full max-w-full flex-col gap-6">
      <Tabs defaultValue="account" className="w-full">
        <TabsList>
          <TabsTrigger value="account">Payments</TabsTrigger>
          {canViewPaymentType && (
            <TabsTrigger value="password">Payment Types</TabsTrigger>
          )}
          <TabsTrigger value="fee-table">Society Fee Table</TabsTrigger>
        </TabsList>
        <TabsContent value="account" className="w-full">
          <Card className="w-full">
            <PaymentsTable />
          </Card>
        </TabsContent>
        <TabsContent value="password" className="w-full">
          <Card className="w-full">
            <PaymentTypeManager
              canEdit={canEditPaymentType}
              canDelete={canDeletePaymentType}
            />
          </Card>
        </TabsContent>
        <TabsContent value="fee-table" className="w-full">
          <Card className="w-full">
            <SocietyFeeTable />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PaymentBody;
