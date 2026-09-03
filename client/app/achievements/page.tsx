import AchievementSection from "@/components/homepage/AchievementSection";
import { AllAchievementCard } from "@/components/achievementspage/allAchievementCard";
export default function page() {
  return <div>
        <h1 className="text-3xl font-bold text-center mb-8 text-primary mt-4">
        All Achievement
      </h1>
    <AllAchievementCard/>
  </div>;
}
