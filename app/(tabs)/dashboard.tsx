import Calendar from '@/components/calendar';
import HabitCard from '@/components/habit-card';
import HabitDetailsDropdown from '@/components/habit-details-dropdown';
import { useTheme } from '@/contexts/theme-context';
import { useUser } from '@/contexts/user-context';
import { useAppStore } from '@/contexts/zustand';
import { getUserGroups } from '@/controllers/group-controllers.tsx';
import { getGroupProgressByDate } from '@/controllers/group-progress-controllers';
import { getHabitsScheduledForDate, getUserHabits } from '@/controllers/habit-controllers';
import { createHabitProgress, getHabitProgressByDate, updateHabitProgress } from '@/controllers/habitProgress-controllers';
import { Group, Habit, HabitProgress, completion } from '@/types/interfaces';
import { Stack, router } from 'expo-router';
import { Plus } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function DashboardScreen() {
  const { colors } = useTheme();
  const { userInfo } = useUser()
  if (!userInfo) return <Text>no User found</Text>

  const { setUserGroupsZus, setUserHabitsZus,
      userGroupsZus, userHabitsZus,
      setCompletionZus,
      updateHabitCompletion,
   } = useAppStore();
  const [ userGroups, setUserGroups ] = useState<Group[]>([])
  const [ userHabits, setUserHabits ] = useState<Habit[]>([])
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [expandedHabitId, setExpandedHabitId] = useState<string | null>(null);
  const [expandedGroupId, setExpandedGroupId] = useState<string | null>(null);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    
    const fetchUserGroups = async () => {
      if (!userInfo?.groups) return;
      // if (userGroupsZus.length > 0){
      //   setUserGroups(userGroupsZus)
      //   console.log("userGroupsZus",userGroupsZus)
      //   return
      // }
      try {
        const { data } = await getUserGroups(userInfo.groups);
        if (!data) {
          console.log("no userGroups found for userId:", userInfo.id);
          return;
        }
        // console.log("fetched groups")
        setUserGroups(data);
        setUserGroupsZus(data);
      } catch (error) {
        console.error('Error fetching userGroups:', error);
      }
    };

    const fetchUserHabits = async () => {
      if (userInfo.habits.length == 0) return;
      // if (userHabitsZus.length > 0){
      //   setUserHabits(userHabitsZus)
      //   console.log("userHabitsZus",userHabitsZus)
      //   return
      // }
      
      try {
        const { data } = await getUserHabits(userInfo.habits);
        if (!data) {
          console.log("no userHabits found for userId:", userInfo.id);
          return;
        }
        // console.log("fetched habits")
        setUserHabits(data);
        setUserHabitsZus(data)
      } catch (error) {
        console.error('Error fetching userHabits:', error);
      }
    };
    
    fetchUserGroups();
    fetchUserHabits();
  }, [userInfo]);

  const getSelectedDateHabits = async () => {
    
    const selectedHabits: {
      habit: Habit;
      group: Group;
      completed: boolean;
      feeling?: string;
      hasComments: boolean;
      comment?: string;
    }[] = [];

    if (userInfo.habits.length == 0) return selectedHabits;
    const { activeHabitIds } = await getHabitsScheduledForDate(userInfo.habits, new Date(selectedDate));
    if (activeHabitIds.length === 0) return selectedHabits;
    const activehabits = userHabits.filter(h => activeHabitIds.includes(h.id));

    try {
      const habitProgressPromises = activehabits.map(habit => getHabitProgressByDate(
        habit.id, 
        selectedDate, 
        userInfo.id
      ));
      const habitProgressResults = await Promise.all(habitProgressPromises);
      for (const [index, habit] of activehabits.entries()) {
        const habitProgress = habitProgressResults[index];
        if (!habitProgress.success) {
          console.error('Error fetching habit progress for habit:', habit.id);
          continue;
        }
        const group = userGroups.find( g => g.id = habit.groupId)!
        selectedHabits.push({
          habit,
          group,
          completed: habitProgress?.data?.completed || false,
          feeling: habitProgress?.data?.feeling || '',
          hasComments: habitProgress?.data?.comment ? true : false,
          comment: habitProgress?.data?.comment || '',
        });
      }
      
    } catch (error) {
      console.error('Error getting selected date habits:', error);
    }

    return selectedHabits;
  };

  const updateHabitCompletions = async (habitId: string, groupId: string) => {
    // Get last 7 days
    const dates = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      dates.push(date.toISOString().split('T')[0]);
    }

    // Fetch progress for each day
    const last7GroupProgress = await Promise.all(
      dates.map((date) => getGroupProgressByDate(groupId, habitId, date))
    );

    // Convert to completions
    const weekProgress: number[] = [];
    for (let i = 0; i <= 6; i++) {
      weekProgress.push(last7GroupProgress[i].data?.completionRate ?? -1);
    }

    const completions: completion[] = weekProgress.map(c =>
      c == 1
        ? "good" 
        : c == 0 
        ? "bad" 
        : c == -1 
        ? "not_started" 
        : "average"
    );

    // Update the store
    updateHabitCompletion(habitId, groupId, completions);
  };

  const handleHabitToggle = async (habitId: string, group: Group, completed: boolean) => {
    if (!habitId?.trim() || !group.id?.trim() || !userInfo) return;
    
    try {
      const habitProgressData: HabitProgress = {
        userId: userInfo.id,
        date: selectedDate,
        completed: !completed,
        habitId,
        groupId: group.id,
      };

      // Check if progress already exists
      const { data: existingProgress } = await getHabitProgressByDate(
        habitId, 
        selectedDate, 
        userInfo.id
      );

      if (existingProgress) {
        // Update existing progress
        await updateHabitProgress(habitId, { ...habitProgressData, id: existingProgress.id }, group);
      } else {
        // Create new progress
        await createHabitProgress(habitId, habitProgressData, group);
      }

      // Refresh the data
      const habits = await getSelectedDateHabits();
      setSelectedDateHabits(habits);
      
      calculateDayProgress(habits);

      // Update completions in the store for immediate reflection in Habits tab
      await updateHabitCompletions(habitId, group.id);

    } catch (error) {
      console.error('Error updating habit progress:', error);
    }
  };
  
  const handleHabitExpand = (habitId: string, groupId: string) => {
    if (expandedHabitId === habitId && expandedGroupId === groupId) {
      setExpandedHabitId(null);
      setExpandedGroupId(null);
    } else {
      setExpandedHabitId(habitId);
      setExpandedGroupId(groupId);
    }
  };
  
  const handleHabitUpdate = async (habitId: string, group: Group, completed: boolean, feeling?: string, comment?: string) => {
    if (!habitId?.trim() || !group.id?.trim() || !userInfo) return;
    
    try {
      const habitProgressData: HabitProgress = {
        userId: userInfo.id,
        date: selectedDate,
        completed: completed ?? false,
        feeling: feeling?.trim() as any ?? '',
        comment: comment?.trim() ?? '',
        habitId,
        groupId: group.id,
      };

      // Check if progress already exists
      const { data: existingProgress } = await getHabitProgressByDate(
        habitId, 
        selectedDate, 
        userInfo.id
      );

      if (existingProgress) {
        // Update existing progress
        await updateHabitProgress(habitId, { ...habitProgressData, id: existingProgress.id }, group);
      } else {
        // Create new progress
        await createHabitProgress(habitId, habitProgressData, group);
      }

      // Refresh the data
      const habits = await getSelectedDateHabits();
      setSelectedDateHabits(habits);
      
      calculateDayProgress(habits);

      // Update completions in the store for immediate reflection in Habits tab
      await updateHabitCompletions(habitId, group.id);

      setExpandedHabitId(null);
      setExpandedGroupId(null);

    } catch (error) {
      console.error('Error updating habit progress:', error);
    }
  };

  const handleHabitPress = (habitId: string, groupId: string) => {
    // Instead of navigating, expand the habit details
    handleHabitExpand(habitId, groupId);
  };

  const [selectedDateHabits, setSelectedDateHabits] = useState<{
    habit: Habit;
    group: Group;
    completed: boolean;
    feeling?: string;
    hasComments: boolean;
    comment?: string;
  }[]>([]);

  const [todayProgress, setTodayProgress] = useState<number>(0);

  const calculateDayProgress = (
    selectedDateHabits:{
      habit: Habit;
      completed: boolean;
      feeling?: string;
      hasComments: boolean;
      comment?: string;
    }[]
  ) => {
    if (selectedDateHabits.length == 0) return setTodayProgress(0);
    
    const count = selectedDateHabits.reduce((acc,cur) => 
      cur.completed ? 1 + acc : acc
    ,0)
    setTodayProgress( count/selectedDateHabits.length )
  };

  // Update habits and progress when selectedDate or userGroups change
  useEffect(() => {
    const updateHabitsAndProgress = async () => {
      if (userInfo && userGroups.length > 0) {
        const selectedHabits = await getSelectedDateHabits();
        // console.log("selectedHabits",selectedHabits)
        setSelectedDateHabits(selectedHabits);
        calculateDayProgress(selectedHabits);
      }
    }
    updateHabitsAndProgress();
  }, [selectedDate, userGroups, userInfo]);


  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <Stack.Screen 
        options={{ 
          title: 'Dashboard',
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.text,
        }} 
      />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        <Calendar
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
        />

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {selectedDate === new Date().toISOString().split('T')[0] ? 'Today' : selectedDate}
            </Text>
            <Text style={[styles.progressText, { color: colors.textSecondary }]}>
              {Math.round(todayProgress * 100)}% complete
            </Text>
          </View>

          {selectedDateHabits.length > 0 ? (
            selectedDateHabits.map(({ habit, group, completed, feeling, hasComments, comment }) => (
              <React.Fragment key={`${habit.id}-${habit.groupId}`}>
                <HabitCard
                  habit={habit}
                  completed={completed}
                  feeling={feeling}
                  hasComments={hasComments}
                  onPress={() => handleHabitPress(habit.id || '', habit.groupId)}
                  onToggle={() => handleHabitToggle(habit.id || '', group, completed)}
                />
                {expandedHabitId === habit.id && expandedGroupId === habit.groupId && (
                  <HabitDetailsDropdown
                    habit={habit}
                    groupId={habit.groupId}
                    completed={completed}
                    feeling={feeling}
                    comment={comment}
                    onClose={() => {
                      setExpandedHabitId(null);
                      setExpandedGroupId(null);
                    }}
                    onUpdate={(completed, feeling, comment) => 
                      handleHabitUpdate(habit.id || '', group, completed, feeling, comment)
                    }
                  />
                )}
              </React.Fragment>
            ))
          ) : (
            <View style={[styles.emptyState, { backgroundColor: colors.card }]}>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No habits for this day
              </Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Your Groups
            </Text>
            <TouchableOpacity 
              onPress={() => router.push('/create-group')} 
              style={[styles.addButton, { backgroundColor: colors.primary }]}
            >
              <Plus size={20} color="white" />
            </TouchableOpacity>
          </View>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              create habit
            </Text>
            <TouchableOpacity 
              onPress={() => router.push('/create-habit')
            } 
              style={[styles.addButton, { backgroundColor: colors.primary }]}
            >
              <Plus size={20} color="white" />
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={userGroups}
            horizontal={true}
            renderItem={({ item: group }) => (
              <TouchableOpacity
                style={[styles.groupCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => router.push(`/group/${group?.id}`)}
              >
                <Text style={[styles.groupName, { color: colors.text }]}>
                  {group?.name}
                </Text>
                <Text style={[styles.groupDescription, { color: colors.textSecondary }]}>
                  {group?.description}
                </Text>
                <Text style={[styles.groupMembers, { color: colors.textSecondary }]}>
                  {group?.members?.length} members • {group?.habits?.length} habits
                </Text>
              </TouchableOpacity>
            )}
            keyExtractor = {(_, idx) => idx.toString()}
            ListEmptyComponent = {(
              <View style={[styles.emptyState, { backgroundColor: colors.card }]}>
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  Your groups will appear here. Create or join a group to get started!
                </Text>
              </View>
            )}
          />
        </View>
      </ScrollView>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  progressText: {
    fontSize: 14,
    fontWeight: '500',
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    margin: 16,
    padding: 32,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
  },
  groupCard: {
    marginHorizontal: 16,
    marginVertical: 4,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  groupName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  groupDescription: {
    fontSize: 14,
    marginBottom: 8,
  },
  groupMembers: {
    fontSize: 12,
  },
});
