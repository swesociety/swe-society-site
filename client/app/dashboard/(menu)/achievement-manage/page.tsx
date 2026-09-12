import { getAllAchievements } from './actions';
import AchievementManage from './components/AchievementManage';

export default async function Page() {
  const initialAchievements = await getAllAchievements();

  return <AchievementManage initialAchievements={initialAchievements} />;
}
