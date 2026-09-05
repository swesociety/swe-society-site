import React from "react";
import { Loader2 } from "lucide-react";

export const PaymentTypeLoadingState: React.FC = () => (
  <div className="flex h-64 items-center justify-center gap-2 text-gray-400">
    <Loader2 className="h-5 w-5 animate-spin" />
    <span>Loading payment types...</span>
  </div>
);
