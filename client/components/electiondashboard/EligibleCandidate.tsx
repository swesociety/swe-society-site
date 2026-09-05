"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getJWT } from "@/data/cookies/getCookies";
import { BACKENDURL } from "@/data/urls";
import axios from "axios";
import { useState } from "react";
import { toast } from "../ui/use-toast";

const batches = ["2019", "2020", "2021", "2022", "2023", "2024", "2025"];
const code = "oremama56";

const EligibleCandidate = () => {
  const [selectedBatch, setSelectedBatch] = useState(batches[0]);
  const [regNo, setRegNo] = useState("");
  const [open, setOpen] = useState(false); // for controlling dialog visibility

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const eligible_voter = {
      regno: `${selectedBatch}8310${regNo}`,
      election_code: code,
    };

    try {
      const res = await axios.post(
        `${BACKENDURL}election/candidatetrack/createtrackkks`,
        eligible_voter,
        {
          headers: { Authorization: `Bearer ${getJWT()}` },
        }
      );

      if (res.status === 200 || res.status === 201) {
        toast({
          title: "Success",
          description: "Eligible candidate added successfully!",
        });
        setOpen(false); // ✅ Close dialog after success
        setSelectedBatch(batches[0]);
        setRegNo("");
      }
    } catch (err: any) {
      if (err.response?.status === 400) {
        toast({
          title: "Error",
          description: "Invalid Registration Number or Batch",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "An error occurred while adding the candidate",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="bg-red-700 rounded-lg px-12 mr-2">
          Eligible Candidate
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Eligible Candidate</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-3">
              <Label htmlFor="batch-select">Select Batch</Label>
              <select
                id="batch-select"
                value={selectedBatch}
                onChange={(e) => setSelectedBatch(e.target.value)}
                className="w-full p-2 border rounded"
              >
                {batches.map((batch) => (
                  <option key={batch} value={batch}>
                    {batch}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-3">
              <Label htmlFor="regNo">Reg. No (Last 2 digits)</Label>
              <Input
                id="regNo"
                value={regNo}
                onChange={(e) => setRegNo(e.target.value)}
                placeholder="Enter last 2 digits of Reg. No"
              />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Submit</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EligibleCandidate;
