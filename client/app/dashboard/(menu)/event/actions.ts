'use server';

import { APIENDPOINTS } from '@/data/urls';
import type { EventType } from '@/data/types';
import axios from 'axios';
import { getAxiosErrorResult } from '@/lib/axiosError';

import type { AxiosRequestConfig } from 'axios';

export type EventListResponse = EventType[];

export const getEvents = async (): Promise<EventListResponse> => {
  try {
    const response = await fetch(APIENDPOINTS.events.getEvents, {
      cache: 'no-store',
    });
    const data = (await response.json()) as EventListResponse;
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching events:', error);
    return [];
  }
};

export const createEvent = async (
  requestBody: Partial<EventType>,
  config: AxiosRequestConfig,
) => {
  try {
    const response = await axios.post(
      APIENDPOINTS.events.createEvent,
      requestBody,
      config,
    );
    return { status: response.status, data: response.data };
  } catch (error) {
    console.error('Error creating event:', error);
    return getAxiosErrorResult(error);
  }
};
