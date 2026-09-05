'use client'

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Utility Functions
const formatDate = (dateString:any) => format(new Date(dateString), 'MMM dd, yyyy');
const formatTime = (dateString:any) => format(new Date(dateString), 'hh:mm a');

// Event Card Component
const EventCard = ({ event, isHomePage = false }:any) => {
  const { headline, event_details, start_time, end_time, coverphoto } = event;

  return (
    <Card className={`w-full ${isHomePage ? 'h-[350px]' : 'h-[400px]'} flex flex-col`}>
      {coverphoto && (
        <div className="relative w-full h-48 overflow-hidden">
          <img 
            src={coverphoto || '/placeholder.jpg'} 
            alt={headline} 
            className="object-cover"
          />
        </div>
      )}
      <CardHeader>
        <CardTitle className='text-primary'>{headline}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col justify-between">
        <p className="text-sm text-muted-foreground mb-2">
          {event_details || 'No additional details'}
        </p>
        <div className="space-y-2">
          <div className="flex items-center text-sm">
            <Calendar className="mr-2 h-4 w-4" />
            {formatDate(start_time)} - {formatDate(end_time)}
          </div>
          <div className="flex items-center text-sm">
            <Clock className="mr-2 h-4 w-4" />
            {formatTime(start_time)} - {formatTime(end_time)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Home Events Section
export const HomeEvents = ({ events }:any) => {
    const path = usePathname();
  const topEvents = events.slice(0, 6);

  return (
    <>
        <div className="container mx-auto py-10 ">
       <h1 className="text-3xl font-bold text-center mb-8 text-primary">
          Latest Events
        </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {topEvents.map((event: { eventid: any }) => (
            <Link key={event.eventid} href={`/events/${event.eventid}`}>
            
          <EventCard 
            
           
            event={event} 
            isHomePage={true} 
        
          />
          </Link>
        
        ))}
      </div>
     
    </div>
    <>
    {path==='/'&&(
      <Link href={'/events'}>
      <div className='flex flex-col items-end justify-end p-10'>    
          <Button className='flex flex-col justify-center items-end'>All Events</Button></div>
          </Link>
          )}
          </>
    </>


  );
};

// Paginated Events Component
export const PaginatedEvents = ({ events, itemsPerPage = 6 }:any) => {
  const [currentPage, setCurrentPage] = useState(1);
  
  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentEvents = events.slice(indexOfFirstItem, indexOfLastItem);
  
  const totalPages = Math.ceil(events.length / itemsPerPage);

  const handlePageChange = (pageNumber:number) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold text-center mb-8 text-primary">
          All Events
        </h1>
      
      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {currentEvents.map((event: { eventid: any }) => (
            <Link key={event.eventid} href={`/events/${event.eventid}`}>
          <EventCard  event={event} />
          </Link>
        ))}
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-center items-center space-x-4">
        <Button 
          variant="outline"
          
          onClick={() => handlePageChange(currentPage - 1)} 
          disabled={currentPage === 1}
          className='hover:bg-primary'
        >
          <ChevronLeft className="mr-2" /> Previous
        </Button>
        
        <span className="text-sm">
          Page {currentPage} of {totalPages}
        </span>
        
        <Button 
          variant="outline" 
          onClick={() => handlePageChange(currentPage + 1)} 
          disabled={currentPage === totalPages}
          className='hover:bg-primary'
        >
          Next <ChevronRight className="ml-2" />
        </Button>
      </div>
      <Link href={'/'}>
      <div className='flex flex-col items-end justify-end p-10'>    
          <Button className='flex flex-col justify-center items-end'>Back</Button></div>
          </Link>
    </div>
  );
};

export default EventCard;