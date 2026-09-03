'use client'
import { useEffect, useState } from 'react';
import { HoverEffect } from "../ui/card-hover-effect";
import { BACKENDURL } from '@/data/urls';
export function NoticeCard() {
  const [notices, setNotices] = useState<any>([]);

  // Fetch notices from API
  useEffect(() => {
    fetch(`${BACKENDURL}notice`)
      .then((response) => response.json())
      .then((data) => {
        // Map the API data to match the structure needed for HoverEffect and limit to 6 items
        const formattedNotices = data.slice(0, 6).map((notice: any) => ({
          title: notice.headline,
          description: notice.notice_body,
          link: notice.file || '#', 
        }));
        setNotices(formattedNotices);
      })
      .catch((error) => console.error('Error fetching notices:', error));
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-8">
      <HoverEffect items={notices} />
    </div>
  );
}