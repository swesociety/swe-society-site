"use client";

import { getJWT } from "@/data/cookies/getCookies";
import { Loader2, Lock } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

interface CheckAuthenticationProps {
  children: React.ReactNode;
}

export const CheckAuthentication: React.FC<CheckAuthenticationProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const token = getJWT();
    if (!token) {
      setIsAuthenticated(false);
      const redirectUrl = pathname ? `/signin?redirect=${encodeURIComponent(pathname)}` : "/signin";
      router.push(redirectUrl);
    } else {
      setIsAuthenticated(true);
    }
  }, [pathname, router]);

  // While checking auth status
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen w-full flex flex-col justify-center items-center gap-3 bg-background text-foreground">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Verifying authentication...</p>
      </div>
    );
  }

  // If guest (not authenticated), show redirect screen while routing
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen w-full flex flex-col justify-center items-center gap-4 bg-background text-foreground p-4 text-center">
        <div className="p-3 rounded-full bg-red-500/10 text-red-500 border border-red-500/20">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold">Authentication Required</h2>
        <p className="text-sm text-muted-foreground max-w-sm">
          You must be logged in to access this page. Redirecting to sign in...
        </p>
      </div>
    );
  }

  return <>{children}</>;
};

export default CheckAuthentication;
