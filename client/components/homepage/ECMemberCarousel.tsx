
 
'use client'

import React, { useEffect, useState } from 'react'
import { WavyBackground } from '../ui/wavy-background'
import { AnimatedTooltip } from '../ui/animated-tooltip'
import { BACKENDURL } from '@/data/urls';

interface Member {
  fullname: string;
  profile_picture: string | null;
  committee_post: string;
}

interface FormattedMember {
  id: number;
  name: string;
  designation: string;
  image: string;
}

const ECMemberCarousel = () => {
  const [members, setMembers] = useState<FormattedMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMembers() {
      try {
        const response = await fetch(`${BACKENDURL}election/allmembers/1`);
        if (!response.ok) {
          throw new Error('Failed to fetch members');
        }
        
        const data: Member[] = await response.json();
        
        // Transform the data to match the required format
        const formattedMembers = data
          .filter(member => member.profile_picture !== null)
          .map((member, index) => ({
            id: index + 1,
            name: member.fullname,
            designation: member.committee_post.toUpperCase(),
            image: member.profile_picture || '',
          }));
        
        setMembers(formattedMembers);
      } catch (error) {
        console.error('Error fetching members:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchMembers();
  }, []);

  if (loading) {
    return (
      <div className='relative h-[40rem] overflow-hidden flex items-center justify-center'>
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className='relative h-[40rem] overflow-hidden flex items-center justify-center'>
      <WavyBackground className="w-full max-w-7xl mx-auto flex flex-col items-center justify-center h-full">
        <h2 className='text-2xl md:text-4xl lg:text-7xl text-white font-bold text-center mb-8'>
          Current Executive Committee
        </h2>
        <p className='text-base md:text-lg text-white text-center mb-4'>
          Discover the talented professionals who will now guide our software society
        </p>
        <div className="flex flex-row items-center justify-center mb-10 w-full">
          <AnimatedTooltip items={members} />
        </div>
      </WavyBackground>
    </div>
  )
}

export default ECMemberCarousel