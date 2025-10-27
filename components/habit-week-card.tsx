import { useTheme } from "@/contexts/theme-context";
import { completion, Habit } from "@/types/interfaces";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const CATEGORY_ICONS: Record<string, string> = {
  fitness: '💪',
  reading: '📚',
  mindfulness: '🧘',
  productivity: '⚡',
  health: '❤️',
  learning: '🎓',
  others: '📌',
};

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface HabitWeekCardProps {
  habit: Habit;
  completions: completion[];
  groupId: string;
}

export default function HabitWeekCard({ habit, completions, groupId }: HabitWeekCardProps) {
  const { colors } = useTheme();

  const borderColors = completions.map(c =>
    c == "good"
      ? colors.good
      : c == "bad"
      ? colors.bad
      : c == "average"
      ? colors.average
      : colors.border
  );
  const bgColors = completions.map(c =>
    c == "good"
      ? colors.goodoff
      : c == "bad"
      ? colors.badoff
      : c == "average"
      ? colors.averageoff
      : "white"
  );

  const categoryIcon = CATEGORY_ICONS[habit.category] || '📌';

  // Get last 7 days
  const today = new Date();
  const last7Days: Array<{ date: string; day: string; dayNum: number }> = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    last7Days.push({
      date: date.toISOString().split('T')[0],
      day: DAYS[date.getDay()],
      dayNum: date.getDate(),
    });
  }

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

          return (
            <View key={habit.id + dayInfo.date} style={styles.dayColumn}>
              <Text style={[styles.dayLabel, { color: colors.textSecondary }]}>
                {dayInfo.day}
              </Text>
              <View
                style={[
                  styles.dayCircle,
                  {
                    borderColor: borderColors[index] ?? colors.border,
                    backgroundColor: bgColors[index] ?? colors.primary,
                  },
                ]}
              >
                <Text style={[styles.dayNum, { color: colors.text }]}>{dayInfo.dayNum}</Text>
              </View>
            </View>
          );
        })}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
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
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayNum: { fontSize: 13, fontWeight: '600' },
});

