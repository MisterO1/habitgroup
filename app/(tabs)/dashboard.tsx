import Calendar from '@/components/calendar';
import { useTheme } from '@/contexts/theme-context';
import { useUser } from '@/contexts/user-context';
import { calculateAndSaveGroupProgress, getGroupProgress, getSingleGroup, getUserGroups } from '@/controllers/group-controllers.tsx';
import { getGroupsHabits } from '@/controllers/habit-controllers';
import { createHabitProgress, getHabitProgressByDate, updateHabitProgress as updateHabitProgressController } from '@/controllers/habitProgress-controllers';
import { Group, Habit, HabitProgress, SingleGroup } from '@/types/interfaces';
import { Stack, router } from 'expo-router';
import { Plus } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function DashboardScreen() {
  const { colors } = useTheme();
  const { userInfo } = useUser()
  // const { getUserGroups, getGroupProgress, updateHabitProgress, getHabitComments } = useHabits();
  const [ userGroups, setUserGroups ] = useState<Group[]>([])
  const [ singleGroup, setSingleGroup ] = useState<SingleGroup | null>(null)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [expandedHabitId, setExpandedHabitId] = useState<string | null>(null);
  const [expandedGroupId, setExpandedGroupId] = useState<string | null>(null);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const fetchSingleGroup = async () => {
      if (!userInfo?.singleGroup) return;
      
      try {
        const { data } = await getSingleGroup(userInfo.singleGroup);
        if (!data) {
          console.log("no singleGroup found for userId:", userInfo.id);
          return;
        }
        setSingleGroup(data);
      } catch (error) {
        console.error('Error fetching single group:', error);
      }
    };
    const fetchUserGroups = async () => {
      if (!userInfo?.groups) return;
      
      try {
        const { data } = await getUserGroups(userInfo.groups);
        if (!data) {
          console.log("no userGroups found for userId:", userInfo.id);
          return;
        }
        setUserGroups(data);
      } catch (error) {
        console.error('Error fetching userGroups:', error);
      }
    };
    
    fetchSingleGroup();    
    fetchUserGroups();    
  }, [userInfo]);

  const getDayProgress = async (date: string): Promise<number> => {
    if (!userInfo?.groups || userInfo.groups.length === 0) return 0;
    
    try {
      // Get progress for the first group (assuming single group for now)
      const { data } = await getGroupProgress(userInfo.groups[0], date);
      if (!data) return 0;
      return data.completionRate;
    } catch (error) {
      console.error('Error getting day progress:', error);
      return 0;
    }
  };

  const getSelectedDateHabits = async () => {
    const habits: {
      habit: Habit;
      group: Group;
      completed: boolean;
      feeling?: string;
      hasComments: boolean;
      comment?: string;
    }[] = [];

    if (!userInfo?.groups) return habits;

    try {
      for (const groupId of userInfo.groups) {
        const group = userGroups.find(g => g.id === groupId);
        if (!group) continue;

        // Get habits for this group
        const { data: groupHabits } = await getGroupsHabits(groupId);
        if (!groupHabits) continue;

        // For each habit, get its progress for the selected date
        for (const habitData of groupHabits) {
          const habit: Habit = {
            id: habitData.id,
            name: habitData.name || 'Unnamed Habit',
            groupId: groupId,
            description: habitData.description || '',
            startDate: habitData.startDate || '',
            endDate: habitData.endDate || '',
            frequency: habitData.frequency || '',
            category: habitData.category || ''
          };

          const { data: habitProgress } = await getHabitProgressByDate(
            group.id, 
            habitData.id, 
            selectedDate, 
            // userInfo.id
          );

          habits.push({
            habit,
            group,
            completed: habitProgress?.completed || false,
            feeling: habitProgress?.feeling || '',
            hasComments: !!habitProgress?.comment,
            comment: habitProgress?.comment || '',
          });
        }
      }
    } catch (error) {
      console.error('Error getting selected date habits:', error);
    }

    return habits;
  };

  const handleHabitToggle = async (habitId: string, groupId: string, completed: boolean) => {
    if (!habitId?.trim() || !groupId?.trim() || !userInfo) return;
    
    try {
      const habitProgressData: HabitProgress = {
        id: `${selectedDate.replace(/-/g, '')}_${userInfo.id}_${habitId}`,
        userId: userInfo.id,
        date: selectedDate,
        completed: !completed,
      };

      // Check if progress already exists
      const { data: existingProgress } = await getHabitProgressByDate(
        groupId, 
        habitId, 
        selectedDate, 
        // userInfo.id
      );

      if (existingProgress) {
        // Update existing progress
        await updateHabitProgressController(habitId, { ...habitProgressData, id: existingProgress.id });
      } else {
        // Create new progress
        await createHabitProgress(habitId, habitProgressData);
      }

      // Recalculate and save group progress
      const groupRef = userInfo.groups.find(gId => gId === groupId);
      if (groupRef) {
        await calculateAndSaveGroupProgress(groupRef, selectedDate, userInfo.id);
      }

      // Refresh the data
      const habits = await getSelectedDateHabits();
      setSelectedDateHabits(habits);
      
      const progress = await getDayProgress(selectedDate);
      setTodayProgress(progress);
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
  
  // const handleHabitUpdate = async (habitId: string, groupId: string, completed: boolean, feeling?: string, comment?: string) => {
  //   if (!habitId?.trim() || !groupId?.trim() || !userInfo) return;
    
  //   try {
  //     const habitProgressData: HabitProgress = {
  //       id: `${selectedDate.replace(/-/g, '')}_${userInfo.id}_${habitId}`,
  //       userId: userInfo.id,
  //       date: selectedDate,
  //       completed: completed,
  //       feeling: feeling?.trim() as any,
  //       comment: comment?.trim(),
  //     };

  //     // Check if progress already exists
  //     const { data: existingProgress } = await getHabitProgressByDate(
  //       groupId, 
  //       habitId, 
  //       selectedDate, 
  //       // userInfo.id
  //     );

  //     if (existingProgress) {
  //       // Update existing progress
  //       await updateHabitProgressController(habitId, { ...habitProgressData, id: existingProgress.id });
  //     } else {
  //       // Create new progress
  //       await createHabitProgress(habitId, habitProgressData);
  //     }

  //     // Recalculate and save group progress
  //     if (groupId) {
  //       await calculateAndSaveGroupProgress(groupId, selectedDate, userInfo.id);
  //     }

  //     // Refresh the data
  //     const habits = await getSelectedDateHabits();
  //     setSelectedDateHabits(habits);
      
  //     const progress = await getDayProgress(selectedDate);
  //     setTodayProgress(progress);

  //     setExpandedHabitId(null);
  //     setExpandedGroupId(null);
  //   } catch (error) {
  //     console.error('Error updating habit progress:', error);
  //   }
  // };

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

  // Update habits and progress when selectedDate or userGroups change
  // useEffect(() => {
  //   const updateHabitsAndProgress = async () => {
  //     if (userInfo && userGroups.length > 0) {
  //       const habits = await getSelectedDateHabits();
  //       setSelectedDateHabits(habits);
        
  //       const progress = await getDayProgress(selectedDate);
  //       setTodayProgress(progress);
  //     }
  //   };

  //   updateHabitsAndProgress();
  // }, [selectedDate, userGroups, userInfo]);

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

        {/* Progress Display */}
        {/* <View style={[styles.section, { marginTop: 16 }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {selectedDate === new Date().toISOString().split('T')[0] ? 'Today' : 'Selected Day'}
            </Text>
            <Text style={[styles.progressText, { color: colors.textSecondary }]}>
              {Math.round(todayProgress * 100)}% complete
            </Text>
          </View>
          
          <View style={[styles.emptyState, { backgroundColor: colors.card }]}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              {selectedDateHabits.length > 0 
                ? `${selectedDateHabits.length} habits for this day`
                : 'No habits for this day'
              }
            </Text>
            {userGroups.length > 0 && (
              <Text style={[styles.emptyText, { color: colors.textSecondary, fontSize: 14, marginTop: 8 }]}>
                Connected to {userGroups.length} group(s)
              </Text>
            )}
          </View>
        </View> */}

        <View style={styles.section}>
          {/* <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {selectedDate === new Date().toISOString().split('T')[0] ? 'Today' : 'Selected Day'}
            </Text>
            <Text style={[styles.progressText, { color: colors.textSecondary }]}>
              {Math.round(todayProgress * 100)}% complete
            </Text>
          </View> */}

          {/* {selectedDateHabits.length > 0 ? (
            selectedDateHabits.map(({ habit, group, completed, feeling, hasComments, comment }) => (
              <React.Fragment key={`${habit.id}-${group.id}`}>
                <HabitCard
                  habit={habit}
                  completed={completed}
                  feeling={feeling}
                  hasComments={hasComments}
                  onPress={() => handleHabitPress(habit.id || '', group.id)}
                  onToggle={() => handleHabitToggle(habit.id || '', group.id, completed)}
                />
                {expandedHabitId === habit.id && expandedGroupId === group.id && (
                  <HabitDetailsDropdown
                    habit={habit}
                    groupId={group.id}
                    completed={completed}
                    feeling={feeling}
                    comment={comment}
                    onClose={() => {
                      setExpandedHabitId(null);
                      setExpandedGroupId(null);
                    }}
                    // onUpdate={(completed, feeling, comment) => 
                    //   handleHabitUpdate(habit.id || '', group.id, completed, feeling, comment)
                    // }
                    onUpdate={(completed, feeling, comment) => void(0)}
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
          )} */}
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
              onPress={() => router.push('/create-habit')} 
              style={[styles.addButton, { backgroundColor: colors.primary }]}
            >
              <Plus size={20} color="white" />
            </TouchableOpacity>
          </View>
          
          {singleGroup &&  (
            <TouchableOpacity
              key={singleGroup?.id}
              style={[styles.groupCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => router.push(`/group/${singleGroup?.id}`)}
            >
              <Text style={[styles.groupName, { color: colors.text }]}>
                {singleGroup?.name}
              </Text>
              <Text style={[styles.groupDescription, { color: colors.textSecondary }]}>
                {singleGroup?.description}
              </Text>
              <Text style={[styles.groupMembers, { color: colors.textSecondary }]}>
                {singleGroup?.habits.length} habits
              </Text>
            </TouchableOpacity>
          )}
          
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
                  {group?.members.length} members • {group?.habits.length} habits
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
