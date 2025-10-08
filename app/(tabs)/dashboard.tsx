import React from 'react';
import { Text, View } from 'react-native';
// import HabitCard from '@/components/habit-card';
// import HabitDetailsDropdown from '@/components/habit-details-dropdown';

// export default function DashboardScreen() {
//   const { colors } = useTheme();
//   const { getUserGroups, getGroupProgress, updateHabitProgress, getHabitComments } = useHabits();
//   const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
//   const [expandedHabitId, setExpandedHabitId] = useState<string | null>(null);
//   const [expandedGroupId, setExpandedGroupId] = useState<string | null>(null);
//   const insets = useSafeAreaInsets();

//   const userGroups = getUserGroups();

//   const getDayProgress = (date: string) => {
//     let totalHabits = 0;
//     let completedHabits = 0;

//     userGroups.forEach(group => {
//       const progress = getGroupProgress(group.id, date);
//       if (progress) {
//         totalHabits += progress.habits.length;
//         completedHabits += progress.habits.filter(h => h.completed).length;
//       }
//     });

//     if (totalHabits === 0) return null;

//     return {
//       completionRate: completedHabits / totalHabits,
//     };
//   };

//   const getSelectedDateHabits = () => {
//     const habits: {
//       habit: any;
//       group: any;
//       completed: boolean;
//       feeling?: string;
//       hasComments: boolean;
//     }[] = [];

//     userGroups.forEach(group => {
//       const progress = getGroupProgress(group.id, selectedDate);
//       if (progress) {
//         group.habits.forEach(habit => {
//           const habitProgress = progress.habits.find(h => h.habitId === habit.id);
//           const comments = getHabitComments(habit.id, group.id, selectedDate);
//           habits.push({
//             habit,
//             group,
//             completed: habitProgress?.completed || false,
//             feeling: habitProgress?.feeling,
//             hasComments: comments.length > 0,
//           });
//         });
//       }
//     });

//     return habits;
//   };

//   const handleHabitToggle = (habitId: string, groupId: string, completed: boolean) => {
//     if (!habitId?.trim() || !groupId?.trim()) return;
//     updateHabitProgress(habitId, groupId, selectedDate, !completed);
//   };
  
//   const handleHabitExpand = (habitId: string, groupId: string) => {
//     if (expandedHabitId === habitId && expandedGroupId === groupId) {
//       setExpandedHabitId(null);
//       setExpandedGroupId(null);
//     } else {
//       setExpandedHabitId(habitId);
//       setExpandedGroupId(groupId);
//     }
//   };
  
//   const handleHabitUpdate = (habitId: string, groupId: string, completed: boolean, feeling?: string, comment?: string) => {
//     if (!habitId?.trim() || !groupId?.trim()) return;
    
//     // Validate parameters before passing to context
//     const sanitizedFeeling = feeling?.trim();
//     const sanitizedComment = comment?.trim();
    
//     updateHabitProgress(habitId, groupId, selectedDate, completed, sanitizedFeeling, sanitizedComment);
//     setExpandedHabitId(null);
//     setExpandedGroupId(null);
//   };

//   const handleHabitPress = (habitId: string, groupId: string) => {
//     // Instead of navigating, expand the habit details
//     handleHabitExpand(habitId, groupId);
//   };

//   const selectedDateHabits = getSelectedDateHabits();
//   const todayProgress = getDayProgress(selectedDate);

//   return (
//     <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
//       <Stack.Screen 
//         options={{ 
//           title: 'Dashboard',
//           headerStyle: { backgroundColor: colors.surface },
//           headerTintColor: colors.text,
//         }} 
//       />
      
//       <ScrollView showsVerticalScrollIndicator={false}>
//         <Calendar
//           selectedDate={selectedDate}
//           onDateSelect={setSelectedDate}
//           getDayProgress={getDayProgress}
//         />

//         {/* <View style={styles.section}>
//           <View style={styles.sectionHeader}>
//             <Text style={[styles.sectionTitle, { color: colors.text }]}>
//               {selectedDate === new Date().toISOString().split('T')[0] ? 'Today' : 'Selected Day'}
//             </Text>
//             {todayProgress && (
//               <Text style={[styles.progressText, { color: colors.textSecondary }]}>
//                 {Math.round(todayProgress.completionRate * 100)}% complete
//               </Text>
//             )}
//           </View>

//           {selectedDateHabits.length > 0 ? (
//             selectedDateHabits.map(({ habit, group, completed, feeling, hasComments }) => (
//               <React.Fragment key={`${habit.id}-${group.id}`}>
//                 <HabitCard
//                   habit={habit}
//                   completed={completed}
//                   feeling={feeling}
//                   hasComments={hasComments}
//                   onPress={() => handleHabitPress(habit.id, group.id)}
//                   onToggle={() => handleHabitToggle(habit.id, group.id, completed)}
//                 />
//                 {expandedHabitId === habit.id && expandedGroupId === group.id && (
//                   <HabitDetailsDropdown
//                     habit={habit}
//                     groupId={group.id}
//                     completed={completed}
//                     feeling={feeling}
//                     comment={getHabitComments(habit.id, group.id, selectedDate)[0]?.comment}
//                     onClose={() => {
//                       setExpandedHabitId(null);
//                       setExpandedGroupId(null);
//                     }}
//                     onUpdate={(completed, feeling, comment) => 
//                       handleHabitUpdate(habit.id, group.id, completed, feeling, comment)
//                     }
//                   />
//                 )}
//               </React.Fragment>
//             ))
//           ) : (
//             <View style={[styles.emptyState, { backgroundColor: colors.card }]}>
//               <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
//                 No habits for this day
//               </Text>
//             </View>
//           )}
//         </View>

//         <View style={styles.section}>
//           <View style={styles.sectionHeader}>
//             <Text style={[styles.sectionTitle, { color: colors.text }]}>
//               Your Groups
//             </Text>
//             <TouchableOpacity 
//               onPress={() => router.push('/create-group')} 
//               style={[styles.addButton, { backgroundColor: colors.primary }]}
//             >
//               <Plus size={20} color="white" />
//             </TouchableOpacity>
//           </View>

//           {userGroups.map(group => (
//             <TouchableOpacity
//               key={group.id}
//               style={[styles.groupCard, { backgroundColor: colors.card, borderColor: colors.border }]}
//               onPress={() => router.push(`/group/${group.id}`)}
//             >
//               <Text style={[styles.groupName, { color: colors.text }]}>
//                 {group.name}
//               </Text>
//               <Text style={[styles.groupDescription, { color: colors.textSecondary }]}>
//                 {group.description}
//               </Text>
//               <Text style={[styles.groupMembers, { color: colors.textSecondary }]}>
//                 {group.members.length} members • {group.habits.length} habits
//               </Text>
//             </TouchableOpacity>
//           ))}
//         </View> */}
//       </ScrollView>
//     </View>
//   );
// }
export default function Dashboard() {
  return (
    <View><Text>dashboard</Text></View>
  )
}


// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   section: {
//     marginBottom: 24,
//   },
//   sectionHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingHorizontal: 16,
//     marginBottom: 12,
//   },
//   sectionTitle: {
//     fontSize: 20,
//     fontWeight: '600',
//   },
//   progressText: {
//     fontSize: 14,
//     fontWeight: '500',
//   },
//   addButton: {
//     width: 32,
//     height: 32,
//     borderRadius: 16,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   emptyState: {
//     margin: 16,
//     padding: 32,
//     borderRadius: 12,
//     alignItems: 'center',
//   },
//   emptyText: {
//     fontSize: 16,
//   },
//   groupCard: {
//     marginHorizontal: 16,
//     marginVertical: 4,
//     padding: 16,
//     borderRadius: 12,
//     borderWidth: 1,
//   },
//   groupName: {
//     fontSize: 16,
//     fontWeight: '600',
//     marginBottom: 4,
//   },
//   groupDescription: {
//     fontSize: 14,
//     marginBottom: 8,
//   },
//   groupMembers: {
//     fontSize: 12,
//   },
// });
