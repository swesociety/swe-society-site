"use client";
import { useToast } from "@/components/ui/use-toast";
import { getJWT } from "@/data/cookies/getCookies";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function SignUpPage() {
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const jwt = getJWT();
    if (jwt) {
      toast({
        title: "Already logged in",
        description: "Redirecting to profile",
        duration: 3000,
      });
      router.push("/dashboard/profile");
    } else {
      router.push("/");
    }
  }, [router, toast]);

  return (
    // <div className="flex flex-col justify-center items-center min-h-screen">
    //   <SignUpCard />
    // </div>
    null
  );
}
