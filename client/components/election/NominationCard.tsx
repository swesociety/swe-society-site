"use client";

import { Check, Trash2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { MdReportGmailerrorred } from "react-icons/md";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getJWT } from "@/data/cookies/getCookies";
import { APIENDPOINTS } from "@/data/urls";
import { encryptObject, reqSalt_keys, xorEncrypt } from "@/utils/encrypt_req";
import axios from "axios";

interface CandidateProps {
  candidate_id: number;
  electionid: number;
  userid: number;
  marka_name: string;
  slogan: string;
  logo_url: string;
  committeepostid: number;
  request_approval_status: boolean;
  created_at: string;
  fullname: string;
  profile_picture: string;
  session: string;
  post_name: string;
}

export function NominationCard({
  candidate,
  fetch,
}: {
  candidate: CandidateProps;
  fetch: () => Promise<void>;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const encrypted_candidate_id_update = xorEncrypt(
    candidate.candidate_id.toString(),
    reqSalt_keys.candidate.updateNomination
  );
  const encrypted_candidate_id_delete = xorEncrypt(
    candidate.candidate_id.toString(),
    reqSalt_keys.candidate.deleteNomination
  );

  const updateApproval_status = (status: boolean) => {
    axios
      .put(
        `${APIENDPOINTS.candidate.updateNomination}/${encrypted_candidate_id_update}`,

        encryptObject(
          { request_approval_status: status },
          reqSalt_keys.candidate.updateNomination
        ),
        { headers: { Authorization: `Bearer ${getJWT()}` } }
      )
      .then((res) => {
        fetch();
      });
  };
  const delete_Candidate = async () => {
    await axios.delete(
      `${APIENDPOINTS.candidate.deleteNomination}/${encrypted_candidate_id_delete}`,
      { headers: { Authorization: `Bearer ${getJWT()}` } }
    );
  };

  const handleAction = async (action: string) => {
    setIsLoading(true);
    try {
      switch (action) {
        case "accept":
          updateApproval_status(true);
          break;
        case "reject":
          updateApproval_status(false);
          break;
        case "recover":
          updateApproval_status(true);
          break;
        case "delete":
          await delete_Candidate();
          break;
      }
    } finally {
      await fetch?.();
      setIsLoading(false);
    }
  };

  return (
    <Card
      className={`overflow-hidden lg:w-[380px] bg-gray-900 hover:bg-black ${
        isLoading ? "opacity-50 pointer-events-none" : ""
      }`}
    >
      <CardHeader className="pb-0 pt-3">
        <div className="flex items-center gap-3">
          <div className="relative h-14 w-14 overflow-hidden rounded-full border-2 border-primary/10">
            <Image
              src={candidate.profile_picture || "/placeholder.svg"}
              alt={candidate.fullname}
              fill
              className="object-cover"
            />
          </div>
          <div className="flex flex-col justify-start">
            <h3 className="lg:text-red-500 text-lg font-semibold">
              {candidate.fullname}
            </h3>

            <Badge variant="outline" className="mt-1 w-min text-nowrap">
              {candidate.session}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="relative h-10 w-10 overflow-hidden rounded-md border border-border">
              <Image
                src={candidate.logo_url || "/placeholder.svg"}
                alt={candidate.marka_name}
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h4 className="font-medium">Symbol: {candidate.marka_name}</h4>
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="text-sm font-medium text-muted-foreground">
              Slogan
            </h4>
            <p className="mt-0.5 italic">"{candidate.slogan}"</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2 bg-muted/10 pt-2 pb-3">
        {candidate.request_approval_status ? (
          <>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleAction("reject")}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              ) : (
                <MdReportGmailerrorred className=" h-4 w-4" />

                // <RotateCcw className="mr-2 h-4 w-4" />
              )}
              Revoke
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAction("delete")}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              ) : (
                <Trash2 className=" h-4 w-4" />
              )}
              Delete
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleAction("accept")}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              ) : (
                <Check className=" h-4 w-4" />
              )}
              Accept
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAction("delete")}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              ) : (
                <Trash2 className=" h-4 w-4" />
              )}
              Delete
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
}
