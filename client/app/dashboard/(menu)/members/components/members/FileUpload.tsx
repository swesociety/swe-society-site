"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { MemberRowType } from "@/data/types";
import { CloudUploadIcon, RefreshCw } from "lucide-react";
import Papa from "papaparse";
import React, { useRef, useState } from "react";

interface FileUploadProps {
  members: MemberRowType[];
  setMembers: React.Dispatch<React.SetStateAction<MemberRowType[]>>;
}

const FileUpload: React.FC<FileUploadProps> = ({ members, setMembers }) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [fetching, setFetching] = useState<boolean>(false);
  const [openCSVInput, setOpenCSVInput] = useState<boolean>(false);
  const [openUserInput, setOpenUserInput] = useState<boolean>(false);

  const [regNo, setRegNo] = useState<string>("");
  const [season, setSeason] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [fullname, setFullName] = useState<string>("");

  const handleDivClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFetching(true);
    const file = e.target.files?.[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        complete: (results) => {
          const parsedData = results.data as MemberRowType[];
          const filteredData = parsedData.filter(
            (row) => row.regno && row.session && row.email
          );
          setMembers((prevData) => [...prevData, ...filteredData]);
          console.log(members);
          setOpenCSVInput(false);
        },
      });
    }
    setFetching(false);
  };

  const handleAddUser = () => {
    if (regNo && season && email) {
      const newUser: MemberRowType = {
        regno: regNo,
        session: season,
        email: email,
        fullname: fullname
      };
      setMembers((prevData) => [...prevData, newUser]);
      setRegNo("");
      setSeason("");
      setEmail("");
      setFullName("");
      setOpenUserInput(false);
    } else {
      alert("Please fill in all fields.");
    }
  };

  return (
    <div className="flex justify-center gap-2">
      <Dialog open={openCSVInput} onOpenChange={setOpenCSVInput}>
        <DialogTrigger asChild>
          <Button variant="outline" onClick={() => setOpenCSVInput(true)}>
            <CloudUploadIcon />
            Upload CSV
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>Upload CSV</DialogHeader>
          <DialogDescription>
            Ensure the header of the CSV contains titles: regno, session, email
          </DialogDescription>
          <div className="flex justify-center w-full">
            <div
              className="flex flex-col items-center justify-center h-40 w-64 border-2 border-dashed cursor-pointer"
              onClick={handleDivClick}
            >
              {fetching ? (
                <>
                  <RefreshCw className="animate-spin" />
                  <p className="text-sm mt-2">Fetching data from CSV</p>
                </>
              ) : (
                <>
                  <CloudUploadIcon />
                  <p>Click Here To Upload CSV</p>
                  <input
                    type="file"
                    accept=".csv"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleCSV}
                  />
                </>
              )}
            </div>
          </div>
          <DialogClose asChild>
            <button className="hidden">Close</button>
          </DialogClose>
        </DialogContent>
      </Dialog>
      <Dialog open={openUserInput} onOpenChange={setOpenUserInput}>
        <DialogTrigger asChild>
          <Button variant="outline" onClick={() => setOpenUserInput(true)}>
            <CloudUploadIcon />
            Input row
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>Add User</DialogHeader>
          <DialogDescription>
            Enter member information carefully
          </DialogDescription>
          <div className="flex flex-col space-y-2">
            <div className="grid grid-cols-4 items-center gap-2">
              <label className="text-right">Reg. No:</label>
              <Input
                required
                type="number"
                className="col-span-3"
                placeholder="2020831000"
                value={regNo}
                onChange={(e) => setRegNo(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-2">
              <label className="text-right">Season:</label>
              <Input
                required
                className="col-span-3"
                placeholder="2020-21"
                value={season}
                onChange={(e) => setSeason(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-2">
              <label className="text-right">Email:</label>
              <Input
                required
                type="email"
                className="col-span-3"
                placeholder="swesociety@sust.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <Button onClick={handleAddUser}>ADD</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FileUpload;
