"use client";
import { z } from "zod";
import { FormProvider, useForm } from "react-hook-form";
import { APIENDPOINTS } from "@/data/urls";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import axios from "axios";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Send } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  regno: z
    .string()
    .length(10, "Registration number must be exactly 10 digits")
    .regex(/^[0-9]+$/, "Must contain only numbers")
    .regex(/^20\d{8}$/, "Must start with '20' followed by 8 digits"),
});

const RegistrationNumberInput: React.FC = () => {
  const [fetching, setFetching] = useState<boolean>(false);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      regno: "",
    },
  });

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    setFetching(true);
    try {
      const response = await axios.post(APIENDPOINTS.auth.generateOTP, {
        regno: values.regno,
      });

      if (response.status === 201) {
        toast({
          title: "Success",
          description: "OTP has been sent to your email address",
        });
        router.push(`/forgetpass?tab=otp&reg_no=${values.regno}`);
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error.response?.data?.message ||
          "Failed to generate OTP. Please try again.",
      });

      // Clear the form if user not found
      if (error.response?.status === 404) {
        form.reset();
      }
    } finally {
      setFetching(false);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center min-h-screen p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Forget Password</CardTitle>
          <CardDescription>
            Enter your registration number to receive an OTP via email
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FormProvider {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="regno"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Registration Number</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        inputMode="numeric"
                        placeholder="2020xxxxxx"
                        maxLength={10}
                        {...field}
                        onChange={(e) => {
                          // Only allow numbers
                          const value = e.target.value.replace(/[^0-9]/g, "");
                          if (value.length <= 10) {
                            field.onChange(value);
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage /> {/* Shows validation errors */}
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full"
                disabled={fetching || !form.formState.isValid}
              >
                {fetching ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="animate-spin" />
                    Sending OTP...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    Get OTP <Send className="h-4 w-4" />
                  </div>
                )}
              </Button>
            </form>
          </FormProvider>
        </CardContent>
        <CardFooter className="flex flex-col">
          <p className="flex ml-auto py-2 text-sm gap-2">
            Remember your password?
            <Link
              href="/signin"
              className="text-primary hover:underline font-medium"
            >
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default RegistrationNumberInput;
