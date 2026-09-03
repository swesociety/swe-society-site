export const timeZone = "Asia/Dhaka";
import { DateTime } from "luxon";

export function formatDateDDMMYYYY(date: string | Date): string {
  const d = new Date(date);
  const day = d.getDate().toString().padStart(2, "0");
  const month = (d.getMonth() + 1).toString().padStart(2, "0"); // Months are 0-indexed
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

export function combineDateAndTime(electionDate: Date, time: Date): Date {
  const newDate = new Date(electionDate);

  newDate.setHours(time.getHours());
  newDate.setMinutes(time.getMinutes());
  newDate.setSeconds(time.getSeconds());
  newDate.setMilliseconds(time.getMilliseconds());

  const specificLocalTime = DateTime.fromObject(
    {
      year: newDate.getFullYear(),
      month: newDate.getMonth() + 1,
      day: newDate.getDate(),
      hour: newDate.getHours(),
      minute: newDate.getMinutes(),
      second: newDate.getSeconds(),
    },
    { zone: timeZone }
  );
  const specificLocalTimeToUtc = specificLocalTime.toUTC();

  return specificLocalTimeToUtc.toJSDate();
}

export const Validation = (formData: {
  candidatereg_start: string;
  candidatereg_end: string;
  election_start: Date;
  election_end: Date;
  year: string;
  election_type: string;
  batch?: string;
  election_commissioner?: number;
  assistant_commissioner?: number;
}) => {
  var form_error = "";
  // Validation checks
  if (!formData.year.trim()) {
    form_error = "Please enter a year";
  }

  let value = formData.year.trim();
  if (
    !/^\d*$/.test(value) ||
    value.length !== 4 ||
    (value &&
      (Number(value) < 1900 || Number(value) > new Date().getFullYear()))
  ) {
    form_error = "Please enter a valid year";
  } else if (!formData.election_type) {
    form_error = "Please select an election type";
  } else if (formData.election_type === "Batch" && !formData.batch?.trim()) {
    form_error = "Please enter a batch";
  } else if (!formData.election_commissioner) {
    form_error = "Please select an election commissioner";
  } else if (!formData.assistant_commissioner) {
    form_error = "Please select an assistant commissioner";
  } else if (
    !formData.candidatereg_start ||
    !formData.candidatereg_end ||
    !formData.election_start ||
    !formData.election_end
  ) {
    form_error = "Please select all dates";
  }

  return form_error;
};
