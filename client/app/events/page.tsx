import { PaginatedEvents } from "@/components/eventspage/eventsection";
import { BACKENDURL } from "@/data/urls";

export const dynamic = "force-dynamic";

async function fetchEvents() {
  try {
    const res = await fetch(`${BACKENDURL}event/`, { 
      cache: 'no-store'
    });
    return res.json();
  } catch (error) {
    return [];
  }
}

export default async function EventsPage() {
  const events = await fetchEvents();
  return <PaginatedEvents events={events} itemsPerPage={6} />;
}