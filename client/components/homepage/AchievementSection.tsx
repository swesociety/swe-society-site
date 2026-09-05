import Achievement from "@/app/dashboard/[menuitem]/_pages/Achievement";
import { HomeAchievementCard } from "../achievementspage/homeAchievementCard";
import Link from "next/link";
import { Button } from "../ui/button";

function AchievementSection() {
  return (
    <div>
      {/* <h1 className="flex flex-col items-center">Achievements</h1> */}
      <h1 className="text-3xl font-bold text-center my-8 text-primary">
        Latest Achievement
      </h1>
      <HomeAchievementCard />
      <Link href={'/achievements'}>
      <div className='flex flex-col items-end justify-end p-10'>    
          <Button className='flex flex-col justify-center items-end'>All Achievements</Button></div>
          </Link>
       <hr className="h-px my-8 bg-gray-200 border-0 dark:bg-gray-700" />
    </div>
  );
}

export default AchievementSection;
