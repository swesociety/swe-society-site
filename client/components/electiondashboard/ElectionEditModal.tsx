import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { getJWT } from "@/data/cookies/getCookies";
import { APIENDPOINTS, BACKENDURL } from "@/data/urls";
import axios from "axios";
import { addDays, format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { DateTime } from "luxon";
import React, { useEffect, useState } from "react";
import Select from "react-select";
import { TimePicker } from "../ui/time-picker";
import { toast } from "../ui/use-toast";
import { combineDateAndTime, timeZone } from "./functions";

interface ElectionModalProps {
  onClose: () => void;
  fetchData: () => void;
  election_info: EditElectionmodal;
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

interface EditElectionmodal {
  electionid: number;
  year: string;
  election_type: string;
  batch: string;
  candidatereg_start: Date; // ISO date string
  candidatereg_end: Date; // ISO date string
  election_start: Date; // ISO date string
  election_end: Date; // ISO date string
  election_commissioner: number;
  assistant_commissioner: number;
}

const ElectionModal: React.FC<ElectionModalProps> = ({
  onClose,
  fetchData,
  election_info,
}) => {
  const now = new Date();

  const [editelectioninfo, seteditelectioninfo] =
    useState<EditElectionmodal>(election_info);
  const [userList, setUserList] = useState<MappedUser[]>([]);
  const [electionDate, setelectionDate] = useState<Date>(
    addDays(new Date(), 7)
  );
  const [electionStart, setelectionStart] = useState<Date | undefined>();
  const [electionEnd, setelectionEnd] = useState<Date | undefined>();
  const [candidateStartDate, setCandidateStartDate] = useState<Date>();
  const [candidateEndDate, setCandidateEndDate] = useState<Date>();
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    seteditelectioninfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (
    selectedOption: MappedUser | null,
    field: keyof EditElectionmodal
  ) => {
    seteditelectioninfo((prev) => ({
      ...prev,
      [field]: selectedOption ? selectedOption.value : undefined,
    }));
  };

  const validate_form_data = (e: React.FormEvent) => {
    e.preventDefault();
    var form_error = "";
    // Validation checks
    if (!editelectioninfo.year.trim()) {
      form_error = "Please enter a year";
    }

    let value = editelectioninfo.year.trim();
    if (
      !/^\d*$/.test(value) ||
      value.length !== 4 ||
      (value &&
        (Number(value) < 1900 || Number(value) > new Date().getFullYear()))
    ) {
      form_error = "Please enter a valid year";
    } else if (!editelectioninfo.election_type) {
      form_error = "Please select an election type";
    } else if (
      editelectioninfo.election_type === "Batch" &&
      !editelectioninfo.batch?.trim()
    ) {
      form_error = "Please enter a batch";
    } else if (!editelectioninfo.election_commissioner) {
      form_error = "Please select an election commissioner";
    } else if (!editelectioninfo.assistant_commissioner) {
      form_error = "Please select an assistant commissioner";
    } else if (
      !editelectioninfo.candidatereg_start ||
      !editelectioninfo.candidatereg_end ||
      !editelectioninfo.election_start ||
      !editelectioninfo.election_end
    ) {
      form_error = "Please select all dates";
    }

    if (form_error !== "") {
      toast({
        title: form_error,
        description: "Please fill all the fields",
        variant: "destructive",
      });
    } else {
      handleSubmit(e);
    }
  };

  const reg_start = new Date(
    new Date(election_info.candidatereg_start).getFullYear(),
    new Date(election_info.candidatereg_start).getMonth(),
    new Date(election_info.candidatereg_start).getDate(),
    0,
    0,
    0,
    0
  );
  const reg_end = new Date(
    new Date(election_info.candidatereg_end).getFullYear(),
    new Date(election_info.candidatereg_end).getMonth(),
    new Date(election_info.candidatereg_end).getDate(),
    23,
    59,
    59,
    999
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const edited_election = {
      electionid: election_info.electionid,
      year: election_info.year,
      election_type: election_info.election_type,
      batch: election_info.batch,
      candidatereg_start: combineDateAndTime(
        candidateStartDate ?? reg_start,
        reg_start
      ),
      candidatereg_end: combineDateAndTime(
        candidateEndDate ?? reg_end,
        reg_end
      ),
      election_start:
        combineDateAndTime(
          electionDate,
          electionStart ?? new Date(electionDate)
        ) || election_info.election_start,
      election_end:
        combineDateAndTime(
          electionDate,
          electionEnd ?? new Date(electionDate)
        ) || election_info.election_end,
      election_commissioner: editelectioninfo.election_commissioner,
      assistant_commissioner: editelectioninfo.assistant_commissioner,
    };
    try {
      await axios
        .put(
          `${APIENDPOINTS.election.updateElection}/${election_info.electionid}`,
          edited_election,
          { headers: { Authorization: `Bearer ${getJWT()}` } }
        )
        .then((res) => {
          if (res.status === 201 || res.status === 200) {
            onClose();
            fetchData();
          }
        });
    } catch (error) {
      console.error("Error creating election:", error);

      toast({
        title: "Failed to edit election. Please try again.",
        description: (error as any).message,
      });
    }
  };
  useEffect(() => {
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
        const temp_electionDate = new Date(editelectioninfo.election_start);
        const temp_electionStart = new Date(editelectioninfo.election_start);
        const temp_electionEnd = new Date(editelectioninfo.election_end);
        setelectionDate(
          DateTime.utc(
            temp_electionDate.getFullYear(),
            temp_electionDate.getMonth() + 1,
            temp_electionDate.getDate(),
            temp_electionDate.getHours(),
            temp_electionDate.getMinutes(),
            temp_electionDate.getSeconds()
          )
            .setZone(timeZone)
            .toJSDate()
        );
        setelectionStart(
          DateTime.utc(
            temp_electionStart.getFullYear(),
            temp_electionStart.getMonth() + 1,
            temp_electionStart.getDate(),
            temp_electionStart.getHours(),
            temp_electionStart.getMinutes(),
            temp_electionStart.getSeconds()
          )
            .setZone(timeZone)
            .toJSDate()
        );
        setelectionEnd(
          DateTime.utc(
            temp_electionEnd.getFullYear(),
            temp_electionEnd.getMonth() + 1,
            temp_electionEnd.getDate(),
            temp_electionEnd.getHours(),
            temp_electionEnd.getMinutes(),
            temp_electionEnd.getSeconds()
          )
            .setZone(timeZone)
            .toJSDate()
        );
        const temp_CandidateStartDate = new Date(
          editelectioninfo.candidatereg_start
        );
        const temp_CandidateEndDate = new Date(
          editelectioninfo.candidatereg_end
        );
        setCandidateStartDate(
          DateTime.utc(
            temp_CandidateStartDate.getFullYear(),
            temp_CandidateStartDate.getMonth() + 1,
            temp_CandidateStartDate.getDate(),
            temp_CandidateStartDate.getHours(),
            temp_CandidateStartDate.getMinutes(),
            temp_CandidateStartDate.getSeconds()
          )
            .setZone(timeZone)
            .toJSDate()
        );
        setCandidateEndDate(
          DateTime.utc(
            temp_CandidateEndDate.getFullYear(),
            temp_CandidateEndDate.getMonth() + 1,
            temp_CandidateEndDate.getDate(),
            temp_CandidateEndDate.getHours(),
            temp_CandidateEndDate.getMinutes(),
            temp_CandidateEndDate.getSeconds()
          )
            .setZone(timeZone)
            .toJSDate()
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
          <h2 className="text-2xl font-bold mb-4">Edit Election</h2>
          {/* update thi latter */}
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
            value={editelectioninfo.year}
            onChange={handleInputChange}
            className="w-full p-2 rounded border"
          />
          <select
            name="election_type"
            value={editelectioninfo.election_type}
            onChange={handleInputChange}
            className="w-full p-2 rounded border"
          >
            <option value="">Select Election Type</option>
            <option value="Society">Society</option>
            <option value="Batch">Batch</option>
          </select>
          {editelectioninfo.election_type === "Batch" && (
            <input
              type="text"
              name="batch"
              placeholder="Batch"
              value={editelectioninfo.batch}
              onChange={handleInputChange}
              className="w-full p-2 rounded border"
            />
          )}

          <div className="space-y-2">
            <label className="block mt-6 mb-2">Election Period</label>
            <div className="grid grid-cols-2 gap-4 items-center">
              <div>
                <div>
                  <label className="block text-sm mb-1">Election Date</label>
                  <DatePicker date={electionDate} setDate={setelectionDate} />
                </div>
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
                  date={candidateStartDate ?? new Date()}
                  setDate={setCandidateStartDate}
                />
              </div>
              <div>
                <label className="block text-sm mb-1">End Date</label>
                <DatePicker
                  date={candidateEndDate ?? new Date()}
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
              onClick={validate_form_data}
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
