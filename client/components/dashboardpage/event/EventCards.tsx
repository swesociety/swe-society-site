import { EventType } from "@/data/types";
import Image from "next/image";
import { format, isBefore, isAfter } from "date-fns";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { CalendarIcon } from "lucide-react";

const EventCard: React.FC<EventType> = ({
  eventid,
  start_time,
  end_time,
  headline,
  event_details,
  coverphoto,
}) => {
  const getStatus = () => {
    const now = new Date();
    if (isBefore(now, new Date(start_time))) {
      return "Upcoming";
    } else if (isAfter(now, new Date(end_time))) {
      return "Ended";
    } else {
      return "Ongoing";
    }
  };

  const status = getStatus();

  return (
    <Card className="w-full max-w-md bg-card shadow-md border border-border rounded-lg overflow-hidden transition-transform transform hover:scale-105 hover:shadow-lg relative">
      <span
        className={`absolute top-2 right-2 px-3 py-1 z-10 rounded-full text-xs font-medium ${
          status === "Upcoming"
            ? "border border-primary text-primary-foreground bg-primary"
            : status === "Ongoing"
            ? "bg-green-500 animate-pulse"
            : "bg-muted"
        }`}
      >
        {status}
      </span>

      <div className="relative h-48 w-full">
        <img
          src={coverphoto}
          alt={`${headline} cover photo`}
          // layout="fill"
          // objectFit="cover"
          className="rounded-t-lg"
        />
      </div>
      <CardHeader className="p-4">
        <CardTitle className="text-xl font-semibold text-card-foreground">
          {headline}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-3">
        <p className="text-muted-foreground text-base">
          {event_details.length > 70
            ? `${event_details.slice(0, 70)}...`
            : event_details}
        </p>
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <CalendarIcon className="h-5 w-5 text-muted-foreground" />
          <span>
            {format(new Date(start_time), "MMMM d, yyyy h:mm a")} -{" "}
            {format(new Date(end_time), "MMMM d, yyyy h:mm a")}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default EventCard;
