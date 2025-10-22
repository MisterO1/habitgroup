import { useTheme } from '@/contexts/theme-context';
import { Habit } from '@/types/interfaces';
import { CheckCircle, Circle, MessageCircle } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface HabitCardProps {
  habit: Habit;
  completed: boolean;
  feeling?: string;
  hasComments: boolean;
  onPress: () => void;
  onToggle: () => void;
}

export default function HabitCard({ 
  habit, 
  completed, 
  feeling, 
  hasComments, 
  onPress, 
  onToggle 
}: HabitCardProps) {
  const { colors } = useTheme();

  const getFeelingEmoji = (feeling?: string) => {
    switch (feeling) {
      case 'great': return '😊';
      case 'good': return '😌';
      case 'okay': return '😐';
      case 'struggling': return '😓';
      case 'difficult': return '😰';
      default: return '';
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { 
          backgroundColor: colors.card,
          borderColor: completed ? colors.success : colors.border,
        }
      ]}
      onPress={onPress}
    >
      <View style={styles.content}>
        <View style={styles.habitInfo}>
          <Text style={[styles.habitName, { color: colors.text }]}>
            {habit.name}
          </Text>
          <Text style={[styles.habitCategory, { color: colors.textSecondary }]}>
            {habit.category}
          </Text>
          {feeling && (
            <Text style={[styles.feeling, { color: colors.textSecondary }]}>
              Feeling: {getFeelingEmoji(feeling)} {feeling}
            </Text>
          )}
        </View>
        
        <View style={styles.actions}>
          {hasComments && (
            <MessageCircle size={16} color={colors.textSecondary} style={styles.commentIcon} />
          )}
          
          <TouchableOpacity
            style={styles.toggleButton}
            onPress={onToggle}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            {completed ? (
              <CheckCircle size={24} color={colors.success} />
            ) : (
              <Circle size={24} color={colors.textSecondary} />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 4,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  habitInfo: {
    flex: 1,
    marginRight: 12,
  },
  habitName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  habitCategory: {
    fontSize: 14,
    marginBottom: 2,
  },
  feeling: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentIcon: {
    marginRight: 8,
  },
  toggleButton: {
    padding: 4,
  },
});
