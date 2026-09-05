import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { CardDescription, CardTitle } from "@/components/ui/card-hover-effect";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import axios from "axios";
import { APIENDPOINTS } from "@/data/urls";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";

interface OTPInputProps {
  reg_no: string;
}

const otpSchema = z.object({
  otp: z
    .string()
    .length(6, "OTP must be exactly 6 digits")
    .regex(/^\d+$/, "OTP must contain only numbers"),
});

type OTPFormValues = z.infer<typeof otpSchema>;

const OTPInput: React.FC<OTPInputProps> = ({ reg_no }) => {
  const [timeLeft, setTimeLeft] = useState<number>(300);
  const [canResend, setCanResend] = useState<boolean>(false);
  const [otpArray, setOtpArray] = useState<string[]>(Array(6).fill(""));
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isResending, setIsResending] = useState<boolean>(false);

  const { toast } = useToast();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    trigger,
    reset,
  } = useForm<OTPFormValues>({
    resolver: zodResolver(otpSchema),
    mode: "onChange",
  });

  useEffect(() => {
    const timer =
      timeLeft > 0 &&
      !canResend &&
      setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);

    if (timeLeft === 0) {
      setCanResend(true);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [timeLeft, canResend]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtpArray = [...otpArray];
    newOtpArray[index] = value;
    setOtpArray(newOtpArray);

    const completeOtp = newOtpArray.join("");
    setValue("otp", completeOtp);
    trigger("otp");

    if (value && index < 5) {
      const nextInput = document.querySelector(
        `input[name="otp-${index + 1}"]`
      ) as HTMLInputElement;
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !otpArray[index] && index > 0) {
      const prevInput = document.querySelector(
        `input[name="otp-${index - 1}"]`
      ) as HTMLInputElement;
      if (prevInput) {
        prevInput.focus();
        const newOtpArray = [...otpArray];
        newOtpArray[index - 1] = "";
        setOtpArray(newOtpArray);
        setValue("otp", newOtpArray.join(""));
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text");
    if (!/^\d{6}$/.test(pastedData)) return;

    const digits = pastedData.split("");
    setOtpArray(digits);
    setValue("otp", pastedData);
    trigger("otp");
  };

  const onSubmit = async (data: OTPFormValues) => {
    setIsLoading(true);
    try {
      const response = await axios.post(APIENDPOINTS.auth.verifyOTP, {
        regno: reg_no,
        otp: data.otp,
      });

      toast({
        title: "Success",
        description: response.data.message,
        duration: 5000,
      });

      // Reset form and states
      reset();
      setOtpArray(Array(6).fill(""));

      // Redirect to signin page after a short delay
      setTimeout(() => {
        router.push("/signin");
      }, 2000);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to verify OTP";

      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
        duration: 5000,
      });

      if (errorMessage.includes("expired")) {
        setCanResend(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    try {
      await axios.post(APIENDPOINTS.auth.generateOTP, {
        regno: reg_no,
      });

      toast({
        title: "OTP Resent",
        description: "A new OTP has been sent to your email",
        duration: 3000,
      });

      // Reset states
      setTimeLeft(300);
      setCanResend(false);
      setOtpArray(Array(6).fill(""));
      setValue("otp", "");
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to resend OTP";

      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
        duration: 5000,
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center min-h-screen">
      <Card className="w-full max-w-sm">
        <CardHeader className="flex flex-col items-center">
          <CardTitle>
            <Mail className="animate-bounce w-12 h-12" />
          </CardTitle>
          <CardDescription>
            Enter the OTP sent to your email address.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="grid gap-4">
            <input type="hidden" {...register("otp")} />

            <div className="flex justify-center gap-2">
              {[0, 1, 2, 3, 4, 5].map((index) => (
                <Input
                  key={index}
                  type="text"
                  name={`otp-${index}`}
                  maxLength={1}
                  className="w-12 h-12 text-center text-lg"
                  value={otpArray[index]}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  disabled={isLoading}
                />
              ))}
            </div>

            {errors.otp && (
              <p className="text-sm text-red-500 text-center">
                {errors.otp.message}
              </p>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={
                !!errors.otp || otpArray.join("").length !== 6 || isLoading
              }
            >
              {isLoading ? "Verifying..." : "Verify OTP"}
            </Button>
          </CardContent>

          <CardFooter className="flex flex-col justify-center">
            <p className="flex ml-auto py-2 text-sm gap-2">
              Remember your password?
              <Link
                href="/signin"
                className="text-primary hover:underline font-medium"
              >
                Sign in
              </Link>
            </p>
            <Button
              type="button"
              variant="ghost"
              onClick={handleResend}
              disabled={!canResend || isResending}
              className="text-sm"
            >
              {isResending
                ? "Sending..."
                : canResend
                ? "Resend OTP"
                : `Resend OTP in ${formatTime(timeLeft)}`}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default OTPInput;
