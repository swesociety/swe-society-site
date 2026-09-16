import { getEvents } from "./actions";
import Event from "./components/Event";

export default async function Page() {
  const initialEvents = await getEvents();

  return <Event initialEvents={initialEvents} />;
}