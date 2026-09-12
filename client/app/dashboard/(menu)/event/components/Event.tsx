'use client';

import EventCard from '@/components/dashboardpage/event/EventCard';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { EventType } from '@/data/types';
import { headerConfig } from '@/lib/header_config';
import { CalendarFold, Loader2, Plus, X } from 'lucide-react';
import { CldUploadButton } from 'next-cloudinary';
import { useState, useTransition } from 'react';
import { createEvent, getEvents } from '../actions';

type Props = {
  initialEvents: EventType[];
};

const Event: React.FC<Props> = ({ initialEvents }) => {
  const { toast } = useToast();
  const [eventList, setEventList] = useState<EventType[]>(initialEvents);
  const [loading, setLoading] = useState<boolean>(false);
  const [isTransitioning, startTransition] = useTransition();
  const [showCreateForm, setShowCreateForm] = useState<boolean>(false);
  const [newEvent, setNewEvent] = useState<Partial<EventType>>({
    headline: '',
    event_details: '',
    start_time: '',
    end_time: '',
    coverphoto: '',
  });

  const fetchEvents = () => {
    startTransition(async () => {
      setLoading(true);
      try {
        const events = await getEvents();
        const now = new Date();
        const sortedEvents = [...events].sort((a, b) => {
          const isAOngoing =
            new Date(a.start_time) <= now && now <= new Date(a.end_time);
          const isBOngoing =
            new Date(b.start_time) <= now && now <= new Date(b.end_time);
          if (isAOngoing && !isBOngoing) return -1;
          if (!isAOngoing && isBOngoing) return 1;
          return (
            new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
          );
        });
        setEventList(sortedEvents);
      } catch (error) {
        toast({
          title: 'Failed to fetch events',
          description: 'Please try again later',
          duration: 3000,
        });
      } finally {
        setLoading(false);
      }
    });
  };

  const handleCreateEvent = () => {
    startTransition(async () => {
      setLoading(true);
      const response = await createEvent(newEvent, headerConfig());
      if (response.status === 201) {
        toast({ title: 'Event created successfully' });
        setShowCreateForm(false);
        fetchEvents();
      } else {
        toast({
          title: 'Failed to create event',
          description: 'Please try again',
          duration: 3000,
        });
      }
      setLoading(false);
    });
  };

  const handleCoverPicUpload = (result: any) => {
    if (result?.info?.secure_url) {
      const uploadedURL = result.info.secure_url;
      setNewEvent((prevData) => ({ ...prevData, coverphoto: uploadedURL }));
    }
  };

  const handleInputChange = (field: keyof EventType, value: string) => {
    setNewEvent((prev) => ({ ...prev, [field]: value }));
  };

  const isLoading = loading || isTransitioning;

  return (
    <div className="flex flex-col items-center space-y-2 pt-16 h-screen">
      <div className="sticky top-0 w-full py-8 px-6 border-b shadow-sm flex justify-between items-center bg-background z-10">
        <h2 className="text-xl font-bold gap-2 flex">
          <CalendarFold /> Events
        </h2>
        <Button
          className="flex items-center gap-2 bg-red-600 text-white"
          onClick={() => setShowCreateForm((prev) => !prev)}
          disabled={isLoading}
        >
          {showCreateForm ? (
            <>
              <X className="h-4 w-4" />
              <span>Close</span>
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" />
              <span>Create New Event</span>
            </>
          )}
        </Button>
      </div>

      {showCreateForm && (
        <div className="w-full max-w-lg p-4 bg-secondary rounded-lg shadow-lg space-y-4">
          <input
            type="text"
            placeholder="Event Headline"
            value={newEvent.headline || ''}
            onChange={(e) => handleInputChange('headline', e.target.value)}
            disabled={isLoading}
            className="w-full px-3 py-2 border rounded"
          />
          <textarea
            placeholder="Event Details"
            value={newEvent.event_details || ''}
            onChange={(e) => handleInputChange('event_details', e.target.value)}
            disabled={isLoading}
            className="w-full px-3 py-2 border rounded"
          />
          <input
            type="datetime-local"
            placeholder="Start Time"
            value={newEvent.start_time || ''}
            onChange={(e) => handleInputChange('start_time', e.target.value)}
            disabled={isLoading}
            className="w-full px-3 py-2 border rounded"
          />
          <input
            type="datetime-local"
            placeholder="End Time"
            value={newEvent.end_time || ''}
            onChange={(e) => handleInputChange('end_time', e.target.value)}
            disabled={isLoading}
            className="w-full px-3 py-2 border rounded"
          />
          <div className="flex items-center gap-4">
            <CldUploadButton
              onUpload={(result: any) => handleCoverPicUpload(result)}
              uploadPreset={process.env.NEXT_PUBLIC_IMG_UPLOAD_PRESET}
              className="bg-primary p-2 rounded"
            >
              Upload Cover Photo
            </CldUploadButton>
            {newEvent.coverphoto && (
              <img
                src={newEvent.coverphoto}
                alt="Cover"
                width={48}
                height={48}
                className="rounded"
              />
            )}
          </div>
          <Button
            onClick={handleCreateEvent}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Creating Event...' : 'Create Event'}
          </Button>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center space-y-2 pt-16">
          <Loader2 className="animate-spin" size={40} />
          <p>Fetching event information....</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
          {eventList.map((event) => (
            <EventCard key={event.eventid} {...event} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Event;
