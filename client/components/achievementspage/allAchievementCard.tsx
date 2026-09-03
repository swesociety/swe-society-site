"use client";
import React, { useState, useEffect } from "react";
import { BackgroundGradient } from "../ui/background-gradient";
import Image from "next/image";
import { BACKENDURL } from "@/data/urls";
import Link from "next/link";
import { Button } from "../ui/button";

export function AllAchievementCard() {
    const [achievements, setAchievements] = useState<any>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<any>(null);
  
    useEffect(() => {
      const fetchAchievements = async () => {
        try {

          const response = await fetch(`${BACKENDURL}achievement/landing/approved`);

          if (!response.ok) {
            throw new Error('Failed to fetch achievements');
          }
          const data = await response.json();
          setAchievements(data.achievements);
        } catch (err:any) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
  
      fetchAchievements();
    }, []);
  
    if (loading) {
      return <div className="text-center p-4">Loading achievements...</div>;
    }
  
    if (error) {
      return <div className="text-center text-red-500 p-4">Error: {error}</div>;
    }
  
    return (
      <div>
      <div className="flex flex-wrap justify-center">
     
        {achievements.map((achievement:any, index:any) => (
          <div key={index} className="p-8">
            <BackgroundGradient className="rounded-[22px] max-w-sm p-4 sm:p-10 bg-white dark:bg-zinc-900">
              <img

                src={achievement.photos[0] || '/https://t4.ftcdn.net/jpg/03/88/30/69/360_F_388306986_HNTycrIKQQ3aSkce0Vod4WoESHedMmHT.jpg'}

                alt={achievement.eventname || "achievement image"}
                height="400"
                width="400"
                className="object-contain"
              />
              <p className="text-base sm:text-xl text-black mt-4 mb-2 dark:text-neutral-200">
                {achievement.teamname} - {achievement.rank} - {achievement.eventname}
              </p>
  
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                {achievement.task}
              </p>
              
              <button className="rounded-full pl-4 pr-1 py-1 text-white flex items-center space-x-1 bg-black mt-4 text-xs font-bold dark:bg-zinc-800">
                <span>Organize  by {achievement.organizer}</span>
                <span className="bg-zinc-700 rounded-full text-[0.6rem] px-2 py-0 text-white">
                
                </span>
              </button>
            </BackgroundGradient>
          </div>
        ))}
      </div>
      <Link href={'/'}>
      <div className='flex flex-col items-end justify-end p-10'>    
          <Button className='flex flex-col justify-center items-end'>Back</Button></div>
          </Link>
      </div>
    );
  }