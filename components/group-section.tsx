import { useTheme } from "@/contexts/theme-context";
import { useAppStore } from "@/contexts/zustand";
import { Group } from "@/types/interfaces";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import HabitWeekCard from "./habit-week-card";

interface GroupSectionProps {
  group: Group;
  completions: Record<string, any[]>;
}

export default function GroupSection({ group, completions }: GroupSectionProps) {
  const { colors } = useTheme();
  const { userHabitsZus } = useAppStore();

  const habitOfGroup = userHabitsZus.filter(h => h.groupId === group.id);
  
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
        const completionsData =
          completions[`${habit.id}-${group.id}`] ||
          ["not_started","not_started","not_started","not_started","not_started","not_started","not_started"];
        return <HabitWeekCard key={habit.id} habit={habit} completions={completionsData} groupId={group.id} />;
      })}
    </View>
  );
}

const styles = StyleSheet.create({
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
});

