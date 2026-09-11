'use server';

import { APIENDPOINTS } from '@/data/urls';
import type { AchievementListResponse } from '@/app/dashboard/(menu)/achievement/types';

export const getAllAchievements =
  async (): Promise<AchievementListResponse> => {
    try {
      const response = await fetch(APIENDPOINTS.achievement.getAllAchievement);
      if (!response.ok) {
        throw new Error(`Failed to fetch achievements: ${response.status}`);
      }

      const data = (await response.json()) as {
        achievements?: Array<
          AchievementListResponse[number] & {
            teamMembers?: AchievementListResponse[number]['teammembers'];
          }
        >;
      };
      return Array.isArray(data.achievements)
        ? data.achievements.map(({ teamMembers, teammembers, ...achievement }) => ({
            ...achievement,
            teammembers: teammembers ?? teamMembers ?? [],
          }))
        : [];
    } catch (error) {
      console.error('Error fetching achievements:', error);
      return [];
    }
  };
