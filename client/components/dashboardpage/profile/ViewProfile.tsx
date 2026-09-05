"use client";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { UserProfile } from "@/data/types";
import { CircleSlash, Facebook, GithubIcon, LinkedinIcon } from "lucide-react";
import Link from "next/link";
import React from "react";
import ProfileCard from "./ProfileCard";
import SkillManagement from "./SkillManagement";
import CVSection from "./CVSection";
import EditProject from "./EditProject";

interface ViewProfileProps {
  values: UserProfile | undefined;
}

const ViewProfile: React.FC<ViewProfileProps> = ({ values }) => {
  const { toast } = useToast();
  const NA = () => {
    toast({
      title: "Not Available",
      duration: 1000,
    });
  };
  return (
    <div className="w-full py-2 space-y-4">
      <div className="grid grid-cols-3">
        <div className="col-span-2">
          <ProfileCard
            label="Name"
            info={values?.fullname}
            placeholder="Full Name"
            edit={false}
            className="col-span-3 mb-2"
          />

          <ProfileCard
            label="Registration no"
            info={values?.regno}
            edit={false}
            className="col-span-3 mb-2"
          />
          <ProfileCard
            label="Session"
            info={values?.session}
            placeholder="2020-21"
            edit={false}
            className="col-span-3 mb-2"
          />
          <ProfileCard
            label="Email"
            info={values?.email}
            edit={false}
            placeholder="abc@gmail.com"
            className="col-span-3 mb-2"
          />
        </div>
        <div className="flex flex-col gap-2 w-full items-center -z-10">
          {values?.is_alumni ? (
            <p className="px-4 text-center text-background bg-primary text-sm sm:text-base font-bold rounded-full text-wrap">
              Alumnus
            </p>
          ) : (
            <p className="sm:px-4 px-[2px] text-center text-primary text-xs sm:text-base font-bold rounded-full border border-primary">
              {values?.role}
            </p>
          )}
          <Avatar className="w-fit h-fit p-2">
            <AvatarImage
              src={
                values?.profile_picture ??
                "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
              }
              className="rounded-full border-2 border-white p-2"
              style={{ objectFit: "cover" }}
            />
          </Avatar>

          <div className="flex flex-wrap gap-2 justify-center">
            {values?.committee_memberships?.map((membership, index) => (
              <p
                key={`${membership.committee_name}-${membership.post_name}-${index}`}
                className="sm:px-4 px-[2px] text-center text-green-500 text-xs  font-semibold rounded-full border border-green-500"
              >
                {membership.post_name}, {membership.committee_name}
              </p>
            ))}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <ProfileCard
          label="Phone Number"
          info={values?.phone_number}
          placeholder="+8801........."
          edit={false}
          className="mb-2"
        />
        <ProfileCard
          label="WhatsApp Number"
          info={values?.whatsapp}
          edit={false}
          placeholder="Your whatsapp number"
          className="mb-2"
        />
      </div>
      <p className="text-xs font-semibold">Bio</p>
      <Textarea
        value={values?.bio}
        placeholder="Hi, I am ....."
        disabled
        className="disabled:cursor-default disabled:opacity-100 mb-2"
      />
      <div className="grid grid-cols-2 gap-2">
        <ProfileCard
          label="Home Town"
          info={values?.hometown}
          placeholder="District Name"
          edit={false}
          className="mb-2"
        />
        <ProfileCard
          label="Blood Group"
          info={values?.blood_group}
          edit={false}
          className="mb-2"
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <ProfileCard
          label="College"
          info={values?.college}
          placeholder="College Name"
          edit={false}
          className="mb-2"
        />
        <ProfileCard
          label="High School"
          info={values?.school}
          placeholder="School Name"
          edit={false}
          className="mb-2"
        />
      </div>
      <div className="grid grid-cols-2 gap-2 mb-2">
        <div>
          <p className="text-xs font-semibold">Socials</p>
          <div className="flex gap-2">
            {values?.linkedin_id ? (
              <Link href={values?.linkedin_id} target="_blank">
                <Button variant={"outline"} size={"icon"}>
                  <LinkedinIcon />
                </Button>
              </Link>
            ) : (
              <Button variant={"outline"} size={"icon"} onClick={NA}>
                <LinkedinIcon />
              </Button>
            )}
            {values?.github_id ? (
              <Link href={values?.github_id} target="_blank">
                <Button variant={"outline"} size={"icon"}>
                  <GithubIcon />
                </Button>
              </Link>
            ) : (
              <Button variant={"outline"} size={"icon"} onClick={NA}>
                <GithubIcon />
              </Button>
            )}
            {values?.stop_stalk_id ? (
              <Link href={values?.stop_stalk_id} target="_blank">
                <Button variant={"outline"} size={"icon"}>
                  <CircleSlash />
                </Button>
              </Link>
            ) : (
              <Button variant={"outline"} size={"icon"} onClick={NA}>
                <CircleSlash />
              </Button>
            )}
            {values?.facebook_id ? (
              <Link href={values?.facebook_id} target="_blank">
                <Button variant={"outline"} size={"icon"}>
                  <Facebook />
                </Button>
              </Link>
            ) : (
              <Button variant={"outline"} size={"icon"} onClick={NA}>
                <Facebook />
              </Button>
            )}
          </div>
        </div>
        <CVSection cv={values?.cv ?? null} className="mb-2" />
      </div>
      <EditProject projects={values?.projects ?? null} className="mb-2" />
      <SkillManagement
        selectedSkills={values?.skills || []}
        edit={false}
        className="mb-2"
      />
    </div>
  );
};

export default ViewProfile;
