export interface Profile {
    id: string;
    name: string;
    email: string;
    password: string;
    avatar?: string;
    created_at: string;
  }

export interface Category { 
  value: 'fitness' | 'reading' | 'creativity' | 'productivity' | 'health' | 'learning' | 'social' | 'other'; 
  label: string, 
  description: string,
  icon?: string,
}

export type Role = "owner" | "admin" | "member"

export interface Habit {
  id: string;
  groupId: Pick<Group, 'id'>;
  name: string;
  description: string;
  startDate: string;
  endDate?: string;
  frequency: string;
  category: Pick<Category, 'value'>;
  reminderTime?: string; // HH:MM format
  enableReminder?: boolean;
}
  
export interface Group {
  id: string | null;
  name: string;
  description: string;
  owner_id: string;
  createdAt: string;
}

export type listGroup =
| { 
    id: string, 
    name: string, 
    description: string, 
    owner_id: string
    created_at: string,
  }[] 
| null

export type listmember =
| { 
    id: string, 
    name: string, 
    avatar: string,
  }[] 
| null

export interface Group_members {
  created_at: string
  group_id: string | null
  id: number
  user_id: string | null
  role: Role
}
  
export interface HabitProgress {
  id: string;
  habitId: string;
  userId: string;
  groupId: string; // to delete ?
  date: string;
  completed: boolean;
  feeling?: 'great' | 'good' | 'okay' | 'struggling' | 'difficult';
  comment?: string;
  createdAt: string;
}
  
export interface DayProgress {
  date: string;
  habits: {
    habitId: string;
    completed: boolean;
    feeling?: string;
  }[];
  completionRate: number;
}
