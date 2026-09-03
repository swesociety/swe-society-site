import React from 'react'

import { AppWindowIcon, CodeIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import PaymentTypeManager from './PaymentTypes'
import PaymentsTable from './AdminPaymentTable'


const PaymentBody = () => {
  return (
    <div className="flex w-full max-w-full flex-col gap-6">
      <Tabs defaultValue="account" className="w-full">
        <TabsList>
          <TabsTrigger value="account">Payments</TabsTrigger>
          <TabsTrigger value="password">Payment Types</TabsTrigger>
        </TabsList>
        <TabsContent value="account" className="w-full">
          <Card className="w-full">
            <PaymentsTable/>
          </Card>
        </TabsContent>
        <TabsContent value="password" className="w-full">
          <Card className="w-full">
            <PaymentTypeManager/>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default PaymentBody