'use client';
import PaymentBody from '@/components/billing/billingmanage/PaymentBody';
import PaymentModal from '@/components/billing/billingmanage/PaymentCreateModal';
import PaymentMethodModal from '@/components/billing/billingmanage/PaymentMethodModal';
import UserPaymentsTable from '@/components/billing/billingmanage/UserPaymentTable';
import React, { useState } from 'react'

const Billing = () => {
    const [isPayFeeModalOpen, setIsPayFeeModalOpen] = useState(false);
  return (
   <div className="flex flex-col items-center space-y-2 pt-16 h-screen">
    
         <div className="w-full flex justify-end "> 
         <button 
          onClick={() => setIsPayFeeModalOpen(true)}
         className="bg-gray-600 hover:bg-red-600 rounded-lg px-4 py-3 mr-3">Pay Fee</button>
          </div>
      {/* <AchievementComponent achievements={achievements}   fetchDataAll={fetchData} isAdmin={true}/> */}
     {isPayFeeModalOpen && <PaymentModal onClose={()=>{     setIsPayFeeModalOpen(false)}
} />}
<UserPaymentsTable/>
      
    </div>
  )
}

export default Billing