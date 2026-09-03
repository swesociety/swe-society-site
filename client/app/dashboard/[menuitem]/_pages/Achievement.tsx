"use client";
import AchievementComponent from "@/components/achievementspage/AchievementCard";
import { APIENDPOINTS, BACKENDURL } from "@/data/urls";
import React, { useEffect, useState } from "react";
import { getUserID, getUserReg } from "@/data/cookies/getCookies";
import AchievementModal from "@/components/achievementspage/AchievementModal";

const Achievement: React.FC = () => {
    const [achievements, setAchievements] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const fetchData = async () => {
      try {
         const userids = getUserID();
          const response = await fetch(`${BACKENDURL}achievement/individual/${userids}`);
          const data = await response.json();
          setAchievements(data.achievement);
      } catch (error) {
          console.error('Error fetching data: ', error);
      }
  };
    useEffect(() => {


        fetchData();
    }, []);
    const handleAchievementAdded = () => {
      setIsModalOpen(false)
      fetchData(); 
  };





  return (
    <div className="flex flex-col items-center space-y-2 pt-16 h-screen">
     <div className="w-full  mt-4 ">
         <div className="text-3xl text-center font-bold">Achievements</div>
      </div>
         <div className="w-full flex justify-end "> 
         <button 
          onClick={() => setIsModalOpen(true)}
         className="bg-red-700 rounded-lg px-4 mr-2">+ Add Achievement</button>
          </div>
      <AchievementComponent achievements={achievements}   fetchDataAll={fetchData} isAdmin={false}/>
      {isModalOpen && (
        <AchievementModal onClose={() => setIsModalOpen(false)} 
        onAchievementAdded={handleAchievementAdded}
        />
      )}
    </div>
  );
};

export default Achievement;
