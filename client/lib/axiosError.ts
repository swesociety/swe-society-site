import axios from 'axios';

export type AxiosActionResult = {
  status: number;
  data: unknown;
};

export const getAxiosErrorResult = (error: unknown): AxiosActionResult => {
  if (axios.isAxiosError(error)) {
    return {
      status: error.response?.status ?? 500,
      data: error.response?.data ?? null,
    };
  }

  return { status: 500, data: null };
};
