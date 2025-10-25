// import { useTheme } from '@/contexts/theme-context';
import { useTheme } from '@/contexts/theme-context';
import { useUser } from '@/contexts/user-context';
import { useAppStore } from '@/contexts/zustand';
import { getGroupProgressByDate } from '@/controllers/group-progress-controllers';
import { completion, Group, Habit } from '@/types/interfaces';
import { router, Stack } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const CATEGORY_ICONS: Record<string, string> = {
  fitness: '💪',
  reading: '📚',
  mindfulness: '🧘',
  productivity: '⚡',
  health: '❤️',
  learning: '🎓',
  others: '📌',
};

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function HabitsScreen() {
  const { colors } = useTheme();
  const { userInfo } = useUser();
  const insets = useSafeAreaInsets();
  const { userGroupsZus, userHabitsZus } = useAppStore();

  if (!userInfo) return <Text>No User found</Text>;

  const getLast7Days = () => {
    const dates = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      dates.push({
        date: date.toISOString().split('T')[0],
        day: DAYS[date.getDay() === 0 ? 6 : date.getDay() - 1],
        dayNum: date.getDate(),
      });
    }
    return dates;
  };

  const last7Days = useMemo(() => getLast7Days(), []);

  // --- ⚙️ Nouveau state pour stocker les complétions ---
  const [habitCompletion, seHabitCompletion] = useState<Record<string, completion[]>>({});
  const [loading, setLoading] = useState(true);

  // --- ⚙️ Charge les progressions de chaque habit ---
  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const result: Record<string, completion[]> = {};

        for (const group of userGroupsZus) {
          for (const habit of userHabitsZus.filter(h => h.groupId === group.id)) {
            const completions = await getGroupProgressForWeek(habit.id, group.id);
            result[`${habit.id}-${group.id}`] = completions;
          }
        }

        seHabitCompletion(result);
      } catch (err) {
        console.error("Error loading habit progress:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, [userGroupsZus, userHabitsZus]);

  // --- Fonction utilitaire ---
  const getGroupProgressForWeek = async (habitId: string, groupId: string) => {
    const last7GroupProgress = await Promise.all(
      last7Days.map(({ date }) => getGroupProgressByDate(groupId, habitId, date))
    );

    let completions: completion[] = ["not_started","not_started","not_started","not_started","not_started","not_started","not_started"];
    if (last7GroupProgress.length === 0) return completions;

    const weekProgress: number[] = [];
    for (let i = 0; i <= 6; i++) {
      weekProgress.push(last7GroupProgress[i].data?.completionRate ?? -1);
    }

    completions = weekProgress.map(c =>
      c === 1 ? "good" : c === 0 ? "bad" : c === -1 ? "average" : "not_started"
    );

    return completions;
  };

  // --- 🧱 Rendu synchrone du habit ---
  const renderHabitCard = (habit: Habit, completions: completion[], groupId: string) => {
    const completionsColors = completions.map(c =>
      c == "good"
        ? colors.success
        : c == "bad"
        ? colors.error
        : c == "average"
        ? colors.warning
        : colors.textSecondary
    );

    const categoryIcon = CATEGORY_ICONS[habit.category] || '📌';

    return (
      <TouchableOpacity
        key={`${habit.id}-${groupId}`}
        style={[styles.habitCard, { backgroundColor: colors.card, borderColor: colors.border }]}
      >
        <View style={styles.habitHeader}>
          <View style={styles.habitTitleRow}>
            <View style={[styles.iconContainer, { backgroundColor: colors.primaryLight }]}>
              <Text style={styles.categoryIcon}>{categoryIcon}</Text>
            </View>
            <View style={styles.habitInfo}>
              <Text style={[styles.habitTitle, { color: colors.text }]}>{habit.name}</Text>
              <Text style={[styles.habitFrequency, { color: colors.textSecondary }]}>
                {habit.description}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.weekView}>
          {completions.map((completion, index) => {
            const dayInfo = last7Days[index];
            const isToday = dayInfo.date === new Date().toISOString().split('T')[0];

            return (
              <View key={habit.id + dayInfo.date} style={styles.dayColumn}>
                <Text style={[styles.dayLabel, { color: colors.textSecondary }]}>
                  {dayInfo.day}
                </Text>
                <View
                  style={[
                    styles.dayCircle,
                    {
                      borderColor: isToday ? colors.primary : colors.border,
                      backgroundColor: completionsColors[index] ?? colors.textSecondary,
                    },
                  ]}
                >
                  <Text style={styles.dayNum}>{dayInfo.dayNum}</Text>
                </View>
              </View>
            );
          })}
        </View>
      </TouchableOpacity>
    );
  };

  // --- 🧱 Rendu d’un groupe ---
  const renderGroupSection = (group: Group) => {
    const habitOfGroup = userHabitsZus.filter(h => h.groupId == group.id);
    if (habitOfGroup.length === 0) return null;

    return (
      <View key={group.id} style={styles.groupSection}>
        <View style={styles.groupHeader}>
          <View style={styles.groupHeaderContent}>
            <Text style={[styles.groupName, { color: colors.text }]}>{group.name}</Text>
          </View>
          <Text style={[styles.groupDescription, { color: colors.textSecondary }]}>
            {group.description}
          </Text>
        </View>

        {habitOfGroup.map(habit => {
          const completions =
            habitCompletion[`${habit.id}-${group.id}`] ||
            ["not_started","not_started","not_started","not_started","not_started","not_started","not_started"];
          return renderHabitCard(habit, completions, group.id);
        })}
      </View>
    );
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
        {loading ? (
          <Text style={{ textAlign: 'center', color: colors.text }}>Loading habits...</Text>
        ) : userGroupsZus.length > 0 ? (
          userGroupsZus.map(renderGroupSection)
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
  groupSection: { marginBottom: 24 },
  groupHeader: { paddingHorizontal: 16, paddingVertical: 12, marginBottom: 8 },
  groupHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  groupName: { fontSize: 20, fontWeight: '700', flex: 1 },
  groupDescription: { fontSize: 13, lineHeight: 18 },
  habitCard: {
    marginHorizontal: 16,
    marginVertical: 6,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  habitHeader: { marginBottom: 16 },
  habitTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryIcon: { fontSize: 20 },
  habitInfo: { flex: 1 },
  habitTitle: { fontSize: 17, fontWeight: '600', marginBottom: 2 },
  habitFrequency: { fontSize: 13 },
  weekView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  dayColumn: { alignItems: 'center', gap: 6 },
  dayLabel: { fontSize: 11, fontWeight: '500' },
  dayCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayNum: { fontSize: 13, fontWeight: '600' },
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
