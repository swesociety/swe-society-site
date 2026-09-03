"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { clearCookies } from "@/data/cookies/deleteCookies";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { setLoginCookies } from "@/data/cookies/setCookies";
import { APIENDPOINTS } from "@/data/urls";
import { encryptId } from "@/utils/encryption";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "../ui/button";

const formSchema = z.object({
  regno: z.string().length(10),
  password: z.string(),
  longsession: z.boolean(),
});

export function SignInCard() {
  const [fetching, setFetching] = useState<boolean>(false);
  const [candidate_status, setCandidateStatus] = useState<string>("");
  const { toast } = useToast();
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      regno: "",
      password: "",
      longsession: false,
    },
  });

    const handleLogout = () => {
      clearCookies();
      
      router.push("/signin");
    };

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    setFetching(true);
    try {
      const response = await axios.post(APIENDPOINTS.auth.login, {
        regno: values.regno,
        password: values.password,
        longsession: values.longsession,
      });
      if (response.status === 200) {
        toast({
          title: "Logged in successfully",
          description: `${response.data.user.fullname} welcome to SWE Society`,
        });
        const expirationTime = values.longsession ? 30 : 1 / 24;

        setLoginCookies(
          response.data.token,
          expirationTime,
          response.data.user.fullname,
          response.data.user.profile_picture,
          response.data.user.regno,
          response.data.user.userid,
          response.data.user.role
        );

        const electionId = response.data.electionid;
        const candidateStatus = response.data.candidate_stauts;
        const userRole = response.data.user.roleid;

        console.log(userRole)
        console.log(electionId)
          console.log(candidateStatus)
     if (userRole != 2) {
  // not a voter → profile
  router.push("/dashboard/profile");
} else if (electionId) {
  if (candidateStatus === "registered" || candidateStatus === "casting") {
   
    router.push(`/election/${encryptId(electionId, "vote_key")}/vote`);
  } else if (candidateStatus === "voted") {
    
    toast({
      title: "Already Voted",
      description: `${response.data.user.fullname}, you have already cast your vote.`,
    });
    handleLogout();
  } else if (!candidateStatus || candidateStatus === null) {
   
    toast({
      title: "Not Registered",
      description: `${response.data.user.fullname}, you are not registered to vote. Please contact admin.`,
    });
    handleLogout();
  }
} else {
  // no election → fallback
  router.push("/dashboard/profile");
}
      }
    } catch (error: any) {
      console.log(error.response.status);
      if (error.response.status === 404) {
        toast({
          title: error.response.data.message,
        });
      } else if (error.response.status === 500) {
        toast({
          title: error.response.data.message,
          description: error.response.data.details,
        });
      }
    }
    setFetching(false);
  };

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Sign in</CardTitle>
        <CardDescription>
          Enter your credential below to login to your account.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-2"
          >
            <FormField
              control={form.control}
              name="regno"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Registration Number</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="2020831000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="longsession"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="flex items-center">
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                      <FormLabel className="ml-2">
                        Remember me for a month
                      </FormLabel>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={fetching}>
              {fetching ? <Loader2 className="animate-spin" /> : "Sign in"}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col">
        <Link
          href="/forgetpass"
          className="ml-auto py-2 inline-block text-sm underline"
        >
          Forgot your password?
        </Link>
      </CardFooter>
    </Card>
  );
}
