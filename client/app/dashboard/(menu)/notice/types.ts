export type Notice = {
  noticeid: number;
  notice_provider?: number;
  notice_date?: string;
  expire_date?: string;
  headline: string;
  notice_body: string;
  picture?: string | null;
  file?: string | null;
  created_at?: string;
  userid?: number;
  fullname?: string | null;
};

export type NoticeListResponse = Notice[];

export type NoticeFormValues = {
  notice_provider: number | string;
  notice_date: string;
  expire_date: string;
  headline: string;
  notice_body: string;
  picture: string;
  file: string;
};
