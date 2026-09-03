
// 'use client'
// import { Suspense } from 'react';
// import { EventMarqueeDemo } from "../eventspage/EventCard";
// import { Button } from '../ui/button';
// import Link from 'next/link';
// import { usePathname } from 'next/navigation';
// function EventSection() {
//   const path = usePathname();
//   return (
//     <div>
//       {/* <h1 className="flex flex-col justify-center items-center">Events</h1> */}
//       <Suspense fallback={<div className="text-center py-10">Loading</div>}>
//       <h1 className="flex flex-col items-center font-bold text-primary">Events...</h1>

import { BACKENDURL } from "@/data/urls";
import { HomeEvents } from "../eventspage/eventsection";

     
//         <EventMarqueeDemo />
//       </Suspense>
//       {path==='/'&&(
//       <Link href={'/events'}>
//       <div className='flex flex-col items-end justify-end p-10'>    
//           <Button className='flex flex-col justify-center items-end'>All Event</Button></div>
//           </Link>
//           )}
//       <hr className="h-px my-8 bg-gray-200 border-0 dark:bg-gray-700" />
      

//     </div>
//   );
// }

// export default EventSection;


async function fetchEvents() {
  try {
    const res = await fetch(`${BACKENDURL}event/`, { 
      cache: 'no-store' // or 'force-cache' depending on your needs
    });
    return res.json();
  } catch (error) {
    return [];
  }
}

export default async function HomeEvent() {
  const events = await fetchEvents();
  return <HomeEvents events={events} />;
}