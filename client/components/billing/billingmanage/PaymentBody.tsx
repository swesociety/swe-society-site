import React from 'react';

import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PaymentTypeManager from './PaymentTypes';
import PaymentsTable from './AdminPaymentTable';
import SocietyFeeTable from '../../../app/dashboard/(menu)/billing-manage/components/society-fee/SocietyFeeTable';

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
      <Tabs defaultValue="fee-table" className="w-full">
        <TabsList>
          <TabsTrigger value="fee-table">Society Fee Table</TabsTrigger>
          <TabsTrigger value="account">Payments</TabsTrigger>
          {canViewPaymentType && (
            <TabsTrigger value="password">Payment Types</TabsTrigger>
          )}
        </TabsList>
        <TabsContent value="fee-table" className="w-full">
          <Card className="w-full">
            <SocietyFeeTable />
          </Card>
        </TabsContent>
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
      </Tabs>
    </div>
  );
};

export default PaymentBody;
