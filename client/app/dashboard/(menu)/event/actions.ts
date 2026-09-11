"use server";

import { APIENDPOINTS } from "@/data/urls";
import type { EventType } from "@/data/types";

export type EventListResponse = EventType[];

export const getEvents = async (): Promise<EventListResponse> => {
  try {
    const response = await fetch(APIENDPOINTS.events.getEvents);
    const data = (await response.json()) as EventListResponse;
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error fetching events:", error);
    return [];
  }
};
