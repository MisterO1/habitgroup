// import { DocumentData, DocumentReference } from "firebase/firestore";

export type UserInfo = {
    id: string;
    name: string;
    email: string;
    avatar: string;
    singleGroup: string;
    groups: string[];
    habits: string[];
    createdAt: Date;
  } | null

export interface Category { 
  value: 'fitness' | 'reading' | 'creativity' | 'productivity' | 'health' | 'learning' | 'social' | 'other'; 
  label: string, 
  description: string,
  icon?: string,
}

//export type Role = "owner" | "admin" | "member"

export interface Habit {
  id: string;
  name: string;
  groupId: string;
  description: string;
  startDate: string;
  endDate?: string;
  frequency?: {
    type: "Everyday"| "WorkDays" | "Custom";
    days: number[]; // for specificDays: 0=Sun, 1=Mon, ..., 6=Sat
  };
  category: string;
  ownerId: string;
  createdAt: string;
}
  
export interface Group {
  id: string;
  name: string,
  description: string,
  ownerId: string,
  habits: string[],
  members: string[],
  createdAt?: string,
  private: boolean,
}
export interface SingleGroup {
  id: string;
  name: string,
  description: string,
  ownerId: string,
  habits: string[],
  members?: string[],
  createdAt?: string,
  private: boolean,
}

// habitProgress stored in progresses, SubCollection of habit collection
export interface HabitProgress {
  id?: string // doc id => format: YYYYMMDD_userId
  userId: string,
  date: string,
  completed: boolean,
  feeling?: 'great' | 'good' | 'okay' | 'struggling' | 'difficult';
  comment?: string;
}

export type HabitDayProgress  = {
  id?: string,
  date: string,
  completionRate: number, //moyenne des completed des habitProgress pour cette date
  totalMembers: number,
}

export type GroupProgress = {
  id?: string,
  date: string,
  completionRate: number, // moyenne des completionRate des habitDayProgress pour cette date
}


export type Status = {
  id: string,
  userId: string,
  groupId: string,
  habitTag: string,
  userName: string,
  userAvatar: string,
  content: string,
  imageUrl?: string,
  createdAt: string,
  expiresAt: string,
  views: string[],
}