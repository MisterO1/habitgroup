import { useHabits } from '@/contexts/habit-context';
import { useTheme } from '@/contexts/theme-context';
import { Category, Habit } from '@/types/interfaces';
import { Stack, router } from 'expo-router';
import { Plus, Save, X } from 'lucide-react-native';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const categories: Category[] = [
  { value: "fitness", label: "🏃‍♂️ Fitness & Exercise", description: "Build physical health habits" },
  { value: "reading", label: "📚 Reading & Learning", description: "Expand your knowledge" },
  { value: "health", label: "🏥 Health & Wellness", description: "Improve overall wellbeing" },
  { value: "productivity", label: "⚡ Productivity", description: "Get things done efficiently" },
  { value: "creativity", label: "🎨 Creativity & Arts", description: "Express your creative side" },
  { value: "learning", label: "🧠 Skill Development", description: "Master new abilities" },
  { value: "social", label: "👥 Social & Community", description: "Build connections" },
  { value: "other", label: "✨ Other", description: "Custom habit goals" }
];

export default function CreateGroupScreen() {
  const { colors } = useTheme();
  const { createGroup } = useHabits();
  const insets = useSafeAreaInsets();

  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [habits, setHabits] = useState<Habit[]>([
    {
      id: 'temp-1',
      title: '',
      description: '',
      startDate: '',
      endDate: '',
      dailyGoal: '',
      category: 'fitness',
      reminderTime: '',
      enableReminder: false,
    },
  ]);

  const addHabit = () => {
    const newHabit: Habit = {
      id: `temp-${Date.now()}`,
      title: '',
      description: '',
      startDate: '',
      endDate: '',
      dailyGoal: '',
      category: 'fitness',
      reminderTime: '',
      enableReminder: false,
    };
    setHabits(prev => [...prev, newHabit]);
  };

  const removeHabit = (id: string) => {
    if (habits.length > 1) {
      setHabits(habits.filter(h => h.id !== id));
    }
  };

  const updateHabit = (id: string, field: keyof Habit, value: string | boolean) => {
    setHabits(habits.map(h => h.id === id ? { ...h, [field]: value } : h));
  };

  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalType, setModalType] = useState<'error' | 'success'>('error');
  const [submitting, setSubmitting] = useState(false);

  const showMessage = (message: string, type: 'error' | 'success') => {
    if (!message?.trim() || message.length > 200) return;
    if (type !== 'error' && type !== 'success') return;
    const sanitizedMessage = message.trim();
    if (sanitizedMessage.length === 0) return;
    
    setModalMessage(sanitizedMessage);
    setModalType(type);
    setShowModal(true);
  };

  const handleCreate = async () => {
    if (submitting) return;
    setSubmitting(true);

    if (!groupName.trim() || !groupDescription.trim()) {
      showMessage('Please fill in group name and description.', 'error');
      setSubmitting(false);
      return;
    }

    const validHabits = habits.filter(h => h.title.trim() && h.description.trim() && h.startDate && h.endDate && h.dailyGoal.trim());
    if (validHabits.length === 0) {
      showMessage('Please add at least one complete habit.', 'error');
      setSubmitting(false);
      return;
    }

    // Validate reminder times (disabled for now)
    // for (const habit of validHabits) {
    //   if (habit.enableReminder && habit.reminderTime) {
    //     const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    //     if (!timeRegex.test(habit.reminderTime)) {
    //       showMessage(`Invalid reminder time format for habit "${habit.title}". Use HH:MM format.`, 'error');
    //       setSubmitting(false);
    //       return;
    //     }
    //   }
    // }

    const result = await createGroup({
      name: groupName.trim(),
      description: groupDescription.trim(),
      habits: validHabits.map(h => ({ ...h, id: Date.now().toString() + Math.random() })),
    });

    setSubmitting(false);

    if ('error' in result) {
      showMessage(result.error || 'An error occurred', 'error');
    } else {
      showMessage('Group created successfully!', 'success');
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <Stack.Screen 
        options={{ 
          title: 'Create Group',
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.text,
          headerRight: () => (
            <TouchableOpacity onPress={handleCreate} disabled={submitting} style={styles.saveButton}>
              <Save size={20} color={submitting ? colors.textSecondary : colors.primary} />
            </TouchableOpacity>
          ),
        }} 
      />

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Group Details</Text>
          
          <TextInput
            style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
            placeholder="Group Name"
            placeholderTextColor={colors.textSecondary}
            value={groupName}
            onChangeText={setGroupName}
          />
          
          <TextInput
            style={[styles.textArea, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
            placeholder="Group Description"
            placeholderTextColor={colors.textSecondary}
            value={groupDescription}
            onChangeText={setGroupDescription}
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Habits</Text>
            <TouchableOpacity onPress={addHabit} style={[styles.addButton, { backgroundColor: colors.primary }]}>
              <Plus size={20} color="white" />
            </TouchableOpacity>
          </View>

          {habits.map((habit, index) => (
            <View key={habit.id} style={[styles.habitCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.habitHeader}>
                <Text style={[styles.habitTitle, { color: colors.text }]}>Habit {index + 1}</Text>
                {habits.length > 1 && (
                  <TouchableOpacity onPress={() => removeHabit(habit.id)} style={styles.removeButton}>
                    <X size={16} color={colors.error} />
                  </TouchableOpacity>
                )}
              </View>

              <TextInput
                style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
                placeholder="Habit Title"
                placeholderTextColor={colors.textSecondary}
                value={habit.title}
                onChangeText={(value) => updateHabit(habit.id, 'title', value)}
              />

              <TextInput
                style={[styles.textArea, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
                placeholder="Habit Description"
                placeholderTextColor={colors.textSecondary}
                value={habit.description}
                onChangeText={(value) => updateHabit(habit.id, 'description', value)}
                multiline
                numberOfLines={2}
              />

              <View style={styles.row}>
                <TextInput
                  style={[styles.halfInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
                  placeholder="Start Date (YYYY-MM-DD)"
                  placeholderTextColor={colors.textSecondary}
                  value={habit.startDate}
                  onChangeText={(value) => updateHabit(habit.id, 'startDate', value)}
                />
                <TextInput
                  style={[styles.halfInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
                  placeholder="End Date (YYYY-MM-DD)"
                  placeholderTextColor={colors.textSecondary}
                  value={habit.endDate}
                  onChangeText={(value) => updateHabit(habit.id, 'endDate', value)}
                />
              </View>

              <TextInput
                style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
                placeholder="Daily Goal"
                placeholderTextColor={colors.textSecondary}
                value={habit.dailyGoal}
                onChangeText={(value) => updateHabit(habit.id, 'dailyGoal', value)}
              />

              <View style={styles.categoryContainer}>
                <Text style={[styles.categoryLabel, { color: colors.textSecondary }]}>Category:</Text>
                <View style={styles.categoryButtons}>
                  {categories.map(cat => (
                    <TouchableOpacity
                      key={cat.value}
                      style={[
                        styles.categoryButton,
                        { borderColor: colors.border },
                        habit.category === cat.value && { backgroundColor: colors.primary, borderColor: colors.primary }
                      ]}
                      onPress={() => updateHabit(habit.id, 'category', cat.value)}
                    >
                      <Text style={[
                        styles.categoryText,
                        { color: habit.category === cat.value ? 'white' : colors.text }
                      ]}>
                        {cat.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Reminder section disabled for now */}
              {/* <View style={styles.reminderContainer}>
                <View style={styles.reminderToggle}>
                  <Text style={[styles.reminderLabel, { color: colors.textSecondary }]}>Enable Reminder</Text>
                  <Switch
                    value={habit.enableReminder}
                    onValueChange={(value) => updateHabit(habit.id, 'enableReminder', value)}
                    trackColor={{ false: colors.border, true: colors.primary }}
                    thumbColor={habit.enableReminder ? 'white' : colors.textSecondary}
                  />
                </View>
                {habit.enableReminder && (
                  <TextInput
                    style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
                    placeholder="Reminder Time (HH:MM)"
                    placeholderTextColor={colors.textSecondary}
                    value={habit.reminderTime}
                    onChangeText={(value) => updateHabit(habit.id, 'reminderTime', value)}
                    keyboardType="numeric"
                  />
                )}
              </View> */}
            </View>
          ))}
        </View>
      </ScrollView>

      <Modal visible={showModal} transparent animationType="fade" onRequestClose={() => setShowModal(false)}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {modalType === 'error' ? 'Error' : 'Success'}
            </Text>
            <Text style={[styles.modalMessage, { color: colors.textSecondary }]}>
              {modalMessage}
            </Text>
            <TouchableOpacity 
              onPress={() => {
                setShowModal(false);
                if (modalType === 'success') {
                  router.back();
                }
              }}
              style={[styles.modalButton, { backgroundColor: modalType === 'error' ? colors.error : colors.primary }]}
            >
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  saveButton: {
    marginRight: 16,
  },
  section: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  halfInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    width: '48%',
  },
  habitCard: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  habitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  habitTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  removeButton: {
    padding: 4,
  },
  categoryContainer: {
    marginTop: 8,
  },
  categoryLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  categoryButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '500',
  },
  reminderContainer: {
    marginTop: 16,
  },
  reminderToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  reminderLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 300,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  modalMessage: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  modalButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  modalButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});