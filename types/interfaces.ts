export interface User {
    id: string;
    name: string;
    email: string;
    password: string;
    avatar?: string;
    created_at: string;
  }

export type Category = { 
  value: 'fitness' | 'reading' | 'creativity' | 'productivity' | 'health' | 'learning' | 'social' | 'other'; 
  label: string, 
  description: string,
  icon?: string,
}
  export interface Habit {
    id: string;
    groupId: Pick<Group, 'id'>;
    name: string;
    description: string;
    startDate: string;
    endDate?: string;
    dailyGoal: string;
    category: Pick<Category, 'value'>;
    reminderTime?: string; // HH:MM format
    enableReminder?: boolean;
  }
  
  export interface Group {
    id: string;
    name: string;
    description: string;
    adminId: string;
    habitId: Pick<Habit, 'id'>;
    createdAt: string;
  }

  export interface Rel_GroupMembers {
    created_at: string
    group_id: string | null
    id: number
    user_id: string | null
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
