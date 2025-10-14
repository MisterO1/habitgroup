import { useTheme } from '@/contexts/theme-context';
import { Habit } from '@/types/interfaces';
import { Save, X } from 'lucide-react-native';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface HabitDetailsDropdownProps {
  habit: Habit;
  groupId: string;
  completed: boolean;
  feeling?: string;
  comment?: string;
  onClose: () => void;
  onUpdate: (completed: boolean, feeling?: string, comment?: string) => void;
}

const feelingOptions = [
  { value: 'great', label: 'Great', emoji: '😊' },
  { value: 'good', label: 'Good', emoji: '😌' },
  { value: 'okay', label: 'Okay', emoji: '😐' },
  { value: 'struggling', label: 'Struggling', emoji: '😓' },
  { value: 'difficult', label: 'Difficult', emoji: '😰' },
];

export default function HabitDetailsDropdown({
  habit,
  groupId,
  completed,
  feeling,
  comment,
  onClose,
  onUpdate,
}: HabitDetailsDropdownProps) {
  const { colors } = useTheme();
  const [isCompleted, setIsCompleted] = useState(completed);
  const [selectedFeeling, setSelectedFeeling] = useState(feeling || '');
  const [commentText, setCommentText] = useState(comment || '');

  const handleSave = () => {
    onUpdate(isCompleted, selectedFeeling || undefined, commentText || undefined);
  };

  const handleToggleComplete = () => {
    setIsCompleted(!isCompleted);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Habit Details</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <X size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* Completion Toggle */}
        <TouchableOpacity 
          style={[styles.completionToggle, { backgroundColor: colors.card }]}
          onPress={handleToggleComplete}
        >
          <Text style={[styles.toggleText, { color: colors.text }]}>
            {isCompleted ? '✅ Completed' : '⭕ Not Completed'}
          </Text>
        </TouchableOpacity>

        {/* Feeling Selection */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>How did you feel?</Text>
          <View style={styles.feelingOptions}>
            {feelingOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.feelingOption,
                  { 
                    backgroundColor: selectedFeeling === option.value ? colors.primary : colors.card,
                    borderColor: colors.border,
                  }
                ]}
                onPress={() => setSelectedFeeling(
                  selectedFeeling === option.value ? '' : option.value
                )}
              >
                <Text style={[
                  styles.feelingText,
                  { 
                    color: selectedFeeling === option.value ? 'white' : colors.text 
                  }
                ]}>
                  {option.emoji} {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Comment Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Add a comment</Text>
          <TextInput
            style={[
              styles.commentInput,
              { 
                backgroundColor: colors.card,
                borderColor: colors.border,
                color: colors.text,
              }
            ]}
            placeholder="How did it go?"
            placeholderTextColor={colors.textSecondary}
            value={commentText}
            onChangeText={setCommentText}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: colors.primary }]}
          onPress={handleSave}
        >
          <Save size={20} color="white" />
          <Text style={styles.saveButtonText}>Save Changes</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 16,
  },
  completionToggle: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  toggleText: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  feelingOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  feelingOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  feelingText: {
    fontSize: 14,
    fontWeight: '500',
  },
  commentInput: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
    minHeight: 80,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
