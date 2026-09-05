"use client";
import PaymentBody from "@/components/billing/billingmanage/PaymentBody";
import PaymentMethodModal from "@/components/billing/billingmanage/PaymentMethodModal";
import { useProfile } from "@/hooks/useProfile";
import React, { useState } from "react";

const BillingManage = () => {
  const [isMethodModalOpen, setIsMethodModalOpen] = useState(false);
  const { roleAccess, loading } = useProfile();
  const billingAcl = roleAccess?.billingacl;
  const canViewPaymentMethod = Boolean(billingAcl?.canViewPaymentMethod);
  const canViewPaymentType = Boolean(billingAcl?.canViewPaymentType);
  return (
    <div className="flex flex-col items-center space-y-2 pt-16 h-screen">
      <div className="w-full flex justify-end ">
        {canViewPaymentMethod && !loading && (
          <button
            onClick={() => setIsMethodModalOpen(true)}
            className="bg-gray-600 hover:bg-red-600 rounded-lg px-4 my-2 mr-2"
          >
            Manage Payment Methods
          </button>
        )}
      </div>
      {/* <AchievementComponent achievements={achievements}   fetchDataAll={fetchData} isAdmin={true}/> */}
      {isMethodModalOpen && canViewPaymentMethod && (
        <PaymentMethodModal
          onClose={() => setIsMethodModalOpen(false)}
          canEdit={Boolean(billingAcl?.canEditPaymentMethod)}
          canDelete={Boolean(billingAcl?.canDeletePaymentMethod)}
        />
      )}
      <PaymentBody
        canViewPaymentType={canViewPaymentType}
        canEditPaymentType={Boolean(billingAcl?.canEditPaymentType)}
        canDeletePaymentType={Boolean(billingAcl?.canDeletePaymentType)}
      />
    </div>
  );
};

export default BillingManage;
