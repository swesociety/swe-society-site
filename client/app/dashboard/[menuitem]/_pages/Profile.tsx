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
import { getUserID, getUserReg } from "@/data/cookies/getCookies";
import { UserProfile } from "@/data/types";
import { APIENDPOINTS } from "@/data/urls";
import { headerConfig } from "@/lib/header_config";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { KeyRound, PencilLine } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

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

const Profile: React.FC = () => {
  const [updating, setUpdating] = useState<boolean>(false);
  const [fetching, setFetching] = useState<boolean>(true);
  const [profileData, setProfileData] = useState<UserProfile>();
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      oldpass: "",
      newpass: "",
      newconf: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const reqbody = {
        regno: getUserReg(),
        oldpass: values.oldpass,
        newpass: values.newpass,
      };
      const response = await axios.put(
        APIENDPOINTS.auth.changePassword,
        reqbody,
        headerConfig()
      );
      if (response.status === 200) {
        toast({
          title: "Password Changed Successfully",
          duration: 3000,
        });
        setDialogOpen(false);
        form.reset(); // Reset form values
      }
    } catch (error: any) {
      console.log(error);
      if (error.response.status === 404) {
        toast({
          title: "Invalid user information",
          description: "Login again to change password",
          variant: "destructive",
          duration: 3000,
        });
      } else if (error.response.status === 500) {
        toast({
          title: error.response.data.message,
          description: error.response.data.details,
          variant: "destructive",
          duration: 3000,
        });
      }
    }
  }

  function onCancel() {
    setDialogOpen(false);
    form.reset(); // Reset form values
  }

  const fetchProfileData = async () => {
    try {
      const response = await axios.get(
        `${APIENDPOINTS.users.getUserbyID}/${getUserID()}`,
        headerConfig()
      );
      if (response.status === 200) {
        setProfileData(response.data);
      }
    } catch (error: any) {
      if (error.response.status === 404) {
        console.log(error);
      }
    }
    setFetching(false);
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  if (fetching) {
    return (
      <div className="flex flex-col items-center space-y-2 pt-16 h-screen p-4">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-2 pt-16 h-screen p-4">
      {updating ? (
        <div className="flex flex-col max-w-screen-sm w-full">
          <EditProfile
            values={profileData}
            setUpdating={setUpdating}
            refreshProfileData={fetchProfileData}
          />
        </div>
      ) : (
        <div className="flex flex-col max-w-screen-sm w-full">
          <ViewProfile values={profileData} />
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
                      >
                        Cancel
                      </Button>
                      <Button type="submit">Submit</Button>
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
