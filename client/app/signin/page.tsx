"use client";
import { SignInCard } from "@/components/signinpage/SignInCard";
import { useToast } from "@/components/ui/use-toast";
import { getJWT } from "@/data/cookies/getCookies";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function SignInPage() {
  const { toast } = useToast();
  const router = useRouter();
  useEffect(() => {
    const fetchToken = () => {
      const jwt = getJWT();
      if (jwt) {
        toast({
          title: "Already logged in",
          description: "Redirecting to profile",
          duration: 3000,
        });
        router.push("/dashboard/profile");
      }
    };
    fetchToken();
  }, []);
  return (
    <div className="flex flex-col justify-center items-center min-h-screen	">
      <SignInCard />
    </div>
  );
}
