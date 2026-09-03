'use client';
import PaymentBody from '@/components/billing/billingmanage/PaymentBody';
import PaymentMethodModal from '@/components/billing/billingmanage/PaymentMethodModal';
import React, { useState } from 'react'

const BillingManage = () => {
    const [isMethodModalOpen, setIsMethodModalOpen] = useState(false);
  return (
   <div className="flex flex-col items-center space-y-2 pt-16 h-screen">
    
         <div className="w-full flex justify-end "> 
         <button 
          onClick={() => setIsMethodModalOpen(true)}
         className="bg-gray-600 hover:bg-red-600 rounded-lg px-4 my-2 mr-2">Manage Payment Methods</button>
          </div>
      {/* <AchievementComponent achievements={achievements}   fetchDataAll={fetchData} isAdmin={true}/> */}
      {isMethodModalOpen && (
        <PaymentMethodModal onClose={() => setIsMethodModalOpen(false)} />
       
      )}
       <PaymentBody/>
    </div>
  )
}

export default BillingManage