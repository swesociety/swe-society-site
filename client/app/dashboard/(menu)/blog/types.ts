export type Blog = {
  blogid: number;
  userid: number;
  headline: string;
  designation: string | null;
  current_institution: string | null;
  article: string;
  photos: string[];
  blogtype: string;
  approval_status: boolean;
  fullname: string | null;
};

export type BlogFormData = {
  blogid: number;
  userid: number;
  headline: string;
  designation: string;
  current_institution: string;
  article: string;
  photos: string[];
  blogtype: string;
  approval_status: boolean;
};

export type BlogListResponse = Blog[];
