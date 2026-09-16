import { LucideIcon } from "lucide-react";

export interface SidebarItems {
  links: Array<{
    label: string;
    href: string;
    Icon?: LucideIcon;
  }>;
}

export interface BillingACL {
  billingaclid?: number;
  hasBillingAccess: boolean;
  canVerifyTransaction: boolean;
  canAcceptTransaction: boolean;
  canAddTransaction: boolean;
  canDeleteTransaction: boolean;
  canViewPaymentMethod: boolean;
  canEditPaymentMethod: boolean;
  canDeletePaymentMethod: boolean;
  canViewPaymentType: boolean;
  canEditPaymentType: boolean;
  canDeletePaymentType: boolean;
}

export interface RoleAccessType {
  statistics: boolean;
  achievement: boolean;
  achievementmanage: boolean;
  billing: boolean;
  billingacl: BillingACL;
  blog: boolean;
  usersblog: boolean;
  member: boolean;
  notice: boolean;
  bulkmail: boolean;
  landingpage: boolean;
  events: boolean;
  ec: boolean;
  roles: boolean;
  standings: boolean;
  activitylog: boolean;
}

export interface UserDataType {
  reg: number;
  name: string;
  role: string;
  photourl: string;
}

export interface MemberRowType {
  regno: string;
  session: string;
  email: string;
  fullname: string;
}

export interface MemberDataType {
  userid: number;
  fullname: string | null;
  email: string;
  regno: string;
  session: string | null;
  role: string;
  roleid: number;
  roletitle: string;
}

export interface Achievement {
  teamid: number;
  eventname: string | null;
  organizer: string | null;
  venu: string | null;
  startdate: string | null;
  enddate: string | null;
  rank: string | null;
  rankarea: string | null;
  task: string | null;
  solution: string | null;
  techstack: string | null;
  resources: string | null;
  photos: string[] | null;
  approval_status: boolean | null;
}

export interface TableProps {
  data: MemberDataType[];
  selectedUserIds: number[];
  onSelectUser: (userId: number, selected: boolean) => void;
  onSelectAllVisible: (selectAll: boolean) => void;
}

export interface UserProfile {
  userid: number;
  fullname: string;
  email: string;
  profile_picture: string;
  regno: string;
  session: string;
  phone_number: string;
  bio: string;
  linkedin_id: string;
  github_id: string;
  stop_stalk_id: string;
  whatsapp: string;
  facebook_id: string;
  blood_group: string;
  school: string;
  college: string;
  hometown: string;
  cv: string | null;
  experience: string | null;
  projects: string[] | null;
  is_alumni: boolean;
  role: string;
  skills: string[] | null;
  committee_memberships?: CommitteeMembership[];
}

export interface CommitteeMembership {
  post_name: string;
  committee_name: string;
  committee_year: string;
}


export interface Role {
  roleid: number;
  roletitle: string;
  blogaccess: boolean;
  userblogaccess: boolean;
  billingaccess: boolean;
  billingacl: BillingACL;
  achievementaccess: boolean;
  achievementmanageaccess: boolean;
  bulkmailaccess: boolean;
  eventaccess: boolean;
  ecaccess: boolean;
  landingpageaccess: boolean;
  membersaccess: boolean;
  noticeaccess: boolean;
  rolesaccess: boolean;
  statisticsaccess: boolean;
  standingsaccess: boolean;
  activitylogaccess: boolean;
  isdefaultrole: boolean;
}


export interface EventType {
  eventid: number;
  start_time: string;
  end_time: string;
  headline: string;
  event_details: string;
  coverphoto: string;
  fullname: string | null;
  created_time: string;
}

