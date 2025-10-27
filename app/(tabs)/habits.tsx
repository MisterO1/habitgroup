import GroupSection from '@/components/group-section';
import { useTheme } from '@/contexts/theme-context';
import { useAppStore } from '@/contexts/zustand';
import { getGroupProgressByDate } from '@/controllers/group-progress-controllers';
import { completion } from '@/types/interfaces';
import { router, Stack } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


export default function HabitsScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { userGroupsZus, userHabitsZus, completionsZus, reset } = useAppStore();
  // console.log("userGroupsZus",userGroupsZus)
  
  // --- Fonction utilitaire ---
  const getGroupProgressForWeek = async (habitId: string, groupId: string) => {
    // Get last 7 days
    const today = new Date();
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      last7Days.push(date.toISOString().split('T')[0]);
    }
    
    const last7GroupProgress = await Promise.all(
      last7Days.map((date) => getGroupProgressByDate(groupId, habitId, date))
    );

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

    return completions;
  };

  // --- 💫 Affichage principal ---
  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <Stack.Screen
        options={{
          title: 'Habits',
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.text,
        }}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {userGroupsZus.length > 0 ? (
          userGroupsZus.map(group => (
            <GroupSection 
              key={group.id} 
              group={group} 
              completions={completionsZus}
            />
          ))
        ) : (
          <View style={[styles.emptyState, { backgroundColor: colors.card }]}>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No Habits Yet</Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              Join a group or create one to start tracking your habits
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/create-group')}
              style={[styles.emptyButton, { backgroundColor: colors.primary }]}
            >
              <Text style={styles.emptyButtonText}>Create Group</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

// --- 🎨 Styles ---
const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingBottom: 24 },
  emptyState: {
    margin: 16,
    padding: 40,
    borderRadius: 16,
    alignItems: 'center',
  },
  emptyTitle: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
  emptyText: { fontSize: 15, textAlign: 'center', marginBottom: 20, lineHeight: 22 },
  emptyButton: { paddingHorizontal: 24, paddingVertical: 14, borderRadius: 12 },
  emptyButtonText: { color: 'white', fontSize: 15, fontWeight: '600' },
});
