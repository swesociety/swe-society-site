"use client";
import EditProfile from "@/components/dashboardpage/profile/EditProfile";
import ViewProfile from "@/components/dashboardpage/profile/ViewProfile";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { getJWT, getUserReg } from "@/data/cookies/getCookies";
import { useProfile } from "@/hooks/useProfile";
import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound, PencilLine } from "lucide-react";
import React, { useTransition, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { changePassword } from "../actions";

const formSchema = z
  .object({
    oldpass: z.string().min(2).max(20),
    newpass: z.string().min(8).max(20),
    newconf: z.string().min(8).max(20),
  })
  .refine((data) => data.newpass === data.newconf, {
    message: "New password and confirmation password must match",
    path: ["newconf"],
  });

type PasswordFormValues = z.infer<typeof formSchema>;

const Profile: React.FC = () => {
  const [updating, setUpdating] = useState<boolean>(false);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [loading, startTransition] = useTransition();
  const { profile, loading: profileLoading, refreshProfile } = useProfile();
  const { toast } = useToast();

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      oldpass: "",
      newpass: "",
      newconf: "",
    },
  });

  function onSubmit(values: PasswordFormValues) {
    startTransition(async () => {
      const response = await changePassword(
        {
          regno: getUserReg() || "",
          oldpass: values.oldpass,
          newpass: values.newpass,
        },
        getJWT() || "",
      );

      if (response?.status === 200 || response?.status === 201) {
        toast({
          title: "Password Changed Successfully",
          duration: 3000,
        });
        setDialogOpen(false);
        form.reset();
      } else if (response?.status === 404) {
        toast({
          title: "Invalid user information",
          description: "Login again to change password",
          variant: "destructive",
          duration: 3000,
        });
      } else {
        toast({
          title: "Failed to change password",
          variant: "destructive",
          duration: 3000,
        });
      }
    });
  }

  function onCancel() {
    setDialogOpen(false);
    form.reset();
  }

  if (profileLoading) {
    return (
      <div className="flex flex-col items-center justify-center space-y-2 pt-16 h-screen p-4 text-muted-foreground">
        Loading profile...
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center space-y-2 pt-16 h-screen p-4 text-muted-foreground">
        Profile not found. Please log in again.
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-2 pt-16 h-screen p-4">
      {updating ? (
        <div className="flex flex-col max-w-screen-sm w-full">
          <EditProfile
            values={profile}
            setUpdating={setUpdating}
            refreshProfileData={refreshProfile}
          />
        </div>
      ) : (
        <div className="flex flex-col max-w-screen-sm w-full">
          <ViewProfile values={profile} />
          <div className="flex w-full justify-end gap-3 mb-3">
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="gap-2 bg-red-600 text-white"
                >
                  <KeyRound /> Change Password
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Change Password</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-1"
                  >
                    <FormField
                      control={form.control}
                      name="oldpass"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Old Password</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="newpass"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>New Password</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="newconf"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm New Password</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="justify-end flex w-full pt-2 gap-2">
                      <Button
                        variant={"ghost"}
                        type="button"
                        onClick={onCancel}
                        disabled={loading}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={loading}>
                        {loading ? "Submitting..." : "Submit"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
            <Button
              className="gap-2 bg-red-600 text-white"
              onClick={() => setUpdating(true)}
            >
              <PencilLine /> Edit
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
