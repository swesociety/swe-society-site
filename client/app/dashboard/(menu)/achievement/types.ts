export type Achievement = {
  achieveid: number;
  teamid: number;
  teamname: string;
  mentor: string | null;
  task: string | null;
  solution: string | null;
  resources: string | null;
  startdate: string | null;
  eventname: string;
  segment: string;
  rank: string;
  photos: string[];
  techstack: string;
  enddate: string | null;
  organizer: string | null;
  venu: string | null;
  approval_status:boolean;
  teammembers: {
    userid: number;
    fullname: string;
    session: string;
  }[];
}

export type AchievementListResponse = Achievement[];

export type FormDataType = {
  achieveid: number;
  teamname: string;
  mentor: string;
  teammembers: number[];
  eventname: string;
  segment: string;
  rank: string;
  photos: string[];
  task: string;
  solution: string;
  techstack: string;
  resources: string;
  startdate: string;
  enddate: string;
  organizer: string;
  venu: string;
}