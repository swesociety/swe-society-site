import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { APIENDPOINTS, BACKENDURL } from "@/data/urls";
import { addDays, format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import React, { useEffect, useState } from "react";
import Select from "react-select";
// import { setTimeout } from "timers/promises";
import { getJWT } from "@/data/cookies/getCookies";
import { encryptObject, reqSalt_keys } from "@/utils/encrypt_req";
import axios from "axios";
import { DateTime } from "luxon";
import { TimePicker } from "../ui/time-picker";
import { toast } from "../ui/use-toast";
import { combineDateAndTime, timeZone, Validation } from "./functions";

interface ElectionModalProps {
  onClose: () => void;
  fetchData: () => void;
}

interface UserResponse {
  userid: number;
  regno: string;
  fullname: string;
}

interface MappedUser {
  id: number;
  value: number;
  label: string;
}

interface ElectionFormData {
  year: string;
  election_type: string;
  batch?: string;
  election_commissioner?: number;
  assistant_commissioner?: number;
  candidatereg_start?: string;
  candidatereg_end?: string;
  election_start?: string;
  election_end?: string;
}

const ElectionModal: React.FC<ElectionModalProps> = ({
  onClose,
  fetchData,
}) => {
  const now = new Date();

  const todayAt10AM = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    10, // hours
    0, // minutes
    0, // seconds
    0 // milliseconds
  );

  const todayAt10PM = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    22, // 10 PM in 24-hour format
    0,
    0,
    0
  );
  const [userList, setUserList] = useState<MappedUser[]>([]);
  const [formData, setFormData] = useState<ElectionFormData>({
    year: "",
    election_type: "",
    batch: "",
  });

  const [electionDate, setelectionDate] = useState<Date>(
    addDays(new Date(), 7)
  );
  const [electionStart, setelectionStart] = useState<Date | undefined>(
    todayAt10AM
  );
  const [electionEnd, setelectionEnd] = useState<Date | undefined>(todayAt10PM);
  const [candidateStartDate, setCandidateStartDate] = useState<Date>(
    new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      new Date().getDate() + 5,
      0,
      0,
      0,
      0
    )
  );
  const [candidateEndDate, setCandidateEndDate] = useState<Date>(
    new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      new Date().getDate() + 7,
      23,
      59,
      59,
      999
    )
  );

  const [disabled, setDisabled] = useState<boolean>(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (
    selectedOption: MappedUser | null,
    field: keyof ElectionFormData
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: selectedOption ? selectedOption.value : undefined,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setDisabled(true);
      const election_info = {
        year: formData.year,
        election_type: formData.election_type,
        batch: formData.election_type === "Batch" ? formData.batch : undefined,
        election_commissioner: formData.election_commissioner,
        assistant_commissioner: formData.assistant_commissioner,
        candidatereg_start:
          DateTime.fromJSDate(candidateStartDate, {
            zone: timeZone,
          }).toISO() || "",
        candidatereg_end:
          DateTime.fromJSDate(candidateEndDate, {
            zone: timeZone,
          }).toISO() || "",
        election_start: combineDateAndTime(
          electionDate,
          electionStart ?? new Date(electionDate)
        ),
        election_end: combineDateAndTime(
          electionDate,
          electionEnd ?? new Date(electionDate)
        ),
      };
      const encrypted_info = encryptObject(
        election_info,
        reqSalt_keys.election.createElection
      );

      // // Validation checks
      if (Validation(election_info) === "") {
        const response = await axios.post(
          `${APIENDPOINTS.election.createElection}`,
          encrypted_info,
          { headers: { Authorization: `Bearer ${getJWT()}` } }
        );
        if (response.status === 201 || response.status === 200) {
          onClose();
          fetchData();
        }
      } else {
        toast({
          title: Validation(election_info),
          description: "Please fill all the fields",
          variant: "destructive",
        });
      }
      setDisabled(false);
    } catch (error) {
      console.error("Error creating election:", error);

      toast({
        title: "Failed to create election. Please try again.",
        description: (error as any).message,
      });
      setTimeout(() => {
        setDisabled(false);
      }, 3000);
    }
  };
  useEffect(() => {
    console.log(candidateStartDate);
    console.log(candidateEndDate);
    const fetchUsers = async () => {
      try {
        const response = await fetch(`${BACKENDURL}users/`);
        if (!response.ok) throw new Error("Network response was not ok");
        const data: UserResponse[] = await response.json();
        setUserList(
          data.map((user) => ({
            id: user.userid,
            value: user.userid,
            label: `${user.fullname} - ${user.regno}`,
          }))
        );
      } catch (error) {
        console.error("Fetch error:", error);
      }
    };
    fetchUsers();
  }, []);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-black text-white p-8 rounded-lg w-full max-w-lg">
        <div className="flex justify-between">
          <h2 className="text-2xl font-bold mb-4">Create New Election</h2>
          <button
            onClick={onClose}
            className="bg-gray-200 p-1 w-5 h-5 flex justify-center items-center rounded-full text-black"
          >
            X
          </button>
        </div>

        <form className="space-y-4">
          <input
            type="number"
            name="year"
            placeholder="Year"
            value={formData.year}
            onChange={handleInputChange}
            className="w-full p-2 rounded border"
          />
          <select
            name="election_type"
            value={formData.election_type}
            onChange={handleInputChange}
            className="w-full p-2 rounded border"
          >
            <option value="">Select Election Type</option>
            <option value="Society">Society</option>
            <option value="Batch">Batch</option>
          </select>
          {formData.election_type === "Batch" && (
            <input
              type="text"
              name="batch"
              placeholder="Batch"
              value={formData.batch}
              onChange={handleInputChange}
              className="w-full p-2 rounded border"
            />
          )}

          <div className="space-y-2">
            <label className="block mt-6 mb-2">Election Period</label>
            <div className="grid grid-cols-2 gap-4 items-center">
              <div>
                <label className="block text-sm mb-1">Election Date</label>
                <DatePicker date={electionDate} setDate={setelectionDate} />
              </div>
              <div>
                <div className="w-full">
                  <label className="block text-sm mb-1">Start time</label>
                  <TimePicker date={electionStart} setDate={setelectionStart} />
                </div>
                <div>
                  <label className="block text-sm mb-1">End time</label>
                  <TimePicker date={electionEnd} setDate={setelectionEnd} />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block mt-6 mb-2">Candidate Form Period</label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1">Start Date</label>
                <DatePicker
                  date={candidateStartDate}
                  setDate={setCandidateStartDate}
                />
              </div>
              <div>
                <label className="block text-sm mb-1">End Date</label>
                <DatePicker
                  date={candidateEndDate}
                  setDate={setCandidateEndDate}
                />
              </div>
            </div>
          </div>

          <Select
            options={userList}
            onChange={(option) =>
              handleSelectChange(option, "election_commissioner")
            }
            className="border rounded w-full text-gray-800 bg-gray-100"
            placeholder="Election Commissioner"
          />
          <Select
            options={userList}
            onChange={(option) =>
              handleSelectChange(option, "assistant_commissioner")
            }
            className="border rounded w-full text-gray-800 bg-gray-100"
            placeholder="Assistant Commissioner"
          />

          <div className="flex justify-between">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-500 text-white rounded px-4 py-2"
            >
              Close
            </button>
            <button
              disabled={disabled}
              onClick={handleSubmit}
              className="bg-red-600 text-white rounded px-4 py-2"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface DatePickerProps {
  date: Date;
  setDate: (date: Date) => void;
}

const DatePicker: React.FC<DatePickerProps> = ({ date, setDate }) => (
  <Popover>
    <PopoverTrigger asChild>
      <Button
        variant="outline"
        className="w-full justify-start text-left font-normal"
      >
        <CalendarIcon className="mr-2 h-4 w-4" /> {format(date, "LLL dd, y")}
      </Button>
    </PopoverTrigger>
    <PopoverContent className="w-auto p-0" align="start">
      <Calendar
        mode="single"
        selected={date}
        onSelect={(newDate) => newDate && setDate(newDate)}
        defaultMonth={date}
      />
    </PopoverContent>
  </Popover>
);

export default ElectionModal;
