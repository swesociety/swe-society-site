
import { cn } from "@/lib/utils";
import Link from 'next/link';
import Marquee from "../ui/marquee";
import { Event } from "@/lib/type";
import { getEvents } from "@/lib/data";
const EventCard = ({ event }: { event: Event }) => {
  const formattedDate = new Date(event.start_time).toLocaleDateString();

  return (
    <Link href={`/events/${event.eventid}`}>
      <figure
        className={cn(
          "relative w-64 cursor-pointer overflow-hidden rounded-xl border p-4 mx-2",
          "border-gray-950/[.1] bg-gray-950/[.01] hover:bg-gray-950/[.05]",
          "dark:border-gray-50/[.1] dark:bg-gray-50/[.10] dark:hover:bg-gray-50/[.15]",
        )}
      >
        <div className="flex flex-row items-center gap-2">
          <img 
            className="rounded-full w-8 h-8 object-cover" 
            alt="" 
            src={event.coverphoto} 
          />
          <div className="flex flex-col">
            <figcaption className="text-sm font-medium dark:text-white">
              {event.headline}
            </figcaption>
            <p className="text-xs font-medium dark:text-white/40">{formattedDate}</p>
          </div>
        </div>
        <blockquote className="mt-2 text-sm">{event.event_details}</blockquote>
      </figure>
    </Link>
  );
};

export async function EventMarqueeDemo() {
  const events = await getEvents();
  
  const midpoint = Math.ceil(events.length / 2);
  const firstRow = events.slice(0, midpoint);
  const secondRow = events.slice(midpoint);

  return (
    <div className="relative flex h-[500px] w-full flex-col items-center justify-center overflow-hidden rounded-lg border bg-background md:shadow-xl">
      <Marquee pauseOnHover className="[--duration:20s]">
        {firstRow.map((event:any) => (
          <EventCard key={event.eventid} event={event} />
        ))}
      </Marquee>
      <Marquee reverse pauseOnHover className="[--duration:20s]">
        {secondRow.map((event:any) => (
          <EventCard key={event.eventid} event={event} />
        ))}
      </Marquee>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-white dark:from-background"></div>
      <div className="pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-white dark:from-background"></div>
    </div>
  );
}
