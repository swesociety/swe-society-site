
'use client'
import React, { useEffect, useState } from "react";
import { IconHeart, IconMessageCircle, IconRepeat, IconShare, IconCalendar, IconClock } from "@tabler/icons-react";
import { format, isBefore, isAfter } from "date-fns";
import { BACKENDURL } from "@/data/urls";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const EventDetailsPage = ({ params }: { params: { id: string } }) => {
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<any>(null);

  const getStatus = (start_time: any, end_time: any) => {
    const now = new Date();
    if (isBefore(now, new Date(start_time))) {
      return "Upcoming";
    } else if (isAfter(now, new Date(end_time))) {
      return "Ended";
    } else {
      return "Ongoing";
    }
  };

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const response = await fetch(`${BACKENDURL}event/${params.id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch event details");
        }
        const data = await response.json();
        setEvent(data);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [params.id]);

  if (loading) {
    return <div className="text-center p-4">Loading event details...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 p-4">Error: {error}</div>;
  }

  if (!event) {
    return <div className="text-center p-4">Event not found</div>;
  }

  const status = getStatus(event.start_time, event.end_time);

  return (
    <div className="max-w-2xl mx-auto p-4">
      {/* Cover Photo */}
      {event.coverphoto && (
        <div className="mb-6">
          <img
            src={event.coverphoto}
            alt={event.headline}
            className="w-full rounded-lg border border-gray-200 dark:border-gray-800 object-cover max-h-96"
          />
        </div>
      )}

      <div className="w-full border border-gray-200 dark:border-gray-800 rounded-xl p-4">
        <div className="flex space-x-3">
          {/* Event Creator Avatar */}
          <div className="flex-shrink-0">
            <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-xl">
              {event.headline[0]}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {event.headline}
                </span>
              </div>
              <span className="text-gray-500 dark:text-gray-400">
                {format(new Date(event.created_time), "MMM d, yyyy")}
              </span>
            </div>

            {/* Status Badge - Now positioned under the headline */}
            <div className="mt-2">
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  status === "Upcoming"
                    ? "border border-primary text-primary-foreground bg-primary"
                    : status === "Ongoing"
                    ? "bg-green-500 text-white animate-pulse"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {status}
              </span>
            </div>

            {/* Event Details */}
            <p className="mt-3 text-gray-900 dark:text-gray-100">
              {event.event_details}
            </p>

            {/* Time Details */}
            <div className="mt-4 space-y-2">
              <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
                <IconCalendar className="h-5 w-5" />
                <span>{format(new Date(event.start_time), "MMMM d, yyyy")}</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
                <IconClock className="h-5 w-5" />
                <span>
                  {format(new Date(event.start_time), "h:mm a")} - {format(new Date(event.end_time), "h:mm a")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Link href={'/events'}>
      <div className='flex flex-col items-end justify-end p-10'>    
          <Button className='flex flex-col justify-center items-end'>Back</Button></div>
          </Link>
    </div>
  );
};

export default EventDetailsPage;