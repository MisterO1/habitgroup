import { currentUser, mockGroups, mockProgress } from '@/mocks/habit-data';
import { Group, HabitProgress } from '@/types/interfaces';
import createContextHook from '@nkzw/create-context-hook';
import { useCallback, useEffect, useMemo, useState } from 'react';
// import { Platform } from 'react-native';

// Conditionally import notifications only on native platforms
// let Notifications: any = null;
// if (Platform.OS !== 'web') {
//   try {
//     Notifications = require('expo-notifications');
//   } catch (error) {
//     console.warn('[HabitProvider] expo-notifications not available:', error);
//   }
// }

export const [HabitProvider, useHabits] = createContextHook(() => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [progress, setProgress] = useState<HabitProgress[]>([]);
  const [user] = useState<User>(currentUser);

  useEffect(() => {
    console.log('[HabitProvider] Initializing mock data');
    setGroups(mockGroups);
    setProgress(mockProgress);
  }, []);

//   const requestNotificationPermissions = useCallback(async () => {
//     if (Platform.OS === 'web') return true;
//     const { status } = await Notifications.requestPermissionsAsync();
//     return status === 'granted';
//   }, []);

//   const scheduleHabitReminders = useCallback(async (habit: any, groupId: string) => {
//     if (Platform.OS === 'web' || !habit.enableReminder || !habit.reminderTime) return;

//     const hasPermission = await requestNotificationPermissions();
//     if (!hasPermission) {
//       console.warn('[HabitProvider] Notification permission denied');
//       return;
//     }

//     const [hours, minutes] = habit.reminderTime.split(':').map(Number);
//     const startDate = new Date(habit.startDate);
//     const endDate = new Date(habit.endDate);
//     const currentDate = new Date(startDate);

//     while (currentDate <= endDate) {
//       const triggerDate = new Date(currentDate);
//       triggerDate.setHours(hours, minutes, 0, 0);

//       if (triggerDate > new Date()) {
//         try {
//           await Notifications.scheduleNotificationAsync({
//             content: {
//               title: `Habit Reminder: ${habit.title}`,
//               body: `Don't forget to complete your habit: ${habit.frequency}`,
//               sound: 'default',
//             },
//             trigger: triggerDate,
//           });
//         } catch (error) {
//           console.error('[HabitProvider] Failed to schedule notification:', error);
//         }
//       }

//       currentDate.setDate(currentDate.getDate() + 1);
//     }
//   }, [requestNotificationPermissions]);

  const getUserGroups = useCallback(() => {
    const result = groups.filter(group => 
      group.members.some(member => member.id === user.id)
    );
    console.log('[HabitProvider] getUserGroups ->', result.map(g => g.id));
    return result;
  }, [groups, user.id]);

  const getGroupProgress = useCallback((groupId: string, date: string) => {
    if (!groupId?.trim() || !date?.trim()) return null;
    
    const group = groups.find(g => g.id === groupId);
    if (!group) return null;

    const dayProgress = progress.filter(p => 
      p.groupId === groupId && 
      p.date === date
    );

    const habitProgress = group.habits.map(habit => {
      const userProgress = dayProgress.find(p => 
        p.habitId === habit.id && p.userId === user.id
      );
      return {
        habitId: habit.id,
        completed: userProgress?.completed || false,
        feeling: userProgress?.feeling,
      };
    });

    const completionRate = habitProgress.length > 0 
      ? habitProgress.filter(h => h.completed).length / habitProgress.length 
      : 0;

    return {
      date,
      habits: habitProgress,
      completionRate,
    };
  }, [groups, progress, user.id]);

  const updateHabitProgress = useCallback((
    habitId: string,
    groupId: string,
    date: string,
    completed: boolean,
    feeling?: string,
    comment?: string
  ) => {
    if (!habitId?.trim() || !groupId?.trim() || !date?.trim()) return;
    
    const validFeelings = ['great', 'good', 'okay', 'struggling', 'difficult'];
    const sanitizedFeeling = feeling?.trim();
    const validatedFeeling = sanitizedFeeling && validFeelings.includes(sanitizedFeeling) ? sanitizedFeeling as any : undefined;
    
    const sanitizedComment = comment?.trim();
    
    const existingIndex = progress.findIndex(p => 
      p.habitId === habitId && 
      p.userId === user.id && 
      p.date === date
    );

    const newProgress: HabitProgress = {
      id: existingIndex >= 0 ? progress[existingIndex].id : Date.now().toString(),
      habitId,
      userId: user.id,
      groupId,
      date,
      completed,
      feeling: validatedFeeling,
      comment: sanitizedComment,
      createdAt: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      const updatedProgress = [...progress];
      updatedProgress[existingIndex] = newProgress;
      setProgress(updatedProgress);
    } else {
      setProgress([...progress, newProgress]);
    }
  }, [progress, user.id]);

  const getHabitComments = useCallback((habitId: string, groupId: string, date: string) => {
    return progress.filter(p => 
      p.habitId === habitId && 
      p.groupId === groupId && 
      p.date === date &&
      p.comment
    );
  }, [progress]);

  const leaveGroup = useCallback((groupId: string, options: { deleteData: boolean }) => {
    try {
      console.log('[HabitProvider] leaveGroup called', { groupId, options });
      const groupIndex = groups.findIndex(g => g.id === groupId);
      if (groupIndex === -1) {
        console.warn('[HabitProvider] leaveGroup: group not found');
        return { error: 'Group not found' } as const;
      }
      const group = groups[groupIndex];
      const isMember = group.members.some(m => m.id === user.id);
      if (!isMember) {
        console.warn('[HabitProvider] leaveGroup: profile not in group');
        return { error: 'You are not a member of this group' } as const;
      }

      const updatedMembers = group.members.filter(m => m.id !== user.id);

      let updatedGroups: Group[] = [];
      if (updatedMembers.length === 0) {
        updatedGroups = groups.filter(g => g.id !== groupId);
      } else {
        const newAdminId = group.adminId === user.id ? updatedMembers[0].id : group.adminId;
        const updatedGroup: Group = { ...group, members: updatedMembers, adminId: newAdminId };
        updatedGroups = [...groups];
        updatedGroups[groupIndex] = updatedGroup;
      }

      setGroups(updatedGroups);

      if (options.deleteData) {
        const filteredProgress = progress.filter(p => !(p.groupId === groupId && p.userId === user.id));
        setProgress(filteredProgress);
      }

      return { success: true } as const;
    } catch (e) {
      console.error('[HabitProvider] leaveGroup error', e);
      return { error: 'Something went wrong. Please try again.' } as const;
    }
  }, [groups, progress, user.id]);

  const createGroup = useCallback(async (groupData: Omit<Group, 'id' | 'adminId' | 'members' | 'createdAt'>) => {
    try {
      console.log('[HabitProvider] createGroup called', groupData);
      
      if (!groupData?.name?.trim() || groupData.name.length > 100) {
        return { error: 'Group name is required and must be under 100 characters.' } as const;
      }
      
      if (!groupData?.description?.trim() || groupData.description.length > 500) {
        return { error: 'Group description is required and must be under 500 characters.' } as const;
      }
      
      if (!groupData?.habits || groupData.habits.length === 0) {
        return { error: 'At least one habit is required.' } as const;
      }

      const newGroup: Group = {
        id: Date.now().toString(),
        adminId: user.id,
        members: [user],
        createdAt: new Date().toISOString(),
        ...groupData,
      };

      setGroups(prev => [...prev, newGroup]);

      // Schedule reminders for habits that have them enabled
    //   for (const habit of newGroup.habits) {
    //     if (habit.enableReminder) {
    //       await scheduleHabitReminders(habit, newGroup.id);
    //     }
    //   }

      return { success: true, groupId: newGroup.id } as const;
    } catch (e) {
      console.error('[HabitProvider] createGroup error', e);
      return { error: 'Something went wrong. Please try again.' } as const;
    }
  }, [user]);
//   }, [user, scheduleHabitReminders]);

  return useMemo(() => ({
    groups,
    progress,
    user,
    getUserGroups,
    getGroupProgress,
    updateHabitProgress,
    getHabitComments,
    leaveGroup,
    createGroup,
  }), [groups, progress, user, getUserGroups, getGroupProgress, updateHabitProgress, getHabitComments, leaveGroup, createGroup]);
});